import { useState } from 'react';
import { useBudget, useMemberDetails } from '../hooks';
import { Icon } from '@/ui/icon';
import { ConfirmationModal } from '@/ui/common';
import { formatCurrency, formatDate } from '../utils/formatting';
import type { Expense, UpdateExpenseDTO } from '@shared/types';

interface ExpenseRowProps {
  expense: Expense;
  baseCurrency: string;
  canEdit: boolean;
  canDelete: boolean;
}

const ExpenseRow = ({ expense, baseCurrency, canEdit, canDelete }: ExpenseRowProps) => {
  const { actionLoading, deleteExpense: performDelete, updateExpense: performUpdate, clearError } = useBudget();
  const { getMemberName } = useMemberDetails();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: expense.title || '',
    amount: String(expense.amount),
    category: expense.category || '',
    date: expense.date
      ? new Date(expense.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: expense.notes || '',
  });
  const [editError, setEditError] = useState<string | null>(null);

  const handleEditStart = () => {
    setEditForm({
      title: expense.title || '',
      amount: String(expense.amount),
      category: expense.category || '',
      date: expense.date
        ? new Date(expense.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      notes: expense.notes || '',
    });
    setEditError(null);
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    const amount = parseFloat(editForm.amount);
    if (!editForm.title.trim()) {
      setEditError('Title is required');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setEditError('Amount must be a positive number');
      return;
    }
    setEditError(null);

    const payload: Partial<UpdateExpenseDTO> = {};
    if (editForm.title.trim() !== (expense.title || '')) payload.title = editForm.title.trim();
    if (amount !== expense.amount) payload.amount = amount;
    if (editForm.category !== (expense.category || '')) payload.category = editForm.category || undefined;
    if (editForm.notes !== (expense.notes || '')) payload.notes = editForm.notes || undefined;
    if (editForm.date) payload.date = editForm.date;

    try {
      await performUpdate(expense._id, payload);
      setIsEditing(false);
      clearError();
    } catch (err) {
      console.error('Failed to update expense:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await performDelete(expense._id);
      setShowDeleteConfirm(false);
      clearError();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="px-6 py-4 bg-amber-50 border-l-4 border-amber-400">
        <p className="text-xs font-semibold text-amber-700 mb-3 uppercase tracking-wide">Editing expense</p>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                disabled={actionLoading}
                placeholder="Expense title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount ({baseCurrency}) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                disabled={actionLoading}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <input
                type="text"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                disabled={actionLoading}
                placeholder="e.g., accommodation"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                disabled={actionLoading}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <input
              type="text"
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
              disabled={actionLoading}
              placeholder="Optional notes"
            />
          </div>
          {editError && (
            <p className="text-xs text-red-600">{editError}</p>
          )}
          <p className="text-xs text-gray-400">
            Split method ({expense.splitMethod}) is preserved. Splits recalculate automatically if amount changes.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleEditSave}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {actionLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {actionLoading ? 'Saving…' : 'Save changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={actionLoading}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              onClick={canEdit ? handleEditStart : undefined}
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
