import { Router } from 'express';
import { authMiddleware, validate } from '@shared/middlewares';
import expenseController from './expense.controller';
import { createExpenseSchema, updateExpenseSchema } from './budget.schema';

const tripExpenseRouter = Router({ mergeParams: true });
tripExpenseRouter.use(authMiddleware);

tripExpenseRouter.post('/', validate(createExpenseSchema), expenseController.createExpense);

const expenseItemRouter = Router();
expenseItemRouter.use(authMiddleware);

expenseItemRouter.patch('/:expenseId', validate(updateExpenseSchema), expenseController.updateExpense);
expenseItemRouter.delete('/:expenseId', expenseController.deleteExpense);

export { tripExpenseRouter, expenseItemRouter };