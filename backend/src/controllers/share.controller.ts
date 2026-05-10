import { Request, Response, NextFunction } from 'express';
import * as shareService from '../services/share.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export async function createShareLink(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const shared = await shareService.createShareLink(req.body.tripId, req.user!.id, req.body.expiresInDays);
    sendResponse({ res, statusCode: 201, message: 'Share link created', data: shared });
  } catch (error) { next(error); }
}

export async function getSharedTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const shared = await shareService.getSharedTrip(req.params.slug);
    sendResponse({ res, message: 'Shared trip retrieved', data: shared });
  } catch (error) { next(error); }
}

export async function likeSharedTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const shared = await shareService.likeSharedTrip(req.params.slug);
    sendResponse({ res, message: 'Trip liked', data: shared });
  } catch (error) { next(error); }
}

export async function deactivateShare(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await shareService.deactivateShare(req.params.tripId, req.user!.id);
    sendResponse({ res, message: 'Share link deactivated' });
  } catch (error) { next(error); }
}

export async function getPublicTrips(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, search } = req.query as Record<string, string>;
    const result = await shareService.getPublicTrips(page, limit, search);
    sendResponse({ res, message: 'Public trips retrieved', data: result.trips, meta: result.meta });
  } catch (error) { next(error); }
}
