import { Router } from 'express';
import * as packingController from '../controllers/packing.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/:tripId', packingController.getPackingItems);
router.post('/', packingController.addPackingItem);
router.post('/bulk', packingController.bulkAddItems);
router.put('/:id', packingController.updatePackingItem);
router.delete('/:id', packingController.deletePackingItem);

export default router;
