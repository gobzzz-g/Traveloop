import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/:tripId', budgetController.getBudget);
router.put('/:tripId', budgetController.updateBudget);

export default router;
