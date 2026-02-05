import { useState } from 'react';
import toast from 'react-hot-toast';
import type { BudgetSnapshot } from '@shared/types';
import { Icon } from '@/ui/icon';
import { ConfirmationModal } from '@/ui/common';
import { formatCurrency } from '../utils/formatting';

interface BudgetHeaderProps {
  snapshot: BudgetSnapshot | null;
  canEditBaseBudget: boolean;
  actionLoading: boolean;
  onUpdateBaseBudget: (amount: number) => Promise<void>;
  onClearBaseBudget: () => Promise<void>;
}

const BudgetHeader = ({
  snapshot,
  canEditBaseBudget,
  actionLoading,
  onUpdateBaseBudget,
  onClearBaseBudget,
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
  
  // Calculate mismatch details
  const difference = hasBaseBudget ? baseBudgetAmount - summary.totalPlanned : 0;
  const isMismatch = hasBaseBudget && Math.abs(difference) > 0.01;
  const isShort = isMismatch && difference > 0;
  const hasBuffer = isMismatch && difference < 0;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Planned */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Planned</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {formatCurrency(summary.totalPlanned, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Trip plan target</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Spent</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">
            {formatCurrency(summary.totalSpent, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Logged so far</p>
        </div>

        {/* Remaining */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Remaining</p>
          <p className={`text-2xl font-semibold mt-1 ${summary.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(summary.remaining, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Headroom left</p>
        </div>
      </div>

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
