import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

// ─── Signup ──────────────────────────────────────────────────────────────────
export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const result = await authService.signup(name, email, password);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse({
      res,
      statusCode: 201,
      message: 'Account created successfully. Please verify your email.',
      data: { user: result.user, accessToken: result.accessToken },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Login ───────────────────────────────────────────────────────────────────
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, rememberMe } = req.body;
    const result = await authService.login(email, password);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse({
      res,
      message: 'Login successful',
      data: { user: result.user, accessToken: result.accessToken },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Google Auth ──────────────────────────────────────────────────────────────
export async function googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { idToken } = req.body;
    const result = await authService.googleAuth(idToken);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse({
      res,
      message: 'Google authentication successful',
      data: { user: result.user, accessToken: result.accessToken },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, message: 'Refresh token required' });
      return;
    }

    const result = await authService.refreshTokens(token);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse({
      res,
      message: 'Token refreshed successfully',
      data: { accessToken: result.accessToken },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.forgotPassword(req.body.email);
    sendResponse({ res, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    sendResponse({ res, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
}

// ─── Verify Email ─────────────────────────────────────────────────────────────
export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.verifyEmail(req.query.token as string);
    sendResponse({ res, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────
export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user?.id) {
      await authService.logout(req.user.id);
    }
    res.clearCookie('refresh_token');
    sendResponse({ res, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

// ─── Get Me ──────────────────────────────────────────────────────────────────
export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { prisma } = await import('../lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, avatar: true, role: true,
        isEmailVerified: true, travelScore: true, tripsCount: true,
        countriesCount: true, language: true, timezone: true, createdAt: true,
        badges: { include: { badge: true } },
      },
    });
    sendResponse({ res, message: 'User retrieved', data: user });
  } catch (error) {
    next(error);
  }
}
