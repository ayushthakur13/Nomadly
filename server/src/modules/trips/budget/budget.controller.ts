import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils';
import budgetService from './budget.service';
import type { CreateBudgetDTO, UpdateBudgetMemberDTO } from '../../../../../shared/types/budget';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

class BudgetController {
  /**
   * POST /api/trips/:tripId/budget
   * Create budget for a trip
   */
  createBudget = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { tripId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!tripId) {
      res.status(400).json({ success: false, message: 'Trip ID is required' });
      return;
    }

    const dto: CreateBudgetDTO = req.body;
    if (!dto?.baseCurrency || typeof dto.baseCurrency !== 'string') {
      res.status(400).json({ success: false, message: 'Base currency is required' });
      return;
    }

    const snapshot = await budgetService.createBudget(tripId, userId, dto);

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: { snapshot },
    });
  });

  /**
   * GET /api/trips/:tripId/budget
   * Get budget snapshot
   */
  getBudgetSnapshot = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { tripId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!tripId) {
      res.status(400).json({ success: false, message: 'Trip ID is required' });
      return;
    }

    const snapshot = await budgetService.getBudgetSnapshot(tripId, userId);

    res.status(200).json({
      success: true,
      data: { snapshot },
    });
  });

  /**
   * PATCH /api/trips/:tripId/budget/members/:userId
   * Update planned contribution for a budget member
   */
  updateBudgetMember = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const requesterId = req.user?.id;
    const { tripId, userId } = req.params;

    if (!requesterId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!tripId || !userId) {
      res.status(400).json({ success: false, message: 'Required parameters missing' });
      return;
    }

    const dto: UpdateBudgetMemberDTO = req.body;
    if (dto?.plannedContribution === undefined) {
      res.status(400).json({ success: false, message: 'plannedContribution is required' });
      return;
    }

    const snapshot = await budgetService.updateMemberContribution(tripId, userId, requesterId, dto);

    res.status(200).json({
      success: true,
      message: 'Budget member updated successfully',
      data: { snapshot },
    });
  });
}

export default new BudgetController();