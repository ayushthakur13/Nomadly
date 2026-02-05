import { Types } from 'mongoose';
import TripBudget, { ITripBudget, IBudgetMember } from './budget.model';
import Expense, { IExpense } from './expense.model';
import Trip from '../core/trip.model';
import { isTripCreator, isTripMember } from '../members/member.utils';
import {
  FinancialUtils,
  ValidationUtils,
  MappingUtils,
  BudgetAccessUtils,
  SplitUtils,
} from './budget.utils';
import type {
  BudgetSnapshot,
  CreateBudgetDTO,
  CreateExpenseDTO,
  UpdateBudgetDTO,
  UpdateBudgetMemberDTO,
  UpdateExpenseDTO
} from '../../../../../shared/types/budget';

class BudgetService {
  async createBudget(tripId: string, userId: string, dto: CreateBudgetDTO): Promise<BudgetSnapshot> {
    ValidationUtils.validateObjectId(tripId, 'trip ID');

    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    if (!isTripCreator(trip, userId)) {
      throw new Error('Only trip creator can create budget');
    }

    const existing = await TripBudget.findOne({ tripId: new Types.ObjectId(tripId) });
    if (existing) {
      throw new Error('Budget already exists for this trip');
    }

    const baseCurrency = dto.baseCurrency?.trim().toUpperCase();
    ValidationUtils.validateCurrency(baseCurrency);

      const contributionMap = new Map<string, number>();
      const tripMemberIds = new Set<string>(trip.members.map(m => m.userId.toString()));
      if (!tripMemberIds.has(trip.createdBy.toString())) {
        tripMemberIds.add(trip.createdBy.toString());
      }

      const tripMemberList = Array.from(tripMemberIds);

      if (dto.totalBudgetAmount !== undefined) {
        ValidationUtils.validateAmount(dto.totalBudgetAmount);
        if (tripMemberList.length === 0) {
          throw new Error('Trip must have at least one member to initialize budget');
        }
        const total = FinancialUtils.normalizeMoney(dto.totalBudgetAmount);
        const perMember = FinancialUtils.normalizeMoney(total / tripMemberList.length);
        const computed = tripMemberList.map((memberId) => ({
          userId: memberId,
          amount: perMember,
        }));
        const computedTotal = computed.reduce((sum, m) => sum + m.amount, 0);
        const diff = FinancialUtils.normalizeMoney(total - computedTotal);
        if (diff !== 0 && computed.length > 0) {
          const last = computed[computed.length - 1];
          if (last) {
            last.amount = FinancialUtils.normalizeMoney(last.amount + diff);
          }
        }
        for (const entry of computed) {
          contributionMap.set(entry.userId, entry.amount);
        }
      } else if (Array.isArray(dto.members)) {
        for (const member of dto.members) {
          if (!member?.userId || !ValidationUtils.isValidObjectId(member.userId)) {
            throw new Error('Invalid member user ID in budget members');
          }
          ValidationUtils.validateContribution(member.plannedContribution);
          contributionMap.set(member.userId, FinancialUtils.normalizeMoney(member.plannedContribution));
        }
      }

    for (const memberId of contributionMap.keys()) {
      if (!tripMemberIds.has(memberId)) {
        throw new Error('All budget members must belong to the trip');
      }
    }

    const budgetMembers: IBudgetMember[] = trip.members.map(m => {
      const memberId = m.userId.toString();
      return {
        userId: new Types.ObjectId(memberId),
        plannedContribution: contributionMap.get(memberId) ?? 0,
        role: memberId === trip.createdBy.toString() ? 'creator' : 'member',
        joinedAt: m.joinedAt || new Date(),
        isPastMember: false,
      } as IBudgetMember;
    });

    if (!budgetMembers.some(m => m.userId.toString() === trip.createdBy.toString())) {
      budgetMembers.unshift({
        userId: new Types.ObjectId(trip.createdBy),
        plannedContribution: contributionMap.get(trip.createdBy.toString()) ?? 0,
        role: 'creator',
        joinedAt: trip.createdAt || new Date(),
        isPastMember: false,
      } as IBudgetMember);
    }

    const budget = await TripBudget.create({
      tripId: new Types.ObjectId(tripId),
      baseCurrency,
      baseBudgetAmount: dto.totalBudgetAmount !== undefined
        ? FinancialUtils.normalizeMoney(dto.totalBudgetAmount)
        : null,
      createdBy: new Types.ObjectId(userId),
      members: budgetMembers,
    });

    return this.buildSnapshot(budget, []);
  }

