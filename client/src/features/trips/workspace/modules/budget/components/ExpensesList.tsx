import { useAuth } from '@/features/auth/hooks/';
import type { BudgetSnapshot } from '@shared/types';
import ExpenseRow from './ExpenseRow';
import { useBudgetFilters } from '../hooks';

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

  const {
    filteredExpenses,
    sortBy,
    setSortBy,
    categoryFilter,
    setCategoryFilter,
    availableCategories,
  } = useBudgetFilters(expenses);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Expense Ledger</h2>
          <p className="text-sm text-gray-500">Recent spend, kept simple</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {availableCategories.length > 1 && (
            <select
              value={categoryFilter ?? ''}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 bg-white"
            >
              <option value="">All categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 bg-white"
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Highest amount</option>
            <option value="amount-asc">Lowest amount</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredExpenses.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            {expenses.length === 0
              ? 'No expenses yet. Start with your first shared spend.'
              : 'No expenses match the current filter.'}
          </div>
        ) : (
          filteredExpenses.map((expense) => {
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
