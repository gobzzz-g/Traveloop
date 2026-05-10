import { Response, NextFunction } from 'express';
import * as tripService from '../services/trip.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export async function createTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await tripService.createTrip(req.user!.id, req.body);
    sendResponse({ res, statusCode: 201, message: 'Trip created successfully', data: trip });
  } catch (error) { next(error); }
}

export async function getTrips(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await tripService.getTrips(req.user!.id, req.query as Record<string, string>);
    sendResponse({ res, message: 'Trips retrieved', data: result.trips, meta: result.meta });
  } catch (error) { next(error); }
}

export async function getTripById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await tripService.getTripById(req.params.id, req.user!.id);
    sendResponse({ res, message: 'Trip retrieved', data: trip });
  } catch (error) { next(error); }
}

export async function updateTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.user!.id, req.body);
    sendResponse({ res, message: 'Trip updated successfully', data: trip });
  } catch (error) { next(error); }
}

export async function deleteTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await tripService.deleteTrip(req.params.id, req.user!.id);
    sendResponse({ res, message: 'Trip deleted successfully' });
  } catch (error) { next(error); }
}

export async function duplicateTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await tripService.duplicateTrip(req.params.id, req.user!.id);
    sendResponse({ res, statusCode: 201, message: 'Trip duplicated successfully', data: trip });
  } catch (error) { next(error); }
}

export async function getTripStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await tripService.getTripStats(req.user!.id);
    sendResponse({ res, message: 'Stats retrieved', data: stats });
  } catch (error) { next(error); }
}
