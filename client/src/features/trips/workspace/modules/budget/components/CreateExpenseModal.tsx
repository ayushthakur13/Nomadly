import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useBudget, useMemberDetails } from '../hooks';
import { Icon } from '@/ui/icon';
import type { BudgetMember, CreateExpenseDTO, ExpenseSplit } from '@shared/types';

interface CreateExpenseModalProps {
  members: BudgetMember[];
  onClose: () => void;
}

const CreateExpenseModal = ({ members, onClose }: CreateExpenseModalProps) => {
  const { tripId } = useParams<{ tripId: string }>();
  const { actionLoading, createExpense: performCreate, clearError } = useBudget();
  const { getMemberName } = useMemberDetails();

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    paidBy: members[0]?.userId || '',
    splitMethod: 'equal' as 'equal' | 'custom' | 'percentage',
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
    if (!formData.title.trim() || isNaN(amount) || amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    // Build splits array based on split method
    let splits: ExpenseSplit[] | undefined = undefined;

    if (formData.splitMethod === 'custom') {
      splits = activeSplitMembers.map((member) => ({
        userId: member.userId,
        amount: parseFloat(splitInputs[member.userId] || '0'),
      }));
    } else if (formData.splitMethod === 'percentage') {
      splits = activeSplitMembers.map((member) => ({
        userId: member.userId,
        amount: parseFloat(splitInputs[member.userId] || '0'), // Backend expects percentages as amounts
      }));
    }
    // For 'equal', splits is undefined and backend handles it

    const payload: CreateExpenseDTO = {
      title: formData.title,
      amount,
      category: formData.category || undefined,
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
      {/* Modal */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Expense</h2>
          <button
            onClick={onClose}
            disabled={actionLoading}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="wallet" size={14} className="text-emerald-600" />
              Basic Information
            </h3>

            {/* Row 1: Title and Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Hotel booking"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                  disabled={actionLoading}
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                  disabled={actionLoading}
                />
              </div>
            </div>

            {/* Row 2: Paid By and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Paid By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Paid By <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                  disabled={actionLoading}
                >
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {getMemberName(m.userId)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., accommodation"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                  disabled={actionLoading}
                />
              </div>
            </div>

            {/* Row 3: Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all"
                disabled={actionLoading}
              />
            </div>
          </div>

          {/* Section 2: Split Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="splitSquare" size={14} className="text-emerald-600" />
              Split Settings
            </h3>

            {/* Split Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Split Method <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2.5">
                {(['equal', 'custom', 'percentage'] as const).map((method) => (
                  <label key={method} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="splitMethod"
                      value={method}
                      checked={formData.splitMethod === method}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          splitMethod: e.target.value as typeof method,
                        })
                      }
                      disabled={actionLoading}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="ml-2.5 text-sm text-gray-700">
                      {method === 'equal'
                        ? 'Equal Split'
                        : method === 'percentage'
                        ? 'Percentage Split'
                        : 'Custom Amounts'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Split Details (Custom/Percentage) */}
            {formData.splitMethod !== 'equal' && formData.amount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-blue-900">
                  {formData.splitMethod === 'percentage'
                    ? 'Enter percentages (total should be 100%)'
                    : 'Enter custom amounts'}
                </p>
                <div className="space-y-2">
                  {activeSplitMembers.map((member) => (
                    <div key={member.userId} className="flex items-center gap-3">
                      <label className="flex-1 text-sm text-gray-700">
                        {getMemberName(member.userId)}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={splitInputs[member.userId] || ''}
                        onChange={(e) =>
                          handleSplitInputChange(member.userId, e.target.value)
                        }
                        placeholder={
                          formData.splitMethod === 'percentage' ? '%' : 'Amount'
                        }
                        className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
                        disabled={actionLoading}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Notes (Optional) */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="fileText" size={14} className="text-emerald-600" />
              Additional Notes (Optional)
            </h3>

            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional details about this expense..."
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all resize-none"
              disabled={actionLoading}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="px-4 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={actionLoading}
            className="px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {actionLoading ? 'Creating...' : 'Create Expense'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateExpenseModal;
