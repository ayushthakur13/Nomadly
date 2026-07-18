import { z } from 'zod';

export const createBudgetSchema = z.object({
  baseCurrency: z.string().trim().length(3, 'Base currency must be a 3-letter currency code (ISO 4217)'),
  totalBudgetAmount: z.number().nonnegative('Budget amount must be a positive number').optional(),
  members: z.array(
    z.object({
      userId: z.string().trim(),
      plannedContribution: z.number().nonnegative('Planned contribution must be a positive number'),
    })
  ).optional(),
});

export const updateBudgetSchema = z.object({
  baseBudgetAmount: z.number().nonnegative('Budget amount must be positive').nullable().optional(),
});

export const updateBudgetMemberSchema = z.object({
  plannedContribution: z.number().nonnegative('Planned contribution must be a positive number'),
});

export const bulkUpdateBudgetMembersSchema = z.object({
  updates: z.array(
    z.object({
      userId: z.string().trim(),
      plannedContribution: z.number().nonnegative('Planned contribution must be a positive number'),
    })
  ).min(1, 'updates must be a non-empty array'),
});

const expenseSplitSchema = z.object({
  userId: z.string().trim(),
  amount: z.number().nonnegative('Split amount must be a positive number'),
});

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title is too long').optional(),
  amount: z.number().positive('Expense amount must be greater than 0'),
  category: z.string().trim().optional(),
  paidBy: z.string().trim(),
  splitMethod: z.enum(['equal', 'custom']),
  splits: z.array(expenseSplitSchema).optional(),
  date: z.string().date('Invalid date format').optional(),
  notes: z.string().trim().max(500, 'Notes are too long').optional(),
});

export const updateExpenseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title is too long').optional(),
  amount: z.number().positive('Expense amount must be greater than 0').optional(),
  category: z.string().trim().optional(),
  splits: z.array(expenseSplitSchema).optional(),
  date: z.string().date('Invalid date format').optional(),
  notes: z.string().trim().max(500, 'Notes are too long').optional(),
  // Check for immutable modifications explicitly to retain custom messaging
  splitMethod: z.any().optional(),
  paidBy: z.any().optional(),
  createdBy: z.any().optional(),
  tripId: z.any().optional(),
}).superRefine((data, ctx) => {
  if (data.splitMethod !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'splitMethod cannot be updated',
      path: ['splitMethod'],
    });
  }
  if (data.createdBy !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'createdBy cannot be updated',
      path: ['createdBy'],
    });
  }
  if (data.paidBy !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'paidBy cannot be updated',
      path: ['paidBy'],
    });
  }
  if (data.tripId !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'tripId cannot be updated',
      path: ['tripId'],
    });
  }
});
