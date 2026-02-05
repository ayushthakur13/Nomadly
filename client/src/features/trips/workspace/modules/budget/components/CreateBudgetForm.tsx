import { useState } from 'react';
import { Icon } from '@/ui/icon';
import type { CreateBudgetDTO, BudgetSnapshot } from '@shared/types';
import toast from 'react-hot-toast';

interface CreateBudgetFormProps {
  onClose: () => void;
  onSubmit: (payload: CreateBudgetDTO) => Promise<BudgetSnapshot | void>;
  isLoading: boolean;
}

export function CreateBudgetForm({ onClose, onSubmit, isLoading }: CreateBudgetFormProps) {
  const [totalBudgetAmount, setTotalBudgetAmount] = useState('');

  const handleSubmit = async () => {
    const amount = parseFloat(totalBudgetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    try {
      await onSubmit({
        baseCurrency: 'INR',
        totalBudgetAmount: amount,
      });
      onClose();
      setTotalBudgetAmount('');
      toast.success('Budget created successfully');
    } catch (err) {
      console.error('Failed to create budget:', err);
    }
  };

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Total planned budget (₹)
      </label>
      <p className="text-xs text-gray-500 mb-3">
        This amount will be shared equally among trip members
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          type="number"
          value={totalBudgetAmount}
          onChange={(e) => setTotalBudgetAmount(e.target.value)}
          placeholder="e.g., 20000"
          className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          disabled={isLoading}
          step="500"
          min="0"
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create budget'}
        </button>
        <button
          onClick={() => {
            onClose();
            setTotalBudgetAmount('');
          }}
          disabled={isLoading}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