  async updateBaseBudget(
    tripId: string,
    userId: string,
    dto: UpdateBudgetDTO
  ): Promise<BudgetSnapshot> {
    ValidationUtils.validateObjectId(tripId, 'trip ID');

    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    if (!isTripCreator(trip, userId)) {
      throw new Error('Only trip creator can update base budget');
    }

    const budget = await TripBudget.findOne({ tripId: new Types.ObjectId(tripId) });
    if (!budget) throw new Error('Budget not found');

    if (dto.baseBudgetAmount === null) {
      budget.baseBudgetAmount = null;
    } else if (dto.baseBudgetAmount !== undefined) {
      ValidationUtils.validateAmount(dto.baseBudgetAmount);
      budget.baseBudgetAmount = FinancialUtils.normalizeMoney(dto.baseBudgetAmount);
    }

    await budget.save();

    return this.buildSnapshotWithExpenses(budget, tripId);
  }

  async getBudgetSnapshot(tripId: string, userId: string): Promise<BudgetSnapshot> {
    ValidationUtils.validateObjectId(tripId, 'trip ID');

    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    if (!isTripCreator(trip, userId) && !isTripMember(trip, userId)) {
      throw new Error('Unauthorized to view budget');
    }

    const budget = await TripBudget.findOne({ tripId: new Types.ObjectId(tripId) });
    if (!budget) throw new Error('Budget not found');

    const expenses = await Expense.find({ tripId: new Types.ObjectId(tripId) })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return this.buildSnapshot(budget, expenses);
  }

  async updateMemberContribution(
    tripId: string,
    targetUserId: string,
    requesterId: string,
    dto: UpdateBudgetMemberDTO
  ): Promise<BudgetSnapshot> {
    ValidationUtils.validateObjectId(tripId, 'trip ID');
    ValidationUtils.validateObjectId(targetUserId, 'user ID');

    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    if (!isTripCreator(trip, requesterId) && !isTripMember(trip, requesterId)) {
      throw new Error('Unauthorized to update budget member');
    }

    const budget = await TripBudget.findOne({ tripId: new Types.ObjectId(tripId) });
    if (!budget) throw new Error('Budget not found');

    ValidationUtils.validateContribution(dto.plannedContribution);

    const isCreator = isTripCreator(trip, requesterId);
    const isSelf = requesterId.toString() === targetUserId.toString();

    if (!isCreator) {
      if (!isSelf) {
        throw new Error('Only trip creator can update other members');
      }
      if (!budget.rules?.allowMemberContributionEdits) {
        throw new Error('Member contribution edits are disabled for this budget');
      }
    }

    const member = budget.members.find(m => m.userId.toString() === targetUserId.toString());
    if (!member) {
      throw new Error('Budget member not found');
    }

    const plannedContribution = FinancialUtils.normalizeMoney(dto.plannedContribution);
    const spentByMember = await this.getMemberSpent(tripId, targetUserId);
    if (plannedContribution < spentByMember) {
      throw new Error('Planned contribution cannot be less than amount already spent');
    }

    member.plannedContribution = plannedContribution;
    await budget.save();

    // Sync Trip cache since totalPlanned changed
    await this.syncTripBudgetSummary(tripId, budget);

    return this.buildSnapshotWithExpenses(budget, tripId);
  }

