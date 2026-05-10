import { Router } from 'express';
import * as tripController from '../controllers/trip.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTripSchema, updateTripSchema, listTripsSchema } from '../validators/trip.validator';

const router = Router();

router.use(authenticate);

router.get('/stats', tripController.getTripStats);
router.get('/', validate(listTripsSchema), tripController.getTrips);
router.post('/', validate(createTripSchema), tripController.createTrip);
router.get('/:id', tripController.getTripById);
router.put('/:id', validate(updateTripSchema), tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);
router.post('/:id/duplicate', tripController.duplicateTrip);

export default router;
