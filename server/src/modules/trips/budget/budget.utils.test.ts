import { describe, it, expect } from 'vitest';
import { Types } from 'mongoose';
import {
  FinancialUtils,
  SplitUtils,
  BudgetAccessUtils,
} from './budget.utils';
import type { ITripBudget } from './budget.model';

describe('FinancialUtils', () => {
  describe('roundToTwo', () => {
    it('should round normal floats correctly', () => {
      expect(FinancialUtils.roundToTwo(1.234)).toBe(1.23);
      expect(FinancialUtils.roundToTwo(1.236)).toBe(1.24);
      expect(FinancialUtils.roundToTwo(1.2)).toBe(1.2);
    });

    it('should handle JS float imprecision cases correctly', () => {
      // 0.1 + 0.2 = 0.30000000000000004
      expect(FinancialUtils.roundToTwo(0.1 + 0.2)).toBe(0.3);
      // 1.005 would normally suffer from rounding issues in some rounding methods, standard roundToTwo uses Number.EPSILON
      expect(FinancialUtils.roundToTwo(1.005)).toBe(1.01);
      expect(FinancialUtils.roundToTwo(35.155)).toBe(35.16);
    });
  });
});

describe('SplitUtils', () => {
  const user1 = new Types.ObjectId().toString();
  const user2 = new Types.ObjectId().toString();
  const user3 = new Types.ObjectId().toString();

  describe('computeSplits', () => {
    it('throws when amount is negative', () => {
      expect(() =>
        SplitUtils.computeSplits({
          amount: -10,
          splitMethod: 'equal',
          budgetMembers: [{ userId: user1, isPastMember: false }],
        })
      ).toThrow('Expense amount cannot be negative');
    });

    it("delegates to equal split logic correctly when splitMethod is 'equal'", () => {
      const result = SplitUtils.computeSplits({
        amount: 30,
        splitMethod: 'equal',
        budgetMembers: [
          { userId: user1, isPastMember: false },
          { userId: user2, isPastMember: false },
        ],
      });
      expect(result).toEqual([
        { userId: user1, amount: 15 },
        { userId: user2, amount: 15 },
      ]);
    });

    it("throws when splitMethod is 'custom' and splits array is missing or empty", () => {
      expect(() =>
        SplitUtils.computeSplits({
          amount: 30,
          splitMethod: 'custom',
          splits: [],
          budgetMembers: [{ userId: user1, isPastMember: false }],
        })
      ).toThrow('Splits are required for custom split method');

      expect(() =>
        SplitUtils.computeSplits({
          amount: 30,
          splitMethod: 'custom',
          splits: undefined,
          budgetMembers: [{ userId: user1, isPastMember: false }],
        })
      ).toThrow('Splits are required for custom split method');
    });

    it("returns splits normalized via FinancialUtils.normalizeMoney when splitMethod is 'custom'", () => {
      const customSplits = [
        { userId: user1, amount: 10.004 },
        { userId: user2, amount: 19.996 },
      ];
      const result = SplitUtils.computeSplits({
        amount: 30,
        splitMethod: 'custom',
        splits: customSplits,
        budgetMembers: [
          { userId: user1, isPastMember: false },
          { userId: user2, isPastMember: false },
        ],
      });
      expect(result).toEqual([
        { userId: user1, amount: 10 },
        { userId: user2, amount: 20 },
      ]);
    });
  });

  describe('computeEqualSplit (tested via SplitUtils.computeSplits)', () => {
    it('splits an amount evenly across N active members where it divides cleanly', () => {
      const budgetMembers = [
        { userId: user1, isPastMember: false },
        { userId: user2, isPastMember: false },
      ];
      const result = SplitUtils.computeSplits({
        amount: 100,
        splitMethod: 'equal',
        budgetMembers,
      });
      expect(result).toEqual([
        { userId: user1, amount: 50 },
        { userId: user2, amount: 50 },
      ]);
      const sum = result.reduce((s, item) => s + item.amount, 0);
      expect(sum).toBe(100);
    });

    it('splits an amount that does not divide evenly, adding remainder to the last member', () => {
      const budgetMembers = [
        { userId: user1, isPastMember: false },
        { userId: user2, isPastMember: false },
        { userId: user3, isPastMember: false },
      ];
      const result = SplitUtils.computeSplits({
        amount: 100,
        splitMethod: 'equal',
        budgetMembers,
      });
      // 100 / 3 = 33.3333... rounded to two is 33.33.
      // Total so far: 33.33 * 3 = 99.99. Diff is 0.01.
      // Last member gets 33.33 + 0.01 = 33.34.
      expect(result).toEqual([
        { userId: user1, amount: 33.33 },
        { userId: user2, amount: 33.33 },
        { userId: user3, amount: 33.34 },
      ]);
      const sum = result.reduce((s, item) => s + item.amount, 0);
      expect(sum).toBe(100);
    });

    it('throws when there are zero active members', () => {
      // Empty members list
      expect(() =>
        SplitUtils.computeSplits({
          amount: 100,
          splitMethod: 'equal',
          budgetMembers: [],
        })
      ).toThrow('No active members available for equal split');

      // Only past members
      expect(() =>
        SplitUtils.computeSplits({
          amount: 100,
          splitMethod: 'equal',
          budgetMembers: [
            { userId: user1, isPastMember: true },
            { userId: user2, isPastMember: true },
          ],
        })
      ).toThrow('No active members available for equal split');
    });

    it('excludes members with isPastMember: true entirely from the split', () => {
      const budgetMembers = [
        { userId: user1, isPastMember: false },
        { userId: user2, isPastMember: true },
        { userId: user3, isPastMember: false },
      ];
      const result = SplitUtils.computeSplits({
        amount: 100,
        splitMethod: 'equal',
        budgetMembers,
      });
      // Excludes user2. So split 100 between user1 and user3.
      expect(result).toEqual([
        { userId: user1, amount: 50 },
        { userId: user3, amount: 50 },
      ]);
      const sum = result.reduce((s, item) => s + item.amount, 0);
      expect(sum).toBe(100);
    });
  });

  describe('validateSplits', () => {
    it('throws when splits array is empty', () => {
      const memberIds = new Set([user1, user2]);
      expect(() => SplitUtils.validateSplits([], 100, memberIds)).toThrow(
        'At least one split entry is required'
      );
    });

    it('throws when a split has an invalid ObjectId as userId', () => {
      const memberIds = new Set([user1, 'invalid-id']);
      const splits = [{ userId: 'invalid-id', amount: 100 }];
      expect(() => SplitUtils.validateSplits(splits, 100, memberIds)).toThrow(
        'Invalid split user ID'
      );
    });

    it("throws when a split's userId is not present in memberIds set", () => {
      const memberIds = new Set([user1]);
      const splits = [{ userId: user2, amount: 100 }];
      expect(() => SplitUtils.validateSplits(splits, 100, memberIds)).toThrow(
        'Split user must be a budget member'
      );
    });

    it('throws when an individual split amount is negative', () => {
      const memberIds = new Set([user1]);
      const splits = [{ userId: user1, amount: -10 }];
      expect(() => SplitUtils.validateSplits(splits, -10, memberIds)).toThrow(
        'Amount must be a non-negative number'
      );
    });

    it('throws when the sum of split amounts does not equal the total expense amount (clearly outside 0.01 tolerance)', () => {
      const memberIds = new Set([user1, user2]);
      const splits = [
        { userId: user1, amount: 40 },
        { userId: user2, amount: 50 },
      ];
      // Total splits sum is 90, but total expense amount is 100. Diff = 10 > 0.01
      expect(() => SplitUtils.validateSplits(splits, 100, memberIds)).toThrow(
        'Sum of split amounts must equal total expense amount'
      );
    });

    it('passes when the sum matches within the 0.01 floating-point tolerance', () => {
      const memberIds = new Set([user1, user2]);
      const splits = [
        { userId: user1, amount: 33.33 },
        { userId: user2, amount: 33.33 },
      ];
      // Total splits sum is 66.66, amount is 66.67. Diff = 0.01, which is <= 0.01 tolerance
      expect(() => SplitUtils.validateSplits(splits, 66.67, memberIds)).not.toThrow();
    });
  });
});

