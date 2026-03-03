/**
 * Budget domain types - API contract between client and server
 */

/** ISO 4217 currency code, e.g. 'INR', 'USD', 'EUR' */
export type CurrencyCode = string;

export type BudgetMemberRole = 'creator' | 'member';

export interface BudgetMember {
  userId: string;
  /** How much this member plans to contribute, >= their actual spent amount */
  plannedContribution: number;
  role: BudgetMemberRole;
  joinedAt: string;
  /** Past members remain for audit history but cannot create/edit expenses */
  isPastMember: boolean;
}

export type ExpenseSplitMethod = 'equal' | 'custom';

export interface ExpenseSplit {
  userId: string;
  amount: number;
}

export interface Expense {
  _id: string;
  tripId: string;
  /** Short human-readable description, e.g. 'Hotel Taj' */
  title?: string;
  /** Total expense amount in baseCurrency, normalised to 2 decimal places */
  amount: number;
  /** ISO 4217 code — must match the parent TripBudget.baseCurrency */
  currency: CurrencyCode;
  /** Free-form category tag, e.g. 'accommodation', 'food' */
  category?: string;
  /** User who physically paid – must be an active budget member */
  paidBy: string;
  /** User who recorded the expense */
  createdBy: string;
  splitMethod: ExpenseSplitMethod;
  /** Per-member breakdown; sum of split amounts must equal `amount` (±0.01) */
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
  /** ISO 4217 code for all monetary values in this budget */
  baseCurrency: CurrencyCode;
  /** Optional overall budget ceiling set by the creator; null means no cap */
  baseBudgetAmount?: number | null;
  createdBy: string;
  /** All trip members who are tracked in this budget, including past members */
  members: BudgetMember[];
  rules: BudgetRules;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  /** Sum of all active members' plannedContribution */
  totalPlanned: number;
  /** Sum of all expense amounts */
  totalSpent: number;
  /** totalPlanned - totalSpent; negative means over-budget */
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
  totalBudgetAmount?: number;
  members?: {
    userId: string;
    plannedContribution: number;
  }[];
}

export interface UpdateBudgetDTO {
  baseBudgetAmount?: number | null;
}

export interface UpdateBudgetMemberDTO {
  plannedContribution: number;
}

export interface BulkUpdateBudgetMembersDTO {
  updates: {
    userId: string;
    plannedContribution: number;
  }[];
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
