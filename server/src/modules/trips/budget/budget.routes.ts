import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware, validate } from '@shared/middlewares';
import budgetController from './budget.controller';
import {
  createBudgetSchema,
  updateBudgetSchema,
  updateBudgetMemberSchema,
  bulkUpdateBudgetMembersSchema
} from './budget.schema';

const router = Router({ mergeParams: true });

router.get('/public', optionalAuthMiddleware, budgetController.getPublicBudgetSummary);

router.use(authMiddleware);

router.post('/', validate(createBudgetSchema), budgetController.createBudget);
router.get('/', budgetController.getBudgetSnapshot);
router.patch('/', validate(updateBudgetSchema), budgetController.updateBudgetBase);
// Note: /members must come before /members/:userId so Express doesn't treat 'bulk' as a userId
router.patch('/members', validate(bulkUpdateBudgetMembersSchema), budgetController.updateBudgetMembersBulk);
router.patch('/members/:userId', validate(updateBudgetMemberSchema), budgetController.updateBudgetMember);

export default router;