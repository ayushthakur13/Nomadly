import { Types } from 'mongoose';
import type {
  BudgetMember as BudgetMemberDTO,
  Expense as ExpenseDTO,
  TripBudget as TripBudgetDTO,
  BudgetSummary,
  MemberBudgetSummary,
} from '../../../../../shared/types/budget';
import type { IBudgetMember, ITripBudget } from './budget.model';
import type { IExpense } from './expense.model';

/**
 * Financial utilities for money normalization and rounding
 */
export const FinancialUtils = {
  roundToTwo(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  },

  normalizeMoney(value: number): number {
    return this.roundToTwo(value);
  },
};

/**
 * ObjectId validation utilities
 */
export const ValidationUtils = {
  isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  },

  validateObjectId(id: string, fieldName: string = 'ID'): void {
    if (!this.isValidObjectId(id)) {
      throw new Error(`Invalid ${fieldName}`);
    }
  },

  validateContribution(value: unknown): void {
    if (typeof value !== 'number' || value < 0) {
      throw new Error('Contribution must be a non-negative number');
    }
  },

  validateAmount(value: unknown): void {
    if (typeof value !== 'number' || value < 0) {
      throw new Error('Amount must be a non-negative number');
    }
  },

  validateDateString(value: unknown): Date {
    if (typeof value !== 'string' || !value) {
      throw new Error('date must be a valid ISO string');
    }
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error('date must be a valid ISO string');
    }
    return parsedDate;
  },

  validateCurrency(currency: unknown): void {
    if (typeof currency !== 'string' || currency.length !== 3) {
      throw new Error('Base currency is required and must be 3 letters');
    }
  },

  validateSplitMethod(method: unknown): asserts method is 'equal' | 'custom' | 'percentage' {
    if (!method || !['equal', 'custom', 'percentage'].includes(method as string)) {
      throw new Error('Invalid splitMethod');
    }
  },
};

/**
 * Mapping/transformation utilities
 */
export const MappingUtils = {
  mapBudgetMember(member: IBudgetMember): BudgetMemberDTO {
    return {
      userId: member.userId.toString(),
      plannedContribution: member.plannedContribution,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
      isPastMember: member.isPastMember,
    };
  },

  mapBudget(budget: ITripBudget, members: BudgetMemberDTO[]): TripBudgetDTO {
    return {
      _id: budget._id.toString(),
      tripId: budget.tripId.toString(),
      baseCurrency: budget.baseCurrency,
      createdBy: budget.createdBy.toString(),
      members,
      rules: {
        allowMemberContributionEdits: budget.rules?.allowMemberContributionEdits ?? true,
        allowMemberExpenseCreation: budget.rules?.allowMemberExpenseCreation ?? true,
        allowMemberExpenseEdits: budget.rules?.allowMemberExpenseEdits ?? true,
      },
      createdAt: budget.createdAt.toISOString(),
      updatedAt: budget.updatedAt.toISOString(),
    };
  },

  mapExpense(expense: IExpense | any): ExpenseDTO {
    return {
      _id: expense._id?.toString() || expense.id,
      tripId: expense.tripId.toString(),
      title: expense.title,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      paidBy: expense.paidBy.toString(),
      createdBy: expense.createdBy.toString(),
      splitMethod: expense.splitMethod,
      splits: (expense.splits || []).map((s: any) => ({
        userId: s.userId.toString(),
        amount: s.amount,
      })),
      date: (expense.date ? new Date(expense.date) : new Date()).toISOString(),
      notes: expense.notes,
      createdAt: expense.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: expense.updatedAt?.toISOString() || new Date().toISOString(),
    };
  },

  computeSummary(members: BudgetMemberDTO[], expenses: ExpenseDTO[]): BudgetSummary {
    const totalPlanned = FinancialUtils.normalizeMoney(
      members.reduce((sum, m) => sum + (m.plannedContribution || 0), 0)
    );
    const totalSpent = FinancialUtils.normalizeMoney(
      expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    );
    const remaining = FinancialUtils.normalizeMoney(totalPlanned - totalSpent);

    return { totalPlanned, totalSpent, remaining };
  },

  computeMemberSummaries(members: BudgetMemberDTO[], expenses: ExpenseDTO[]): MemberBudgetSummary[] {
    const spentByMember = new Map<string, number>();
    for (const expense of expenses) {
      for (const split of expense.splits || []) {
        const prev = spentByMember.get(split.userId) ?? 0;
        spentByMember.set(split.userId, prev + split.amount);
      }
    }

    return members.map(m => {
      const spent = FinancialUtils.normalizeMoney(spentByMember.get(m.userId) ?? 0);
      const planned = FinancialUtils.normalizeMoney(m.plannedContribution || 0);
      return {
        userId: m.userId,
        planned,
        spent,
        remaining: FinancialUtils.normalizeMoney(planned - spent),
      };
    });
  },
};

/**
 * Budget member access and permission utilities
 */
