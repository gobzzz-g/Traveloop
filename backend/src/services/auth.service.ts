import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
} from '../utils/jwt';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/email';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Signup ──────────────────────────────────────────────────────────────────
export async function signup(name: string, email: string, password: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerifyToken,
    },
    select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
  });

  // Send verification email (non-blocking)
  if (process.env.SMTP_USER) {
    sendVerificationEmail(email, name, emailVerifyToken).catch(console.error);
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return { user, accessToken, refreshToken };
}

// ─── Login ───────────────────────────────────────────────────────────────────
export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  const { password: _, emailVerifyToken: __, resetToken: ___, refreshToken: ____, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken };
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────
export async function googleAuth(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new ApiError(400, 'Invalid Google token');
  }

  const { email, name, picture, sub: googleId } = payload;

  let user = await prisma.user.findFirst({
    where: { OR: [{ email }, { googleId }] },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        avatar: picture,
        googleId,
        isEmailVerified: true,
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, isEmailVerified: true, avatar: user.avatar || picture },
    });
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  const { password: _, emailVerifyToken: __, resetToken: ___, refreshToken: ____, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken };
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
export async function refreshTokens(token: string) {
  const decoded = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

  return { accessToken, refreshToken: newRefreshToken };
}

// ─── Forgot Password ─────────────────────────────────────────────────────────
export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user) return;

  const resetToken = generateResetToken();
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  if (process.env.SMTP_USER) {
    await sendPasswordResetEmail(email, user.name, resetToken);
  }
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      refreshToken: null,
    },
  });
}

// ─── Verify Email ─────────────────────────────────────────────────────────────
export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) {
    throw new ApiError(400, 'Invalid verification token');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null },
  });
}

// ─── Logout ──────────────────────────────────────────────────────────────────
export async function logout(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}
