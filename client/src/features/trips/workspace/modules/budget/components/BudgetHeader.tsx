import { useState } from 'react';
import toast from 'react-hot-toast';
import type { BudgetSnapshot } from '@shared/types';
import type { TripMember } from '@/services/members.service';
import { Icon } from '@/ui/icon';
import { ConfirmationModal, InfoModal } from '@/ui/common';
import { formatCurrency, getCategoryDot } from '../utils/formatting';

interface BudgetHeaderProps {
  snapshot: BudgetSnapshot | null;
  canEditBaseBudget: boolean;
  actionLoading: boolean;
  getMemberName: (userId: string) => string;
  membersWithDetails: Map<string, TripMember>;
  onUpdateBaseBudget: (amount: number) => Promise<void>;
  onClearBaseBudget: () => Promise<void>;
  onOpenContributions: () => void;
}

const BudgetHeader = ({
  snapshot,
  canEditBaseBudget,
  actionLoading,
  getMemberName,
  membersWithDetails,
  onUpdateBaseBudget,
  onClearBaseBudget,
  onOpenContributions,
}: BudgetHeaderProps) => {
  if (!snapshot) return null;

  const summary = snapshot.summary ?? {
    totalPlanned: 0,
    totalSpent: 0,
    remaining: 0,
  };
  const currency = snapshot.budget?.baseCurrency || 'INR';
  const baseBudgetAmount = snapshot.budget?.baseBudgetAmount ?? null;
  const hasBaseBudget = baseBudgetAmount !== null && baseBudgetAmount !== undefined;
  
  // Calculate budget vs contributions delta
  const difference = hasBaseBudget ? baseBudgetAmount - summary.totalPlanned : 0;
  const isShort = hasBaseBudget && difference > 0.01;
  const hasBuffer = hasBaseBudget && difference < -0.01;

  // Category breakdown — all categories sorted by spend desc
  // Normalize: no category and 'Other' both group under 'Other'
  const categoryTotals: Record<string, number> = {};
  for (const exp of snapshot.expenses ?? []) {
    const key = exp.category && exp.category !== 'Other' ? exp.category : 'Other';
    categoryTotals[key] = (categoryTotals[key] || 0) + exp.amount;
  }
  const allCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategories = allCategories.slice(0, 3);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSpendersModal, setShowSpendersModal] = useState(false);

  const handleStartEdit = () => {
    setEditValue(hasBaseBudget ? String(baseBudgetAmount) : '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    const amount = parseFloat(editValue);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }
    await onUpdateBaseBudget(amount);
    setIsEditing(false);
  };

  const handleClear = async () => {
    setShowConfirmModal(false);
    await onClearBaseBudget();
    setIsEditing(false);
    setEditValue('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Trip base budget</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {hasBaseBudget ? formatCurrency(baseBudgetAmount, currency) : 'No budget target set'}
            </p>
            {isShort && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                You're {formatCurrency(Math.abs(difference), currency)} short of the trip budget target.
              </p>
            )}
            {hasBuffer && (
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                You have a {formatCurrency(Math.abs(difference), currency)} buffer over the trip budget.
              </p>
            )}
          </div>
          {canEditBaseBudget && (
            <div className="flex flex-wrap items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Icon name="edit2" size={14} />
                    Edit
                  </button>
                  {hasBaseBudget && (
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Icon name="delete" size={14} />
                      Remove
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Enter amount"
                    disabled={actionLoading}
                  />
                  <button
                    onClick={handleSave}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Planned — clickable, opens contributions overlay */}
        <button
          type="button"
          onClick={onOpenContributions}
          className="block text-left bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-500 text-xs uppercase tracking-wide">Committed</p>
            <Icon name="chevronRight" size={13} className="text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {formatCurrency(summary.totalPlanned, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Amount Collected</p>
        </button>

        {/* Total Spent — clickable, opens spenders list */}
        <button
          type="button"
          onClick={() => snapshot.memberSummaries?.some((m) => m.spent > 0) && setShowSpendersModal(true)}
          disabled={!snapshot.memberSummaries?.some((m) => m.spent > 0)}
          className="block text-left bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors disabled:cursor-default"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-500 text-xs uppercase tracking-wide">Spent</p>
            <Icon name="chevronRight" size={13} className={snapshot.memberSummaries?.some((m) => m.spent > 0) ? 'text-gray-400' : 'opacity-0'} />
          </div>
          <p className="text-2xl font-semibold text-red-600 mt-1">
            {formatCurrency(summary.totalSpent, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Logged so far</p>
        </button>

        {/* Remaining */}
        <div className="text-left bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-500 text-xs uppercase tracking-wide">Remaining</p>
            <Icon name="chevronRight" size={13} className="opacity-0" />
          </div>
          <p className={`text-2xl font-semibold mt-1 ${summary.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(summary.remaining, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Headroom left</p>
        </div>

        {/* By Category — clickable, opens breakdown overlay */}
        <button
          type="button"
          onClick={() => allCategories.length > 0 && setShowCategoryModal(true)}
          className="block text-left bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors disabled:cursor-default"
          disabled={allCategories.length === 0}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-500 text-xs uppercase tracking-wide">By Category</p>
            <Icon name="chevronRight" size={13} className={allCategories.length > 0 ? 'text-gray-400' : 'opacity-0'} />
          </div>
          {topCategories.length === 0 ? (
            <p className="text-sm text-gray-400 mt-2">No spending yet</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {topCategories.map(([cat, total]) => (
                <li key={cat} className="flex items-center justify-between text-sm gap-2">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getCategoryDot(cat)}`} />
                    <span className="text-gray-600 truncate">{cat}</span>
                  </span>
                  <span className="font-semibold text-gray-900 shrink-0">{formatCurrency(total, currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </button>
      </div>

      {/* Category breakdown modal */}
      <InfoModal
        isOpen={showCategoryModal}
        title="Spending by category"
        subtitle={`${allCategories.length} ${allCategories.length === 1 ? 'category' : 'categories'} · ${formatCurrency(summary.totalSpent, currency)} total`}
        onClose={() => setShowCategoryModal(false)}
      >
        <ul className="space-y-3">
          {allCategories.map(([cat, total]) => {
            const pct = summary.totalSpent > 0 ? +((total / summary.totalSpent) * 100).toFixed(1) : 0;
            return (
              <li key={cat} className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${getCategoryDot(cat)}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{cat}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{pct}% of total spend</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 shrink-0">{formatCurrency(total, currency)}</span>
              </li>
            );
          })}
        </ul>
      </InfoModal>

      {/* Spenders modal */}
      <InfoModal
        isOpen={showSpendersModal}
        title="Spending per member"
        subtitle={`${snapshot.memberSummaries?.filter((m) => m.spent > 0).length ?? 0} members · ${formatCurrency(summary.totalSpent, currency)} total`}
        onClose={() => setShowSpendersModal(false)}
      >
        <ul className="space-y-4">
          {[...(snapshot.memberSummaries ?? [])]
            .sort((a, b) => b.spent - a.spent)
            .map((m) => {
              const pct = summary.totalSpent > 0 ? +((m.spent / summary.totalSpent) * 100).toFixed(1) : 0;
              const name = getMemberName(m.userId);
              const memberDetail = membersWithDetails.get(m.userId);
              const initials = name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0].toUpperCase())
                .join('');
              return (
                <li key={m.userId} className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden border border-gray-200">
                    {memberDetail?.profilePicUrl ? (
                      <img src={memberDetail.profilePicUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                        <span className="text-[11px] font-semibold text-emerald-700">{initials}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate flex-1">{name}</p>
                  <div className="flex items-baseline gap-1.5 shrink-0">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(m.spent, currency)}</span>
                    <span className="text-xs text-gray-400">{pct}%</span>
                  </div>
                </li>
              );
            })}
        </ul>
      </InfoModal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Remove trip budget target?"
        description="Contributions and expenses will stay unchanged."
        confirmText="Remove"
        cancelText="Cancel"
        isWarning={true}
        isLoading={actionLoading}
        onConfirm={handleClear}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default BudgetHeader;
