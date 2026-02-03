import { Router } from 'express';
import { authMiddleware } from '@shared/middlewares';
import budgetController from './budget.controller';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', budgetController.createBudget);
router.get('/', budgetController.getBudgetSnapshot);
router.patch('/members/:userId', budgetController.updateBudgetMember);

export default router;