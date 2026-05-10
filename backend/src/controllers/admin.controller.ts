import { Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await adminService.getAdminStats();
    sendResponse({ res, message: 'Stats retrieved', data: stats });
  } catch (error) { next(error); }
}

export async function getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, search } = req.query as Record<string, string>;
    const result = await adminService.getAllUsers(page, limit, search);
    sendResponse({ res, message: 'Users retrieved', data: result.users, meta: result.meta });
  } catch (error) { next(error); }
}

export async function updateUserRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await adminService.updateUserRole(req.params.id, req.body.role);
    sendResponse({ res, message: 'User role updated', data: user });
  } catch (error) { next(error); }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteUser(req.params.id);
    sendResponse({ res, message: 'User deleted' });
  } catch (error) { next(error); }
}