  async createExpense(tripId: string, userId: string, dto: CreateExpenseDTO): Promise<BudgetSnapshot> {
    const budget = await this.getBudgetByTripId(tripId);

    BudgetAccessUtils.ensureMemberAccess(budget, userId);
    BudgetAccessUtils.ensureActiveMember(budget, userId);

    const isCreator = budget.createdBy.toString() === userId.toString();
    BudgetAccessUtils.enforceExpensePermission('create', isCreator, userId, undefined, budget);

    if (!dto?.paidBy || !ValidationUtils.isValidObjectId(dto.paidBy)) {
      throw new Error('Invalid paidBy user ID');
    }

    const budgetMemberIds = BudgetAccessUtils.getBudgetMemberIds(budget);
    if (!budgetMemberIds.has(dto.paidBy)) {
      throw new Error('PaidBy must be a budget member');
    }

    ValidationUtils.validateAmount(dto.amount);
    const amount = FinancialUtils.normalizeMoney(dto.amount);

    // Validate split method (equal, custom, or percentage)
    if (!dto.splitMethod || !['equal', 'custom', 'percentage'].includes(dto.splitMethod)) {
      throw new Error('Invalid splitMethod');
    }
    const splitMethod = dto.splitMethod as 'equal' | 'custom' | 'percentage';

    const splitsInput = dto.splits ? dto.splits.map(s => ({ userId: s.userId, amount: FinancialUtils.normalizeMoney(s.amount) })) : undefined;
    const splits = SplitUtils.computeSplits({
      amount,
      splitMethod,
      splits: splitsInput,
      budgetMembers: budget.members.map(m => ({ userId: m.userId.toString(), isPastMember: m.isPastMember }))
    });

    SplitUtils.validateSplits(splits, amount, budgetMemberIds);

    const expenseDate = dto.date !== undefined ? ValidationUtils.validateDateString(dto.date) : new Date();

    await Expense.create({
      tripId: new Types.ObjectId(tripId),
      title: dto.title,
      amount,
      currency: budget.baseCurrency,
      category: dto.category,
      paidBy: new Types.ObjectId(dto.paidBy),
      createdBy: new Types.ObjectId(userId),
      splitMethod: dto.splitMethod,
      splits: splits.map(s => ({ userId: new Types.ObjectId(s.userId), amount: FinancialUtils.normalizeMoney(s.amount) })),
      date: expenseDate,
      notes: dto.notes,
    });

    await this.syncTripBudgetSummary(tripId, budget);

    return this.buildSnapshotWithExpenses(budget, tripId);
  }

  async updateExpense(expenseId: string, userId: string, dto: UpdateExpenseDTO): Promise<BudgetSnapshot> {
    ValidationUtils.validateObjectId(expenseId, 'expense ID');

    const expense = await Expense.findById(expenseId);
    if (!expense) throw new Error('Expense not found');

    const budget = await this.getBudgetByTripId(expense.tripId.toString());
    BudgetAccessUtils.ensureMemberAccess(budget, userId);
    BudgetAccessUtils.ensureActiveMember(budget, userId);

    const isCreator = budget.createdBy.toString() === userId.toString();
    BudgetAccessUtils.enforceExpensePermission('edit', isCreator, userId, expense.createdBy?.toString(), budget);

    const budgetMemberIds = BudgetAccessUtils.getBudgetMemberIds(budget);

    if (dto.amount !== undefined) {
      ValidationUtils.validateAmount(dto.amount);
      expense.amount = FinancialUtils.normalizeMoney(dto.amount);
    }

    const payload = dto as Record<string, unknown>;
    if (payload.splitMethod !== undefined) {
      throw new Error('splitMethod cannot be updated');
    }
    if (payload.createdBy !== undefined) {
      throw new Error('createdBy cannot be updated');
    }
    if (payload.paidBy !== undefined) {
      throw new Error('paidBy cannot be updated');
    }
    if (payload.tripId !== undefined) {
      throw new Error('tripId cannot be updated');
    }

    if (dto.title !== undefined) expense.title = dto.title;
    if (dto.category !== undefined) expense.category = dto.category;
    if (dto.notes !== undefined) expense.notes = dto.notes;
    if (dto.date !== undefined) {
      expense.date = ValidationUtils.validateDateString(dto.date);
    }

    const splitMethod = expense.splitMethod;

    if (dto.splits || dto.amount !== undefined) {
      const splits = SplitUtils.computeSplits({
        amount: expense.amount,
        splitMethod,
        splits: dto.splits
          ? dto.splits.map(s => ({ userId: s.userId, amount: FinancialUtils.normalizeMoney(s.amount) }))
          : expense.splits.map(s => ({ userId: s.userId.toString(), amount: FinancialUtils.normalizeMoney(s.amount) })),
        budgetMembers: budget.members.map(m => ({ userId: m.userId.toString(), isPastMember: m.isPastMember }))
      });

      SplitUtils.validateSplits(splits, expense.amount, budgetMemberIds);
      expense.splits = splits.map(s => ({ userId: new Types.ObjectId(s.userId), amount: FinancialUtils.normalizeMoney(s.amount) }));
    }

    await expense.save();

    await this.syncTripBudgetSummary(expense.tripId.toString(), budget);

    return this.buildSnapshotWithExpenses(budget, expense.tripId.toString());
  }

