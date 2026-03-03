import { Router } from 'express';
import { authMiddleware } from '@shared/middlewares';
import budgetController from './budget.controller';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', budgetController.createBudget);
router.get('/', budgetController.getBudgetSnapshot);
router.patch('/', budgetController.updateBudgetBase);
// Note: /members must come before /members/:userId so Express doesn't treat 'bulk' as a userId
router.patch('/members', budgetController.updateBudgetMembersBulk);
router.patch('/members/:userId', budgetController.updateBudgetMember);

export default router;