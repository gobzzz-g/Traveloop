import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError } from '../utils/ApiError';

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, avatar: true, role: true,
        isEmailVerified: true, travelScore: true, tripsCount: true,
        countriesCount: true, language: true, timezone: true, createdAt: true,
        badges: { include: { badge: true } },
        _count: { select: { trips: true, notes: true } },
      },
    });
    sendResponse({ res, message: 'Profile retrieved', data: user });
  } catch (error) { next(error); }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, language, timezone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, language, timezone },
      select: { id: true, name: true, email: true, avatar: true, language: true, timezone: true },
    });
    sendResponse({ res, message: 'Profile updated', data: user });
  } catch (error) { next(error); }
}

export async function updateAvatar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) throw new ApiError(400, 'Avatar URL is required');
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar: avatarUrl },
      select: { id: true, avatar: true },
    });
    sendResponse({ res, message: 'Avatar updated', data: user });
  } catch (error) { next(error); }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw new ApiError(400, 'Both passwords are required');

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.password) throw new ApiError(400, 'Password not set. Use Google login.');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new ApiError(401, 'Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.id }, data: { password: hashed } });

    sendResponse({ res, message: 'Password changed successfully' });
  } catch (error) { next(error); }
}
