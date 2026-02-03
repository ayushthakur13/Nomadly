import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils';
import budgetService from './budget.service';
import type { CreateExpenseDTO, UpdateExpenseDTO } from '../../../../../shared/types/budget';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

class ExpenseController {
  /**
   * POST /api/trips/:tripId/expenses
   * Create expense
   */
  createExpense = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
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

    const dto: CreateExpenseDTO = req.body;
    if (typeof dto?.amount !== 'number') {
      res.status(400).json({ success: false, message: 'amount is required' });
      return;
    }
    if (!dto?.paidBy) {
      res.status(400).json({ success: false, message: 'paidBy is required' });
      return;
    }
    if (!dto?.splitMethod) {
      res.status(400).json({ success: false, message: 'splitMethod is required' });
      return;
    }

    const snapshot = await budgetService.createExpense(tripId, userId, dto);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { snapshot },
    });
  });

  /**
   * PATCH /api/expenses/:expenseId
   * Update expense
   */
  updateExpense = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { expenseId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!expenseId) {
      res.status(400).json({ success: false, message: 'Expense ID is required' });
      return;
    }

    const dto: UpdateExpenseDTO = req.body;
    const snapshot = await budgetService.updateExpense(expenseId, userId, dto);

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: { snapshot },
    });
  });

  /**
   * DELETE /api/expenses/:expenseId
   * Delete expense
   */
  deleteExpense = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { expenseId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!expenseId) {
      res.status(400).json({ success: false, message: 'Expense ID is required' });
      return;
    }

    const snapshot = await budgetService.deleteExpense(expenseId, userId);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: { snapshot },
    });
  });
}

export default new ExpenseController();