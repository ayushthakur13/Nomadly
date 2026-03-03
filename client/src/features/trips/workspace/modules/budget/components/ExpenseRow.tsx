import { useState } from 'react';
import { useBudget } from '../hooks';
import { Icon } from '@/ui/icon';
import { ConfirmationModal } from '@/ui/common';
import { formatCurrency, formatDate, getCategoryDot } from '../utils/formatting';
import { EXPENSE_CATEGORIES, SPLIT_METHOD_LABELS } from '../utils/constants';
import type { Expense, UpdateExpenseDTO } from '@shared/types';

interface ExpenseRowProps {
  expense: Expense;
  baseCurrency: string;
  canEdit: boolean;
  canDelete: boolean;
  getMemberName: (userId: string) => string;
}

const ExpenseRow = ({ expense, baseCurrency, canEdit, canDelete, getMemberName }: ExpenseRowProps) => {
  const { actionLoading, deleteExpense: performDelete, updateExpense: performUpdate, clearError } = useBudget();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editForm, setEditForm] = useState({
    title: expense.title || '',
    amount: String(expense.amount),
    category: expense.category || '',
    date: expense.date
      ? new Date(expense.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: expense.notes || '',
  });
  const [editSplits, setEditSplits] = useState<{ userId: string; amount: string }[]>([]);
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
    setEditSplits(
      expense.splitMethod === 'custom'
        ? expense.splits.map((s) => ({ userId: s.userId, amount: String(s.amount) }))
        : []
    );
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
    if (editForm.notes !== (expense.notes || '')) payload.notes = editForm.notes; // send '' explicitly to clear
    if (editForm.date) payload.date = editForm.date;

    if (expense.splitMethod === 'custom') {
      const splitsTotal = editSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
      if (splitsTotal > amount + 0.01) {
        setEditError(`Split amounts exceed the total. Reduce by ${formatCurrency(splitsTotal - amount, baseCurrency)}.`);
        return;
      }
      payload.splits = editSplits.map((s) => ({ userId: s.userId, amount: parseFloat(s.amount) }));
    }

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

  const dotColor = getCategoryDot(expense.category);

  return (
    <>
      <div className={`rounded-xl transition-colors duration-150 ${isExpanded || isEditing ? 'bg-gray-50 ring-1 ring-gray-200' : ''}`}>
        {/* ── Collapsed row (always visible) ── */}
        <button
          type="button"
          onClick={() => { if (!isEditing) setIsExpanded((v) => !v); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left group ${
            isEditing ? 'cursor-default' : isExpanded ? 'hover:bg-gray-100/60' : 'hover:bg-gray-50'
          }`}
        >
          {/* Category dot */}
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{expense.title || 'Untitled'}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Paid by {getMemberName(expense.paidBy)}&nbsp;&middot;&nbsp;{formatDate(expense.date)}
              {expense.category ? <>&nbsp;&middot;&nbsp;{expense.category}</> : null}
            </p>
          </div>

          {/* Amount */}
          <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
            {formatCurrency(expense.amount, baseCurrency)}
          </p>

          {/* Expand chevron — hidden while editing */}
          {!isEditing && (
            <Icon
              name="chevronDown"
              size={14}
              className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          )}
        </button>

        {/* ── Edit form panel ── */}
        {isEditing && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                  disabled={actionLoading}
                  placeholder="Expense title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Amount ({baseCurrency}) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                  disabled={actionLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                  disabled={actionLoading}
                >
                  <option value="">Other</option>
                  {editForm.category && !EXPENSE_CATEGORIES.includes(editForm.category as typeof EXPENSE_CATEGORIES[number]) && (
                    <option value={editForm.category}>{editForm.category}</option>
                  )}
                  {EXPENSE_CATEGORIES.filter((cat) => cat !== 'Other').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                  disabled={actionLoading}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <input
                type="text"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                disabled={actionLoading}
                placeholder="Optional notes"
              />
            </div>
            {editError && <p className="text-xs text-red-500">{editError}</p>}

            {/* Custom split editor */}
            {expense.splitMethod === 'custom' && editSplits.length > 0 && (() => {
              const amount = parseFloat(editForm.amount) || 0;
              const splitsTotal = editSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
              const remaining = Math.round((amount - splitsTotal) * 100) / 100;
              const isBalanced = Math.abs(remaining) <= 0.01;
              return (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Custom split amounts</p>
                  <div className="flex flex-col gap-1.5 mb-2">
                    {editSplits.map((split, i) => (
                      <div key={split.userId} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 flex-1 truncate">{getMemberName(split.userId)}</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={split.amount}
                          onChange={(e) => {
                            const updated = editSplits.map((s, j) =>
                              j === i ? { ...s, amount: e.target.value } : s
                            );
                            setEditSplits(updated);
                          }}
                          className="w-28 px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white text-right focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                          disabled={actionLoading}
                        />
                      </div>
                    ))}
                  </div>
                  {!isBalanced && (
                    remaining < -0.01
                      ? (
                        <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-red-50 text-red-600">
                          <span>Splits exceed the total — save blocked</span>
                          <span className="font-medium">{formatCurrency(Math.abs(remaining), baseCurrency)} over</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-amber-50 text-amber-700">
                          <span>Some amount unassigned — still saveable</span>
                          <span className="font-medium">{formatCurrency(remaining, baseCurrency)} unassigned</span>
                        </div>
                      )
                  )}
                </div>
              );
            })()}
            <p className="text-xs text-gray-400">
              {expense.splitMethod === 'custom'
                ? "Custom split · the amounts below are pre-scaled — adjust them as needed before saving"
                : 'Equal split · shares recalculate automatically if amount changes'}
            </p>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditSave}
                  disabled={actionLoading || (expense.splitMethod === 'custom' && editSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0) > (parseFloat(editForm.amount) || 0) + 0.01)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {actionLoading ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Expanded detail panel ── */}
        {isExpanded && !isEditing && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-200">
            {/* Splits breakdown */}
            {expense.splits && expense.splits.length > 0 && (
              <div className="pt-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Split breakdown</p>
                <div className="flex flex-col gap-1.5">
                  {expense.splits.map((split) => (
                    <div key={split.userId} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{getMemberName(split.userId)}</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(split.amount, baseCurrency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {expense.notes && (
              <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3">
                {expense.notes}
              </p>
            )}

            {/* Footer: split method + actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                {SPLIT_METHOD_LABELS[expense.splitMethod] ?? expense.splitMethod}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={canEdit ? handleEditStart : undefined}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg disabled:opacity-40 transition-colors"
                  title={canEdit ? 'Edit expense' : 'You cannot edit this expense'}
                  disabled={actionLoading || !canEdit}
                >
                  <Icon name="edit2" size={13} />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-40 transition-colors"
                  title={canDelete ? 'Delete expense' : 'You cannot delete this expense'}
                  disabled={actionLoading || !canDelete}
                >
                  <Icon name="delete" size={13} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
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