  async deleteExpense(expenseId: string, userId: string): Promise<BudgetSnapshot> {
    ValidationUtils.validateObjectId(expenseId, 'expense ID');

    const expense = await Expense.findById(expenseId);
    if (!expense) throw new Error('Expense not found');

    const budget = await this.getBudgetByTripId(expense.tripId.toString());
    BudgetAccessUtils.ensureMemberAccess(budget, userId);
    BudgetAccessUtils.ensureActiveMember(budget, userId);

    const isCreator = budget.createdBy.toString() === userId.toString();
    BudgetAccessUtils.enforceExpensePermission('delete', isCreator, userId, expense.createdBy?.toString(), budget);

    await expense.deleteOne();

    await this.syncTripBudgetSummary(expense.tripId.toString(), budget);

    return this.buildSnapshotWithExpenses(budget, expense.tripId.toString());
  }

  private buildSnapshot(budget: ITripBudget, expenses: IExpense[] | any[]): BudgetSnapshot {
    const members = budget.members.map(m => MappingUtils.mapBudgetMember(m));
    const mappedExpenses = (expenses || []).map(e => MappingUtils.mapExpense(e));
    const summary = MappingUtils.computeSummary(members, mappedExpenses);
    const memberSummaries = MappingUtils.computeMemberSummaries(members, mappedExpenses);

    return {
      budget: MappingUtils.mapBudget(budget, members),
      expenses: mappedExpenses,
      summary,
      memberSummaries,
    };
  }

  private async buildSnapshotWithExpenses(budget: ITripBudget, tripId: string): Promise<BudgetSnapshot> {
    const expenses = await Expense.find({ tripId: new Types.ObjectId(tripId) })
      .sort({ date: -1, createdAt: -1 })
      .lean();
    return this.buildSnapshot(budget, expenses);
  }

  private async getBudgetByTripId(tripId: string): Promise<ITripBudget> {
    ValidationUtils.validateObjectId(tripId, 'trip ID');
    const budget = await TripBudget.findOne({ tripId: new Types.ObjectId(tripId) });
    if (!budget) throw new Error('Budget not found');
    return budget;
  }

  private normalizeMoney(value: number): number {
    return FinancialUtils.normalizeMoney(value);
  }

  private async syncTripBudgetSummary(tripId: string, budget: ITripBudget): Promise<void> {
    const totalPlanned = this.normalizeMoney(
      budget.members.reduce((sum, m) => sum + (m.plannedContribution || 0), 0)
    );
    const totalSpentAgg = await Expense.aggregate([
      { $match: { tripId: new Types.ObjectId(tripId) } },
      { $group: { _id: '$tripId', total: { $sum: '$amount' } } }
    ]);
    const totalSpent = this.normalizeMoney(totalSpentAgg[0]?.total || 0);

    const trip = await Trip.findById(tripId);
    if (!trip) return;

    // NOTE: This is a read-recompute-write cache update and can race under concurrent expense writes.
    // Accepted for current scale. Consider transactions/optimistic locking or async recompute in future.
    trip.budgetSummary = { total: totalPlanned, spent: totalSpent };
    await trip.save();
  }

