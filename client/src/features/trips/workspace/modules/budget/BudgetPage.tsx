import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBudget, useBudgetPermissions, useMemberDetails, BudgetProvider } from './hooks';
import { BudgetHeader, BudgetMembers, ExpensesList, CreateExpenseModal, CreateBudgetForm } from './components/';
import { ErrorAlert, InfoModal, PageHeader } from '@/ui/common';
import { Icon } from '@/ui/icon';
import { useAuth } from '@/features/auth/hooks/';
import { formatCurrency } from './utils/formatting';
import type { CreateExpenseDTO } from '@shared/types';
import { useSelector } from 'react-redux';

const BudgetPageContent = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { snapshot, loading, error, budgetNotFound, createBudget, updateBaseBudget, actionLoading } = useBudget();
  const permissions = useBudgetPermissions(snapshot);
  const { canAddExpense, isCreator } = permissions;
  const { user } = useAuth();
  const { getMemberName, membersWithDetails } = useMemberDetails(snapshot);
  const currentUserId = (user as any)?.id || (user as any)?._id || null;
  const myStats = snapshot?.memberSummaries?.find((m) => m.userId === currentUserId) ?? null;
  const currency = snapshot?.budget?.baseCurrency || 'INR';
  const baseBudget = snapshot?.budget?.baseBudgetAmount ?? null;
  const hasBaseBudget = baseBudget !== null && baseBudget !== undefined;
  
  const showEmptyState = budgetNotFound || !snapshot;
  
  const trip = useSelector((state: any) => state.trips.selectedTrip);
  const isSoloTrip = trip?.category === 'solo';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showContributionsModal, setShowContributionsModal] = useState(false);
  const [expenseDraft, setExpenseDraft] = useState<CreateExpenseDTO | null>(null);

  useEffect(() => {
    if (!tripId || !snapshot || showCreateModal) return;
    const key = `nomadly:budgetExpenseDraft:${tripId}`;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CreateExpenseDTO;
      setExpenseDraft(parsed);
      setShowCreateModal(true);
    } catch {
      // ignore malformed drafts
    } finally {
      window.sessionStorage.removeItem(key);
    }
  }, [tripId, snapshot, showCreateModal]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget"
        subtitle={
          myStats ? (
            isSoloTrip ? (
              <div className="flex items-center gap-3 mt-0.5">
                {hasBaseBudget ? (
                  <>
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                      <Icon name="wallet" size={13} className="text-gray-400" />
                      Target: {formatCurrency(baseBudget, currency)}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                      <Icon name="receipt" size={13} className="text-gray-400" />
                      Spent: {formatCurrency(myStats.spent, currency)}
                    </span>
                  </>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                    <Icon name="receipt" size={13} className="text-gray-400" />
                    Spent: {formatCurrency(myStats.spent, currency)}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <Icon name="wallet" size={13} className="text-gray-400" />
                  Planned: {formatCurrency(myStats.planned, currency)}
                </span>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <Icon name="receipt" size={13} className="text-gray-400" />
                  Spent: {formatCurrency(myStats.spent, currency)}
                </span>
                <span className="text-gray-300">·</span>
                <span className={`flex items-center gap-1 text-xs font-semibold ${myStats.remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  <Icon name="piggyBank" size={13} className={myStats.remaining < 0 ? 'text-red-500' : 'text-emerald-500'} />
                  {myStats.remaining < 0 ? 'Deficit: ' : 'Remaining: '}
                  {formatCurrency(Math.abs(myStats.remaining), currency)}
                </span>
              </div>
            )
          ) : undefined
        }
        secondaryAction={
          !showEmptyState && !isSoloTrip ? {
            label: 'Contributions',
            onClick: () => setShowContributionsModal(true),
            icon: <Icon name="users" size={13} />
          } : undefined
        }
        action={
          !showEmptyState && canAddExpense ? {
            label: 'Add expense',
            onClick: () => setShowCreateModal(true),
            icon: <Icon name="plus" size={16} />
          } : undefined
        }
      />

      {error && <ErrorAlert error={error} />}

      {loading && !snapshot ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : showEmptyState ? (
        showBudgetForm ? (
          <CreateBudgetForm
            onClose={() => setShowBudgetForm(false)}
            onSubmit={createBudget}
            isLoading={actionLoading}
            isSoloTrip={isSoloTrip}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Icon name="wallet" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Budget Created Yet</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Set up a target budget and member contributions to track shared trip expenses, balances, and category breakdowns effortlessly.
            </p>
            {isCreator ? (
              <button
                type="button"
                onClick={() => setShowBudgetForm(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
              >
                <Icon name="plus" size={16} />
                Set up budget
              </button>
            ) : (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 py-2 px-3 rounded-lg font-medium inline-block">
                Only the trip creator can set up the initial budget.
              </p>
            )}
          </div>
        )
      ) : (
        <>
          <BudgetHeader
            snapshot={snapshot}
            canEditBaseBudget={permissions.canEditBaseBudget}
            actionLoading={actionLoading}
            getMemberName={getMemberName}
            membersWithDetails={membersWithDetails}
            onUpdateBaseBudget={async (baseBudgetAmount) => { await updateBaseBudget({ baseBudgetAmount }); }}
            onClearBaseBudget={async () => { await updateBaseBudget({ baseBudgetAmount: null }); }}
            onOpenContributions={() => setShowContributionsModal(true)}
          />

          <ExpensesList snapshot={snapshot} getMemberName={getMemberName} isSoloTrip={isSoloTrip} />

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
          initialDraft={expenseDraft || undefined}
          isSoloTrip={isSoloTrip}
          onClose={() => {
            setShowCreateModal(false);
            setExpenseDraft(null);
          }}
        />
      )}
    </div>
  );
};

const BudgetPage = () => (
  <BudgetProvider>
    <BudgetPageContent />
  </BudgetProvider>
);

export default BudgetPage;
