import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useBudget } from '../hooks';
import { Icon } from '@/ui/icon';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { getCategoryDot } from '../utils/formatting';
import type { BudgetMember, CreateExpenseDTO, ExpenseSplit } from '@shared/types';

interface CreateExpenseModalProps {
  members: BudgetMember[];
  getMemberName: (userId: string) => string;
  onClose: () => void;
}

const CreateExpenseModal = ({ members, getMemberName, onClose }: CreateExpenseModalProps) => {
  const { tripId } = useParams<{ tripId: string }>();
  const { actionLoading, createExpense: performCreate, clearError } = useBudget();

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    paidBy: members[0]?.userId || '',
    splitMethod: 'equal' as 'equal' | 'custom',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Track split inputs as raw strings (convert to numbers on submit)
  const [splitInputs, setSplitInputs] = useState<Record<string, string>>({});

  const activeSplitMembers = members.filter((m) => !m.isPastMember);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, amount: e.target.value });
  };

  const handleSplitInputChange = (memberId: string, value: string) => {
    setSplitInputs((prev) => ({ ...prev, [memberId]: value }));
  };

  const handleSubmit = async () => {
    const amount = parseFloat(formData.amount);
    if (!formData.title.trim()) {
      toast.error('Please enter an expense title');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    // Validate split totals before sending to server
    if (formData.splitMethod === 'custom') {
      const splitTotal = activeSplitMembers.reduce(
        (sum, m) => sum + (parseFloat(splitInputs[m.userId] || '0') || 0),
        0
      );
      if (Math.abs(splitTotal - amount) > 0.01) {
        toast.error(`Custom split amounts must sum to ${amount.toFixed(2)}. Current total: ${splitTotal.toFixed(2)}`);
        return;
      }
    }

    // Build splits array based on split method
    let splits: ExpenseSplit[] | undefined = undefined;

    if (formData.splitMethod === 'custom') {
      splits = activeSplitMembers.map((member) => ({
        userId: member.userId,
        amount: parseFloat(splitInputs[member.userId] || '0'),
      }));
    }
    // For 'equal', splits is undefined and backend handles it

    const payload: CreateExpenseDTO = {
      title: formData.title,
      amount,
      category: formData.category || 'Other',
      paidBy: formData.paidBy,
      splitMethod: formData.splitMethod,
      date: formData.date,
      notes: formData.notes || undefined,
      splits,
    };

    try {
      await performCreate(payload);
      onClose();
      clearError();
    } catch (err) {
      console.error('Failed to create expense:', err);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => onClose()}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add expense</h2>
          <button
            onClick={onClose}
            disabled={actionLoading}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Title + Amount */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Hotel booking"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 transition-all"
                disabled={actionLoading}
                autoFocus
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                Amount <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 transition-all"
                disabled={actionLoading}
              />
            </div>
          </div>

          {/* Paid By + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                Paid by <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 transition-all bg-white"
                disabled={actionLoading}
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {getMemberName(m.userId)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 transition-all"
                disabled={actionLoading}
              />
            </div>
          </div>

          {/* Category pills */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((cat) => {
                const selected = formData.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, category: selected ? '' : cat })
                    }
                    disabled={actionLoading}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all disabled:opacity-50 ${
                      selected
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${getCategoryDot(cat)}`} />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split method toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Split</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit text-sm font-medium">
              {(['equal', 'custom'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData({ ...formData, splitMethod: method })}
                  disabled={actionLoading}
                  className={`px-4 py-2 transition-colors disabled:opacity-50 ${
                    formData.splitMethod === method
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {method === 'equal' ? 'Fair split' : 'Custom amounts'}
                </button>
              ))}
            </div>

            {/* Equal split hint */}
            {formData.splitMethod === 'equal' && formData.amount && activeSplitMembers.length > 0 && (() => {
              const perPerson = parseFloat(formData.amount) / activeSplitMembers.length;
              const isUneven = !Number.isInteger(perPerson * 100);
              return isUneven ? (
                <p className="text-sm text-gray-400 mt-2">
                  Amounts will be split as evenly as possible with sub-cent rounding on the last member.
                </p>
              ) : null;
            })()}

            {/* Custom split inputs */}
            {formData.splitMethod === 'custom' && formData.amount && (() => {
              const total = activeSplitMembers.reduce(
                (sum, m) => sum + (parseFloat(splitInputs[m.userId] || '0') || 0),
                0
              );
              const target = parseFloat(formData.amount) || 0;
              const diff = total - target;
              const isOver = diff > 0.01;
              const isUnder = diff < -0.01;
              return (
                <div className="mt-3 bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
                  {activeSplitMembers.map((member) => (
                    <div key={member.userId} className="flex items-center gap-3">
                      <span className="flex-1 text-sm text-gray-700 truncate">{getMemberName(member.userId)}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={splitInputs[member.userId] || ''}
                        onChange={(e) => handleSplitInputChange(member.userId, e.target.value)}
                        placeholder="0.00"
                        className="w-24 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                        disabled={actionLoading}
                      />
                    </div>
                  ))}
                  <div className={`flex items-center justify-between pt-2 border-t text-sm font-medium ${
                    isOver ? 'text-red-500 border-red-100' : isUnder ? 'text-amber-500 border-amber-100' : 'text-emerald-600 border-emerald-100'
                  }`}>
                    <span>{isOver ? 'Over by' : isUnder ? 'Remaining' : 'Balanced'}</span>
                    {(isOver || isUnder) && <span>{Math.abs(diff).toFixed(2)}</span>}
                    {!isOver && !isUnder && <Icon name="checkCircle" size={13} />}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any extra details…"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 transition-all resize-none"
              disabled={actionLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="px-4 py-2 text-sm text-gray-600 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={actionLoading}
            className="px-4 py-2 text-sm bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {actionLoading ? 'Creating…' : 'Add expense'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateExpenseModal;
