import { useState } from 'react';
import { useBudget, useMemberDetails } from '../hooks';
import { Icon } from '@/ui/icon';
import { ConfirmationModal } from '@/ui/common';
import { formatCurrency, formatDate } from '../utils/formatting';
import type { Expense } from '@shared/types';

interface ExpenseRowProps {
  expense: Expense;
  baseCurrency: string;
  canEdit: boolean;
  canDelete: boolean;
}

const ExpenseRow = ({ expense, baseCurrency, canEdit, canDelete }: ExpenseRowProps) => {
  const { actionLoading, deleteExpense: performDelete, clearError } = useBudget();
  const { getMemberName } = useMemberDetails();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await performDelete(expense._id);
      setShowDeleteConfirm(false);
      clearError();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  return (
    <>
      <div className="px-6 py-4 hover:bg-gray-50 transition">
        {/* Main info */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-gray-900 font-semibold">{expense.title || 'Untitled'}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(expense.date)} • {expense.category ? `${expense.category}` : 'No category'} • Paid by {getMemberName(expense.paidBy)}
            </p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(expense.amount, baseCurrency)}
          </p>
        </div>

        {/* Splits breakdown */}
        {expense.splits && expense.splits.length > 0 && (
          <div className="mb-3 bg-gray-50 rounded p-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">Split breakdown:</p>
            <div className="grid grid-cols-2 gap-2">
              {expense.splits.map((split) => (
                <div key={split.userId} className="text-sm">
                  <span className="text-gray-600">{getMemberName(split.userId)}:</span>
                  <span className="font-semibold text-gray-900 ml-1">{formatCurrency(split.amount, baseCurrency)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {expense.notes && (
          <p className="text-sm text-gray-600 italic mb-3">"{expense.notes}"</p>
        )}

        {/* Split method badge */}
        <div className="flex items-center justify-between">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
            {expense.splitMethod === 'equal' ? 'Equal Split' : expense.splitMethod === 'percentage' ? 'Percentage Split' : 'Custom Split'}
          </span>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              title={canEdit ? 'Edit expense' : 'You cannot edit this expense'}
              disabled={actionLoading || !canEdit}
            >
              <Icon name="edit2" size={16} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
              title={canDelete ? 'Delete expense' : 'You cannot delete this expense'}
              disabled={actionLoading || !canDelete}
            >
              <Icon name="delete" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Expense?"
        description={`Are you sure you want to delete "${expense.title || 'Untitled'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default ExpenseRow;
