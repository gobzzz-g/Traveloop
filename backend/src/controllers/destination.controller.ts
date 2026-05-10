import { Response, NextFunction } from 'express';
import * as destinationService from '../services/destination.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export async function addDestination(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const dest = await destinationService.addDestination(req.body.tripId, req.user!.id, req.body);
    sendResponse({ res, statusCode: 201, message: 'Destination added', data: dest });
  } catch (error) { next(error); }
}

export async function updateDestination(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const dest = await destinationService.updateDestination(req.params.id, req.user!.id, req.body);
    sendResponse({ res, message: 'Destination updated', data: dest });
  } catch (error) { next(error); }
}

export async function deleteDestination(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await destinationService.deleteDestination(req.params.id, req.user!.id);
    sendResponse({ res, message: 'Destination deleted' });
  } catch (error) { next(error); }
}

export async function reorderDestinations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await destinationService.reorderDestinations(req.body.tripId, req.user!.id, req.body.orderedIds);
    sendResponse({ res, message: 'Destinations reordered' });
  } catch (error) { next(error); }
}
