import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useBudget, useMemberDetails, useBudgetPermissions } from '../hooks';
import { formatCurrency } from '../utils/formatting';
import type { BudgetSnapshot } from '@shared/types';

interface BudgetMembersProps {
  snapshot: BudgetSnapshot;
}

const BudgetMembers = ({ snapshot }: BudgetMembersProps) => {
  const { actionLoading, updateMemberContribution: performUpdate, clearError } = useBudget();
  const { getMemberName } = useMemberDetails();
  const { canEditContribution } = useBudgetPermissions(snapshot);
  const memberSummaries = snapshot?.memberSummaries ?? [];
  const budget = snapshot?.budget;
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Memoize permissions for each member to avoid O(n) lookups on each render
  const memberPermissionsMap = useMemo(() => {
    const map = new Map<string, boolean>();
    memberSummaries.forEach((member) => {
      map.set(member.userId, canEditContribution(member.userId));
    });
    return map;
  }, [memberSummaries, canEditContribution]);

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Members</h2>
        <p className="text-xs text-gray-500 mt-1">Planned vs spent per traveler</p>
      </div>

      <div className="divide-y divide-gray-200">
        {memberSummaries.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No members in this budget
          </div>
        ) : (
          memberSummaries.map((member) => (
            <div key={member.userId} className="px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">{getMemberName(member.userId)}</p>
                <span className={`text-sm font-semibold ${member.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {member.remaining >= 0 ? '+' : ''}{formatCurrency(member.remaining, budget?.baseCurrency || 'INR')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {editingUserId === member.userId ? (
                  <div className="col-span-2 flex gap-2">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Planned amount"
                      disabled={actionLoading}
                    />
                    <button
                      onClick={() => handleSaveContribution(member.userId)}
                      disabled={actionLoading}
                      className="px-2 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingUserId(null)}
                      disabled={actionLoading}
                      className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-gray-600">Planned</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(member.planned, budget?.baseCurrency || 'INR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Spent</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(member.spent, budget?.baseCurrency || 'INR')}</p>
                    </div>
                    <button
                      onClick={() => handleEditStart(member.userId, member.planned)}
                      disabled={actionLoading || !memberPermissionsMap.get(member.userId)}
                      className="col-span-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium disabled:opacity-50"
                    >
                      {memberPermissionsMap.get(member.userId) ? 'Edit Contribution' : 'Read-only'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetMembers;
