import { useState } from 'react';
import { useBudget, useBudgetPermissions } from './hooks';
import { BudgetHeader, BudgetMembers, ExpensesList, CreateExpenseModal, CreateBudgetForm } from './components/';
import { ErrorAlert, PageHeader } from '@/ui/common';
import { Icon } from '@/ui/icon';

const BudgetPage = () => {
  const { snapshot, loading, error, budgetNotFound, createBudget, updateBaseBudget, actionLoading } = useBudget();
  const permissions = useBudgetPermissions(snapshot);
  const { canAddExpense, isCreator } = permissions;
  
  const showEmptyState = budgetNotFound || !snapshot;
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget"
        subtitle="Budget awareness first, ledger second"
        action={
          canAddExpense
            ? {
                label: 'Add expense',
                onClick: () => setShowCreateModal(true),
                icon: <Icon name="add" size={16} />,
              }
            : undefined
        }
      />

      <ErrorAlert error={error} title="Unable to load budget" />

      {loading && !snapshot && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600" />
            Loading budget...
          </div>
        </div>
      )}

      {showEmptyState && !loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="max-w-xl">
            <div className="text-lg font-semibold text-gray-900">Start budget planning</div>
            <p className="text-sm text-gray-500 mt-1">
              Set a shared plan for this trip and keep spend visible for everyone.
            </p>

            {!showBudgetForm ? (
              <button
                onClick={() => setShowBudgetForm(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <Icon name="sparkles" size={16} />
                Start Budget Planning
              </button>
            ) : (
              <CreateBudgetForm
                onClose={() => setShowBudgetForm(false)}
                onSubmit={createBudget}
                isLoading={actionLoading}
              />
            )}
          </div>
        </div>
      )}

      {snapshot && (
        <>
          <BudgetHeader
            snapshot={snapshot}
            canEditBaseBudget={Boolean(isCreator)}
            actionLoading={actionLoading}
            onUpdateBaseBudget={async (amount) => {
              await updateBaseBudget({ baseBudgetAmount: amount });
            }}
            onClearBaseBudget={async () => {
              await updateBaseBudget({ baseBudgetAmount: null });
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <BudgetMembers snapshot={snapshot} />
            </div>
            <div className="lg:col-span-2">
              <ExpensesList snapshot={snapshot} />
            </div>
          </div>
        </>
      )}

      {showCreateModal && snapshot && (
        <CreateExpenseModal
          members={snapshot.budget.members}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default BudgetPage;
