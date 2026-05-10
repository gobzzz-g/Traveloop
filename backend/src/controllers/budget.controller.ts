import { Response, NextFunction } from 'express';
import * as budgetService from '../services/budget.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await budgetService.getBudget(req.params.tripId, req.user!.id);
    sendResponse({ res, message: 'Budget retrieved', data });
  } catch (error) { next(error); }
}

export async function updateBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const budget = await budgetService.updateBudget(req.params.tripId, req.user!.id, req.body);
    sendResponse({ res, message: 'Budget updated', data: budget });
  } catch (error) { next(error); }
}
