/**
 * Budget domain types - API contract between client and server
 */

export type CurrencyCode = string;

export type BudgetMemberRole = 'creator' | 'member';

export interface BudgetMember {
  userId: string;
  plannedContribution: number;
  role: BudgetMemberRole;
  joinedAt: string;
  isPastMember: boolean;
}

export type ExpenseSplitMethod = 'equal' | 'custom' | 'percentage';

export interface ExpenseSplit {
  userId: string;
  amount: number;
}

export interface Expense {
  _id: string;
  tripId: string;
  title?: string;
  amount: number;
  currency: CurrencyCode;
  category?: string;
  paidBy: string;
  createdBy: string;
  splitMethod: ExpenseSplitMethod;
  splits: ExpenseSplit[];
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRules {
  allowMemberContributionEdits: boolean;
  allowMemberExpenseCreation: boolean;
  allowMemberExpenseEdits: boolean;
}

export interface TripBudget {
  _id: string;
  tripId: string;
  baseCurrency: CurrencyCode;
  createdBy: string;
  members: BudgetMember[];
  rules: BudgetRules;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  totalPlanned: number;
  totalSpent: number;
  remaining: number;
}

export interface MemberBudgetSummary {
  userId: string;
  planned: number;
  spent: number;
  remaining: number;
}

export interface BudgetSnapshot {
  budget: TripBudget;
  expenses: Expense[];
  summary: BudgetSummary;
  memberSummaries: MemberBudgetSummary[];
}

export interface CreateBudgetDTO {
  baseCurrency: CurrencyCode;
  members?: {
    userId: string;
    plannedContribution: number;
  }[];
}

export interface UpdateBudgetMemberDTO {
  plannedContribution: number;
}

export interface CreateExpenseDTO {
  title?: string;
  amount: number;
  category?: string;
  paidBy: string;
  splitMethod: ExpenseSplitMethod;
  splits?: ExpenseSplit[];
  date?: string;
  notes?: string;
}

export interface UpdateExpenseDTO {
  title?: string;
  amount?: number;
  category?: string;
  splits?: ExpenseSplit[];
  date?: string;
  notes?: string;
}