describe('BudgetAccessUtils', () => {
  const creatorId = new Types.ObjectId().toString();
  const requesterId = new Types.ObjectId().toString();
  const otherId = new Types.ObjectId().toString();

  describe('enforceExpensePermission', () => {
    const mockBudgetWithRules = (rules: {
      allowMemberExpenseCreation: boolean;
      allowMemberExpenseEdits: boolean;
    }) =>
      ({
        createdBy: creatorId,
        rules,
        members: [],
      }) as unknown as ITripBudget;

    it('allows trip creator to perform any action regardless of ownership or rules', () => {
      const budget1 = mockBudgetWithRules({
        allowMemberExpenseCreation: false,
        allowMemberExpenseEdits: false,
      });

      // Creator create expense
      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('create', true, creatorId, undefined, budget1)
      ).not.toThrow();

      // Creator edit someone else's expense
      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('edit', true, creatorId, otherId, budget1)
      ).not.toThrow();

      // Creator delete someone else's expense
      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('delete', true, creatorId, otherId, budget1)
      ).not.toThrow();
    });

    it("throws if non-creator performs 'create' action when allowMemberExpenseCreation is false", () => {
      const budget = mockBudgetWithRules({
        allowMemberExpenseCreation: false,
        allowMemberExpenseEdits: true,
      });
      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('create', false, requesterId, undefined, budget)
      ).toThrow('Members are not allowed to create expenses');
    });

    it("succeeds if non-creator performs 'create' action when allowMemberExpenseCreation is true", () => {
      const budget = mockBudgetWithRules({
        allowMemberExpenseCreation: true,
        allowMemberExpenseEdits: false,
      });
      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('create', false, requesterId, undefined, budget)
      ).not.toThrow();
    });

    it("throws if non-creator performs 'edit' or 'delete' action on an expense they do NOT own, regardless of rules", () => {
      const budgetAllow = mockBudgetWithRules({
        allowMemberExpenseCreation: true,
        allowMemberExpenseEdits: true,
      });
      const budgetDisallow = mockBudgetWithRules({
        allowMemberExpenseCreation: true,
        allowMemberExpenseEdits: false,
      });

      // Edit other's expense
      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('edit', false, requesterId, otherId, budgetAllow)
      ).toThrow('Members can only manage their own expenses');
      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('edit', false, requesterId, otherId, budgetDisallow)
      ).toThrow('Members can only manage their own expenses');

      // Delete other's expense
      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('delete', false, requesterId, otherId, budgetAllow)
      ).toThrow('Members can only manage their own expenses');
      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('delete', false, requesterId, otherId, budgetDisallow)
      ).toThrow('Members can only manage their own expenses');
    });

    it("throws if non-creator performs 'edit' or 'delete' action on their OWN expense when allowMemberExpenseEdits is false", () => {
      const budget = mockBudgetWithRules({
        allowMemberExpenseCreation: true,
        allowMemberExpenseEdits: false,
      });

      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('edit', false, requesterId, requesterId, budget)
      ).toThrow('Members are not allowed to edit or delete expenses');

      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('delete', false, requesterId, requesterId, budget)
      ).toThrow('Members are not allowed to edit or delete expenses');
    });

    it("succeeds if non-creator performs 'edit' or 'delete' action on their OWN expense when allowMemberExpenseEdits is true", () => {
      const budget = mockBudgetWithRules({
        allowMemberExpenseCreation: true,
        allowMemberExpenseEdits: true,
      });

      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('edit', false, requesterId, requesterId, budget)
      ).not.toThrow();

      expect(() =>
        BudgetAccessUtils.enforceExpensePermission('delete', false, requesterId, requesterId, budget)
      ).not.toThrow();
    });
  });

  describe('ensureActiveMember', () => {
    it("throws when the userId is not in the budget's members list at all", () => {
      const budget = {
        members: [{ userId: otherId, isPastMember: false }],
      } as unknown as ITripBudget;

      expect(() => BudgetAccessUtils.ensureActiveMember(budget, requesterId)).toThrow(
        'Unauthorized to access budget'
      );
    });

    it('throws when the member exists but isPastMember: true', () => {
      const budget = {
        members: [{ userId: requesterId, isPastMember: true }],
      } as unknown as ITripBudget;

      expect(() => BudgetAccessUtils.ensureActiveMember(budget, requesterId)).toThrow(
        'Past members cannot modify expenses'
      );
    });

    it('succeeds for an active member', () => {
      const budget = {
        members: [
          { userId: requesterId, isPastMember: false },
          { userId: otherId, isPastMember: true },
        ],
      } as unknown as ITripBudget;

      expect(() => BudgetAccessUtils.ensureActiveMember(budget, requesterId)).not.toThrow();
    });
  });
});
