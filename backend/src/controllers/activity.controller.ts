import { Response, NextFunction } from 'express';
import * as activityService from '../services/activity.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export async function addActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const activity = await activityService.addActivity(req.body.destinationId, req.user!.id, req.body);
    sendResponse({ res, statusCode: 201, message: 'Activity added', data: activity });
  } catch (error) { next(error); }
}

export async function updateActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const activity = await activityService.updateActivity(req.params.id, req.user!.id, req.body);
    sendResponse({ res, message: 'Activity updated', data: activity });
  } catch (error) { next(error); }
}

export async function deleteActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await activityService.deleteActivity(req.params.id, req.user!.id);
    sendResponse({ res, message: 'Activity deleted' });
  } catch (error) { next(error); }
}

export async function reorderActivities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await activityService.reorderActivities(req.body.destinationId, req.user!.id, req.body.orderedIds);
    sendResponse({ res, message: 'Activities reordered' });
  } catch (error) { next(error); }
}
