import { Router } from 'express';
import { authMiddleware } from '@shared/middlewares';
import expenseController from './expense.controller';

const tripExpenseRouter = Router({ mergeParams: true });
tripExpenseRouter.use(authMiddleware);

tripExpenseRouter.post('/', expenseController.createExpense);

const expenseItemRouter = Router();
expenseItemRouter.use(authMiddleware);

expenseItemRouter.patch('/:expenseId', expenseController.updateExpense);
expenseItemRouter.delete('/:expenseId', expenseController.deleteExpense);

export { tripExpenseRouter, expenseItemRouter };