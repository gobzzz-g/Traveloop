import { Router } from 'express';
import * as destController from '../controllers/destination.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/', destController.addDestination);
router.put('/reorder', destController.reorderDestinations);
router.put('/:id', destController.updateDestination);
router.delete('/:id', destController.deleteDestination);

export default router;
