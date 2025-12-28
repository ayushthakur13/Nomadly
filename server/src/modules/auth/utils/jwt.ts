import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { IUser } from '../../users/user.model';

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '7d';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'secret-access';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secret-refresh';

export interface AccessTokenPayload {
  sub: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

export interface RefreshTokenPayload {
  sub: string;
}

export function generateAccessToken(user: Partial<IUser>): string {
  const payload: AccessTokenPayload = {
    sub: user._id?.toString() || (user as any).id || '',
    username: user.username || '',
    email: user.email || '',
    isAdmin: (user as any).isAdmin || false,
  };

  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL as string | number
  } as jwt.SignOptions);
}

export function generateRefreshToken(user: Partial<IUser>): string {
  const payload: RefreshTokenPayload = {
    sub: user._id?.toString() || (user as any).id || ''
  };

  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL as string | number
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}

export function setRefreshCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res: Response): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
  });
}

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
};