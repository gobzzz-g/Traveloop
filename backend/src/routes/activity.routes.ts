import { Router } from 'express';
import * as activityController from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/', activityController.addActivity);
router.put('/reorder', activityController.reorderActivities);
router.put('/:id', activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

export default router;
