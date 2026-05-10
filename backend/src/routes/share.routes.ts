import { Router } from 'express';
import * as shareController from '../controllers/share.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/public', shareController.getPublicTrips);
router.get('/:slug', shareController.getSharedTrip);
router.post('/:slug/like', shareController.likeSharedTrip);

// Protected routes
router.post('/', authenticate, shareController.createShareLink);
router.delete('/:tripId', authenticate, shareController.deactivateShare);

export default router;
