import { Response, NextFunction } from 'express';
import * as packingService from '../services/packing.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getPackingItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await packingService.getPackingItems(req.params.tripId, req.user!.id);
    sendResponse({ res, message: 'Packing items retrieved', data });
  } catch (error) { next(error); }
}

export async function addPackingItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await packingService.addPackingItem(req.body.tripId, req.user!.id, req.body);
    sendResponse({ res, statusCode: 201, message: 'Item added', data: item });
  } catch (error) { next(error); }
}

export async function updatePackingItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await packingService.updatePackingItem(req.params.id, req.user!.id, req.body);
    sendResponse({ res, message: 'Item updated', data: item });
  } catch (error) { next(error); }
}

export async function deletePackingItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await packingService.deletePackingItem(req.params.id, req.user!.id);
    sendResponse({ res, message: 'Item deleted' });
  } catch (error) { next(error); }
}

export async function bulkAddItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await packingService.bulkAddItems(req.body.tripId, req.user!.id, req.body.items);
    sendResponse({ res, statusCode: 201, message: `${result.count} items added`, data: result });
  } catch (error) { next(error); }
}
