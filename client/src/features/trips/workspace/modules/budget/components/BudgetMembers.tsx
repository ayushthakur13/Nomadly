import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useBudget, useBudgetPermissions } from '../hooks';
import type { TripMember } from '@/services/members.service';
import { formatCurrency } from '../utils/formatting';
import { Icon } from '@/ui/icon';
import type { BudgetSnapshot } from '@shared/types';

interface BudgetMembersProps {
  snapshot: BudgetSnapshot;
  getMemberName: (userId: string) => string;
  membersWithDetails: Map<string, TripMember>;
}

// Shape used inside bulk-edit mode
interface BulkEntry {
  userId: string;
  originalPlanned: number;
  newPlanned: string;
  isPastMember: boolean;
}

const BudgetMembers = ({ snapshot, getMemberName, membersWithDetails }: BudgetMembersProps) => {
  const {
    actionLoading,
    updateMemberContribution: performUpdate,
    bulkUpdateMemberContributions,
    clearError,
  } = useBudget();
  const { isCreator, canEditContribution } = useBudgetPermissions(snapshot);
  const memberSummaries = snapshot?.memberSummaries ?? [];
  const budget = snapshot?.budget;

  // ── Individual edit state ──────────────────────────────────────────────
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // ── Bulk edit state ────────────────────────────────────────────────────
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEntries, setBulkEntries] = useState<BulkEntry[]>([]);
  const [deltaValue, setDeltaValue] = useState('');
  const [deltaSign, setDeltaSign] = useState<'increase' | 'decrease'>('increase');

  // Memoize permissions per-member to avoid O(n) lookups on each render
  const memberPermissionsMap = useMemo(() => {
    const map = new Map<string, boolean>();
    memberSummaries.forEach((member) => {
      map.set(member.userId, canEditContribution(member.userId));
    });
    return map;
  }, [memberSummaries, canEditContribution]);

  // ── Individual edit handlers ───────────────────────────────────────────
  const handleEditStart = (userId: string, currentValue: number) => {
    setEditingUserId(userId);
    setEditValue(currentValue.toString());
  };

  const handleSaveContribution = async (userId: string) => {
    const newAmount = parseFloat(editValue);
    if (isNaN(newAmount) || newAmount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      await performUpdate(userId, { plannedContribution: newAmount });
      setEditingUserId(null);
      clearError();
      toast.success('Contribution updated');
    } catch (err) {
      console.error('Failed to update contribution:', err);
    }
  };

  // ── Bulk edit handlers ─────────────────────────────────────────────────
  const handleEnterBulkEdit = () => {
    setBulkEntries(
      memberSummaries.map((m) => {
        const bm = budget?.members.find((x) => x.userId === m.userId);
        return {
          userId: m.userId,
          originalPlanned: m.planned,
          newPlanned: m.planned.toString(),
          isPastMember: bm?.isPastMember ?? false,
        };
      })
    );
    setDeltaValue('');
    setDeltaSign('increase');
    setBulkEditMode(true);
  };

  /**
   * Apply a uniform delta to all active (non-past) members' current input values.
   * Clamps results to 0 — won't produce negative planned contributions.
   */
  const handleApplyDelta = () => {
    const delta = parseFloat(deltaValue);
    if (isNaN(delta) || delta < 0) {
      toast.error('Enter a valid adjustment amount');
      return;
    }
    if (delta === 0) return;
    setBulkEntries((prev) =>
      prev.map((entry) => {
        if (entry.isPastMember) return entry;
        const current = parseFloat(entry.newPlanned);
        const base = isNaN(current) ? entry.originalPlanned : current;
        const next =
          deltaSign === 'increase'
            ? Math.max(0, base + delta)
            : Math.max(0, base - delta);
        return { ...entry, newPlanned: next % 1 === 0 ? next.toString() : next.toFixed(2) };
      })
    );
  };

  const handleBulkEntryChange = (userId: string, value: string) => {
    setBulkEntries((prev) =>
      prev.map((e) => (e.userId === userId ? { ...e, newPlanned: value } : e))
    );
  };

  const handleBulkSave = async () => {
    // Client-side validation pass
    const activeEntries = bulkEntries.filter((e) => !e.isPastMember);
    for (const entry of activeEntries) {
      const val = parseFloat(entry.newPlanned);
      if (isNaN(val) || val < 0) {
        toast.error('One or more entries have an invalid amount');
        return;
      }
    }

    // Only send entries that actually changed
    const changed = activeEntries.filter(
      (e) => Math.abs(parseFloat(e.newPlanned) - e.originalPlanned) > 0.001
    );

    if (changed.length === 0) {
      // Nothing to save — silently exit
      setBulkEditMode(false);
      return;
    }

    try {
      await bulkUpdateMemberContributions({
        updates: changed.map((e) => ({
          userId: e.userId,
          plannedContribution: parseFloat(e.newPlanned),
        })),
      });
      setBulkEditMode(false);
      clearError();
      toast.success(
        `Updated ${changed.length} contribution${changed.length > 1 ? 's' : ''}`
      );
    } catch (err) {
      console.error('Bulk update failed:', err);
    }
  };

  const handleBulkCancel = () => {
    setBulkEditMode(false);
    setBulkEntries([]);
    setDeltaValue('');
  };

  const currency = budget?.baseCurrency || 'INR';

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

  const hasAnyChange = bulkEntries.some(
    (e) => !e.isPastMember && Math.abs(parseFloat(e.newPlanned || '0') - e.originalPlanned) > 0.001
  );

  // ── Render: Bulk Edit Mode ─────────────────────────────────────────────
  if (bulkEditMode) {
    return (
      <div className="space-y-0">
        {/* ── Back header ── */}
        <div className="pb-3 mb-1 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={handleBulkCancel}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40 transition-colors"
          >
            <Icon name="chevronLeft" size={13} />
            Back
          </button>
          <p className="text-xs font-medium text-gray-700">Adjust all contributions</p>
        </div>
        {/* ── Delta adjuster toolbar ── */}
        <div className="pb-3 mb-1 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Adjust all active members by a fixed amount:</p>
          <div className="flex items-center gap-2 flex-wrap">
            {/* +/- toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium shrink-0">
              <button
                onClick={() => setDeltaSign('increase')}
                className={`px-3 py-1.5 transition-colors ${
                  deltaSign === 'increase'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                + Increase
              </button>
              <button
                onClick={() => setDeltaSign('decrease')}
                className={`px-3 py-1.5 transition-colors ${
                  deltaSign === 'decrease'
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                − Decrease
              </button>
            </div>

            <input
              type="number"
              min="0"
              value={deltaValue}
              onChange={(e) => setDeltaValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyDelta()}
              className="w-28 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
              placeholder="Amount"
            />

            <button
              onClick={handleApplyDelta}
              disabled={!deltaValue || isNaN(parseFloat(deltaValue))}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors shrink-0"
            >
              Apply to all
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Results below 0 are automatically clamped to 0. Past members are excluded.
          </p>
        </div>

        {/* ── Member input rows ── */}
        <div className="divide-y divide-gray-100">
          {bulkEntries.map((entry) => {
            const name = getMemberName(entry.userId);
            const initials = getInitials(name);
            const memberDetail = membersWithDetails.get(entry.userId);
            const newVal = parseFloat(entry.newPlanned);
            const isValidVal = !isNaN(newVal) && newVal >= 0;
            const isChanged =
              isValidVal && Math.abs(newVal - entry.originalPlanned) > 0.001;

            // Warn if this would deepen a deficit (client-side pre-check)
            const memberSummary = memberSummaries.find((m) => m.userId === entry.userId);
            const spent = memberSummary?.spent ?? 0;
            const wouldDeepen =
              isValidVal &&
              newVal < spent &&
              newVal < entry.originalPlanned;

            return (
              <div key={entry.userId} className="py-3 first:pt-1">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full overflow-hidden border border-gray-200 ${
                      entry.isPastMember ? 'opacity-40' : ''
                    }`}
                  >
                    {memberDetail?.profilePicUrl ? (
                      <img src={memberDetail.profilePicUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                        <span className="text-[11px] font-semibold text-emerald-700">{initials}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className={`text-sm font-medium truncate ${
                          entry.isPastMember ? 'text-gray-400' : 'text-gray-800'
                        }`}
                      >
                        {name}
                      </p>
                      {entry.isPastMember && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 shrink-0">
                          Past member
                        </span>
                      )}
                      {isChanged && !entry.isPastMember && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 shrink-0">
                          Changed
                        </span>
                      )}
                    </div>

                    {entry.isPastMember ? (
                      <p className="text-xs text-gray-400">
                        {formatCurrency(entry.originalPlanned, currency)}
                        <span className="ml-1 text-gray-300">— locked</span>
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={entry.newPlanned}
                          onChange={(e) => handleBulkEntryChange(entry.userId, e.target.value)}
                          disabled={actionLoading}
                          className={`w-full px-2.5 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 ${
                            wouldDeepen
                              ? 'border-amber-300 focus:ring-amber-200'
                              : 'border-gray-200 focus:ring-emerald-300'
                          }`}
                          placeholder="Planned amount"
                        />
                        <span className="text-xs text-gray-400 shrink-0">
                          was {formatCurrency(entry.originalPlanned, currency)}
                        </span>
                      </div>
                    )}

                    {wouldDeepen && (
                      <p className="text-[11px] text-amber-600 mt-0.5 flex items-center gap-1">
                        <Icon name="alertTriangle" size={11} />
                        Below spent ({formatCurrency(spent, currency)}) — server will reject
                      </p>
                    )}
                    {isValidVal && isChanged && !entry.isPastMember && !wouldDeepen && (
                      <p
                        className={`text-[11px] mt-0.5 ${
                          newVal - spent >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {newVal - spent >= 0 ? '+' : ''}
                        {formatCurrency(newVal - spent, currency)} remaining
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bulk edit footer ── */}
        <div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400">
            {hasAnyChange
              ? `${
                  bulkEntries.filter(
                    (e) =>
                      !e.isPastMember &&
                      Math.abs(parseFloat(e.newPlanned || '0') - e.originalPlanned) > 0.001
                  ).length
                } change(s) pending`
              : 'No changes yet'}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleBulkCancel}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkSave}
              disabled={actionLoading || !hasAnyChange}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? 'Saving...' : 'Save all'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Normal Mode ────────────────────────────────────────────────
  return (
    <div className="divide-y divide-gray-100">
      {/* Creator-only bulk edit entry point */}
      {isCreator && memberSummaries.length > 0 && (
        <div className="pb-3 first:pt-0 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {memberSummaries.filter(
              (m) => !(budget?.members.find((bm) => bm.userId === m.userId)?.isPastMember)
            ).length}{' '}
            active members
          </p>
          <button
            onClick={handleEnterBulkEdit}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 transition-colors"
          >
            <Icon name="edit2" size={12} />
            Adjust all
          </button>
        </div>
      )}

      {memberSummaries.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No members in this budget</p>
      ) : (
        memberSummaries.map((member) => {
          const name = getMemberName(member.userId);
          const initials = getInitials(name);
          const memberDetail = membersWithDetails.get(member.userId);
          const canEdit = memberPermissionsMap.get(member.userId) ?? false;
          const isEditing = editingUserId === member.userId;

          const spentPct =
            member.planned > 0
              ? Math.min(Math.round((member.spent / member.planned) * 100), 100)
              : member.spent > 0
                ? 100
                : 0;
          const isOver = member.remaining < 0;
          const isWarning = !isOver && spentPct >= 80;
          const barColor = isOver
            ? 'bg-red-400'
            : isWarning
              ? 'bg-amber-400'
              : 'bg-emerald-400';

          return (
            <div key={member.userId} className="py-4 first:pt-1 last:pb-1">
              {/* ── Row header: avatar + name + remaining badge + edit trigger ── */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-9 w-9 rounded-full overflow-hidden border border-gray-200">
                  {memberDetail?.profilePicUrl ? (
                    <img
                      src={memberDetail.profilePicUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                      <span className="text-xs font-semibold text-emerald-700 tracking-wide">{initials}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isOver
                            ? 'bg-red-50 text-red-600'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isOver ? '' : '+'}{formatCurrency(member.remaining, currency)}
                      </span>

                      {canEdit && !isEditing && (
                        <button
                          onClick={() => handleEditStart(member.userId, member.planned)}
                          disabled={actionLoading}
                          className="p-1 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                          title="Edit contribution"
                        >
                          <Icon name="edit2" size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium">
                        <span className="text-gray-400">Planned</span>
                        <span className="text-gray-700">{formatCurrency(member.planned, currency)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-[11px] font-medium">
                        <span className="text-rose-400">Spent</span>
                        <span className="text-rose-600">{formatCurrency(member.spent, currency)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Progress bar (view mode) ── */}
              {!isEditing && (member.planned > 0 || member.spent > 0) && (
                <div className="mt-2.5 ml-12">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${spentPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {isOver
                      ? `${formatCurrency(Math.abs(member.remaining), currency)} over budget`
                      : `${spentPct}% used`}
                  </p>
                </div>
              )}

              {/* ── Individual edit mode ── */}
              {isEditing && (
                <div className="mt-3 ml-12 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                      placeholder="Planned amount"
                      disabled={actionLoading}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveContribution(member.userId)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingUserId(null)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {(() => {
                    const previewAmount = parseFloat(editValue);
                    if (isNaN(previewAmount) || previewAmount < 0) return null;
                    const previewRemaining = previewAmount - member.spent;
                    return (
                      <p className={`text-xs font-medium ${
                        previewRemaining >= 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {previewRemaining >= 0 ? '+' : ''}{formatCurrency(previewRemaining, currency)} remaining
                        {previewRemaining < 0 && ' — over budget'}
                      </p>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default BudgetMembers;
