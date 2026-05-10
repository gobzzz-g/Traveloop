import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { rateLimit } from 'express-rate-limit';

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many AI requests. Please wait a moment.' },
});

const router = Router();
router.use(authenticate);
router.use(aiRateLimit);

router.post('/itinerary', aiController.generateItinerary);
router.post('/budget', aiController.estimateBudget);
router.post('/chat', aiController.chat);
router.post('/packing', aiController.generatePackingList);
router.get('/destination/:city/:country', aiController.getDestinationInsights);

export default router;
