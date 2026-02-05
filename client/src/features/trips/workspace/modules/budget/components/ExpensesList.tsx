import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/';
import type { BudgetSnapshot } from '@shared/types';
import ExpenseRow from './ExpenseRow';

interface ExpensesListProps {
  snapshot: BudgetSnapshot;
}

const ExpensesList = ({ snapshot }: ExpensesListProps) => {
  const expenses = snapshot?.expenses ?? [];
  const budget = snapshot?.budget;
  const { user } = useAuth();
  const currentUserId = (user as any)?.id || (user as any)?._id || null;
  const currentMember = budget?.members?.find((m) => m.userId === currentUserId);
  const isCreator = budget?.createdBy === currentUserId;
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return b.amount - a.amount;
    }
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Expense Ledger</h2>
          <p className="text-sm text-gray-500">Recent spend, kept simple</p>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
          className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 bg-white"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedExpenses.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No expenses yet. Start with your first shared spend.
          </div>
        ) : (
          sortedExpenses.map((expense) => {
            const isOwn = expense.createdBy === currentUserId;
            const canEditOrDelete = Boolean(
              currentUserId &&
                (isCreator ||
                  (isOwn &&
                    currentMember &&
                    !currentMember.isPastMember &&
                    (budget?.rules?.allowMemberExpenseEdits ?? true)))
            );

            return (
            <ExpenseRow
              key={expense._id}
              expense={expense}
              baseCurrency={budget?.baseCurrency || 'INR'}
              canEdit={canEditOrDelete}
              canDelete={canEditOrDelete}
            />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExpensesList;