export const BudgetAccessUtils = {
  getBudgetMemberIds(budget: ITripBudget): Set<string> {
    return new Set(budget.members.map(m => m.userId.toString()));
  },

  ensureMemberAccess(budget: ITripBudget, userId: string): void {
    const memberIds = this.getBudgetMemberIds(budget);
    if (!memberIds.has(userId.toString())) {
      throw new Error('Unauthorized to access budget');
    }
  },

  ensureActiveMember(budget: ITripBudget, userId: string): void {
    const member = budget.members.find(m => m.userId.toString() === userId.toString());
    if (!member) {
      throw new Error('Unauthorized to access budget');
    }
    if (member.isPastMember) {
      throw new Error('Past members cannot modify expenses');
    }
  },

  enforceExpensePermission(
    action: 'create' | 'edit' | 'delete',
    isCreator: boolean,
    requesterId: string,
    expenseCreatorId: string | undefined,
    budget: ITripBudget
  ): void {
    if (isCreator) return;

    if (action === 'create') {
      if (!budget.rules?.allowMemberExpenseCreation) {
        throw new Error('Members are not allowed to create expenses');
      }
      return;
    }

    const isOwn = expenseCreatorId && expenseCreatorId.toString() === requesterId.toString();
    if (!isOwn) {
      throw new Error('Members can only manage their own expenses');
    }

    if (!budget.rules?.allowMemberExpenseEdits) {
      throw new Error('Members are not allowed to edit or delete expenses');
    }
  },
};

/**
 * Split computation and validation utilities
 */
export const SplitUtils = {
  computeSplits({
    amount,
    splitMethod,
    splits,
    budgetMembers
  }: {
    amount: number;
    splitMethod: 'equal' | 'custom' | 'percentage';
    splits?: { userId: string; amount: number }[] | undefined;
    budgetMembers: { userId: string; isPastMember: boolean }[];
  }): { userId: string; amount: number }[] {
    if (amount < 0) {
      throw new Error('Expense amount cannot be negative');
    }

    if (splitMethod === 'equal') {
      return computeEqualSplit(amount, budgetMembers);
    }

    if (!Array.isArray(splits) || splits.length === 0) {
      throw new Error('Splits are required for this split method');
    }

    if (splitMethod === 'custom') {
      return splits.map(s => ({ userId: s.userId, amount: FinancialUtils.normalizeMoney(s.amount) }));
    }

    return computePercentageSplit(amount, splits);
  },

  validateSplits(splits: { userId: string; amount: number }[], amount: number, memberIds: Set<string>): void {
    if (!Array.isArray(splits) || splits.length === 0) {
      throw new Error('At least one split entry is required');
    }

    for (const split of splits) {
      if (!split.userId || !ValidationUtils.isValidObjectId(split.userId)) {
        throw new Error('Invalid split user ID');
      }
      if (!memberIds.has(split.userId)) {
        throw new Error('Split user must be a budget member');
      }
      ValidationUtils.validateAmount(split.amount);
    }

    const normalizedAmount = FinancialUtils.normalizeMoney(amount);
    const total = splits.reduce((sum, s) => sum + FinancialUtils.normalizeMoney(s.amount), 0);
    if (Math.abs(FinancialUtils.normalizeMoney(total - normalizedAmount)) > 0.01) {
      throw new Error('Sum of split amounts must equal total expense amount');
    }
  },
};

function computeEqualSplit(amount: number, budgetMembers: { userId: string; isPastMember: boolean }[]): { userId: string; amount: number }[] {
  const activeMembers = budgetMembers.filter(m => !m.isPastMember);
  if (activeMembers.length === 0) {
    throw new Error('No active members available for equal split');
  }
  const perPerson = FinancialUtils.normalizeMoney(amount / activeMembers.length);
  const result = activeMembers.map(m => ({ userId: m.userId, amount: perPerson }));
  const total = result.reduce((sum, s) => sum + s.amount, 0);
  const diff = FinancialUtils.normalizeMoney(amount - total);
  if (diff !== 0 && result.length > 0) {
    const last = result[result.length - 1];
    if (last) {
      last.amount = FinancialUtils.normalizeMoney(last.amount + diff);
    }
  }
  return result;
}

function computePercentageSplit(amount: number, splits: { userId: string; amount: number }[]): { userId: string; amount: number }[] {
  const totalPercent = splits.reduce((sum, s) => sum + s.amount, 0);
  if (Math.abs(totalPercent - 100) > 0.01) {
    throw new Error('Split percentages must sum to 100');
  }

  const computed = splits.map(s => ({
    userId: s.userId,
    amount: FinancialUtils.normalizeMoney((amount * s.amount) / 100),
  }));

  const computedTotal = computed.reduce((sum, s) => sum + s.amount, 0);
  const diff = FinancialUtils.normalizeMoney(amount - computedTotal);
  if (diff !== 0 && computed.length > 0) {
    const last = computed[computed.length - 1];
    if (last) {
      last.amount = FinancialUtils.normalizeMoney(last.amount + diff);
    }
  }

  return computed;
}
