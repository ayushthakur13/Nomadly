import { useState } from 'react';
import { useBudget, useBudgetPermissions, useMemberDetails } from './hooks';
import { BudgetHeader, BudgetMembers, ExpensesList, CreateExpenseModal, CreateBudgetForm } from './components/';
import { ErrorAlert, InfoModal, PageHeader } from '@/ui/common';
import { Icon } from '@/ui/icon';
import { useAuth } from '@/features/auth/hooks/';
import { formatCurrency } from './utils/formatting';

const BudgetPage = () => {
  const { snapshot, loading, error, budgetNotFound, createBudget, updateBaseBudget, actionLoading } = useBudget();
  const permissions = useBudgetPermissions(snapshot);
  const { canAddExpense, isCreator } = permissions;
  const { user } = useAuth();
  const { getMemberName, membersWithDetails } = useMemberDetails();
  const currentUserId = (user as any)?.id || (user as any)?._id || null;
  const myStats = snapshot?.memberSummaries?.find((m) => m.userId === currentUserId) ?? null;
  const currency = snapshot?.budget?.baseCurrency || 'INR';
  
  const showEmptyState = budgetNotFound || !snapshot;
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showContributionsModal, setShowContributionsModal] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget"
        subtitle={
          myStats ? (
            <div className="flex items-center gap-3 mt-0.5">
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Icon name="wallet" size={12} className="text-gray-400" />
                <span className="font-medium text-gray-600">{formatCurrency(myStats.planned, currency)}</span>
              </span>
              <span className="text-gray-300">·</span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Icon name="receipt" size={12} className="text-gray-400" />
                <span className="font-medium text-gray-600">{formatCurrency(myStats.spent, currency)}</span>
              </span>
              <span className="text-gray-300">·</span>
              <span className="inline-flex items-center gap-1 text-xs">
                <Icon name="piggyBank" size={12} className="text-gray-400" />
                <span className={`font-medium ${myStats.remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {myStats.remaining < 0 ? '-' : ''}{formatCurrency(Math.abs(myStats.remaining), currency)}
                </span>
              </span>
            </div>
          ) : undefined
        }
        secondaryAction={
          snapshot
            ? {
                label: 'Contributions',
                onClick: () => setShowContributionsModal(true),
                icon: <Icon name="users" size={16} />,
              }
            : undefined
        }
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
            getMemberName={getMemberName}
            membersWithDetails={membersWithDetails}
            onOpenContributions={() => setShowContributionsModal(true)}
            onUpdateBaseBudget={async (amount) => {
              await updateBaseBudget({ baseBudgetAmount: amount });
            }}
            onClearBaseBudget={async () => {
              await updateBaseBudget({ baseBudgetAmount: null });
            }}
          />

          <ExpensesList snapshot={snapshot} getMemberName={getMemberName} />

          <InfoModal
            isOpen={showContributionsModal}
            title="Contributions"
            subtitle="Planned vs spent per traveler"
            size="md"
            onClose={() => setShowContributionsModal(false)}
          >
            <BudgetMembers snapshot={snapshot} getMemberName={getMemberName} membersWithDetails={membersWithDetails} />
          </InfoModal>
        </>
      )}

      {showCreateModal && snapshot && (
        <CreateExpenseModal
          members={snapshot.budget.members}
          getMemberName={getMemberName}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default BudgetPage;
