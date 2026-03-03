import { useState } from 'react';
import type { CreateBudgetDTO, BudgetSnapshot } from '@shared/types';
import toast from 'react-hot-toast';

const COMMON_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED', 'JPY', 'THB'];

interface CreateBudgetFormProps {
  onClose: () => void;
  onSubmit: (payload: CreateBudgetDTO) => Promise<BudgetSnapshot | void>;
  isLoading: boolean;
}

export function CreateBudgetForm({ onClose, onSubmit, isLoading }: CreateBudgetFormProps) {
  const [totalBudgetAmount, setTotalBudgetAmount] = useState('');
  const [currency, setCurrency] = useState('INR');

  const handleSubmit = async () => {
    const amount = parseFloat(totalBudgetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    try {
      await onSubmit({
        baseCurrency: currency,
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
    <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Total planned budget
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Shared equally among trip members
          </p>
          <input
            type="number"
            value={totalBudgetAmount}
            onChange={(e) => setTotalBudgetAmount(e.target.value)}
            placeholder="e.g., 20000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            disabled={isLoading}
            step="500"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Currency
          </label>
          <p className="text-xs text-gray-500 mb-2">
            All expenses will use this currency
          </p>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
            disabled={isLoading}
          >
            {COMMON_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
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