  private async getMemberSpent(tripId: string, userId: string): Promise<number> {
    const results = await Expense.aggregate([
      { $match: { tripId: new Types.ObjectId(tripId) } },
      { $unwind: '$splits' },
      { $match: { 'splits.userId': new Types.ObjectId(userId) } },
      { $group: { _id: '$splits.userId', total: { $sum: '$splits.amount' } } }
    ]);

    return FinancialUtils.normalizeMoney(results[0]?.total || 0);
  }

  /**
   * Clone a budget from one trip to another.
   * 
   * Supports three clone modes:
   * - TEMPLATE: Copy structure, reset planned contributions to 0
   * - PLANNING: Copy structure and planned contributions
   * - FULL_HISTORY: Copy everything including all expenses
   * 
   * The cloning user becomes the new budget creator.
   * All other members are downgraded to 'member' role.
   */
  async cloneBudget(
    originalTripId: string,
    newTripId: string,
    cloningUserId: string,
    mode: 'TEMPLATE' | 'PLANNING' | 'FULL_HISTORY' = 'PLANNING'
  ): Promise<void> {
    ValidationUtils.validateObjectId(originalTripId, 'original trip ID');
    ValidationUtils.validateObjectId(newTripId, 'new trip ID');
    ValidationUtils.validateObjectId(cloningUserId, 'cloning user ID');

    // Fetch original budget
    const originalBudget = await TripBudget.findOne({ 
      tripId: new Types.ObjectId(originalTripId) 
    });
    if (!originalBudget) {
      throw new Error('Original budget not found');
    }

    // Check if new trip already has a budget
    const existingBudget = await TripBudget.findOne({ 
      tripId: new Types.ObjectId(newTripId) 
    });
    if (existingBudget) {
      throw new Error('Budget already exists for the new trip');
    }

    // Transform members: cloning user becomes creator, others become members
    const clonedMembers: IBudgetMember[] = originalBudget.members.map(member => {
      const isCloner = member.userId.toString() === cloningUserId;
      return {
        userId: member.userId,
        plannedContribution: mode === 'TEMPLATE' ? 0 : FinancialUtils.normalizeMoney(member.plannedContribution),
        role: isCloner ? 'creator' : 'member',
        joinedAt: new Date(),
        isPastMember: false,
      } as IBudgetMember;
    });

    // Ensure exactly one creator
    const creatorCount = clonedMembers.filter(m => m.role === 'creator').length;
    if (creatorCount !== 1) {
      throw new Error('Cloned budget must have exactly one creator');
    }

    // Validate planned contributions are non-negative
    for (const member of clonedMembers) {
      if (member.plannedContribution < 0) {
        throw new Error('Planned contribution cannot be negative');
      }
    }

    // Create cloned budget document
    const clonedBudget = new TripBudget({
      tripId: new Types.ObjectId(newTripId),
      baseCurrency: originalBudget.baseCurrency,
      createdBy: new Types.ObjectId(cloningUserId),
      members: clonedMembers,
      rules: originalBudget.rules ? { ...originalBudget.rules } : {}
    });

    await clonedBudget.save();

    // For FULL_HISTORY mode, copy all expenses
    if (mode === 'FULL_HISTORY') {
      const originalExpenses = await Expense.find({
        tripId: new Types.ObjectId(originalTripId)
      }).lean();

      if (originalExpenses.length > 0) {
        const clonedExpenses = originalExpenses.map(expense => ({
          ...expense,
          _id: new Types.ObjectId(),
          tripId: new Types.ObjectId(newTripId),
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        if (clonedExpenses.length > 0) {
          await Expense.insertMany(clonedExpenses);
        }
      }
    }

    // Sync Trip budget summary cache
    await this.syncTripBudgetSummary(newTripId, clonedBudget);
  }
}

export default new BudgetService();