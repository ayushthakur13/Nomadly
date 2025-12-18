import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import authService, { AuthError, AUTH_ERRORS } from '../services/auth.service';
import { setRefreshCookie, clearRefreshCookie } from '../utils/jwt';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

function publicUser(u: any) {
  if (!u) return null;
  return {
    id: u._id?.toString() || u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    profilePicUrl: u.profilePicUrl,
    isAdmin: u.isAdmin || false,
    isPublic: u.isPublic || false,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

function setCsrfCookie(res: Response): string {
  const token = crypto.randomBytes(32).toString('hex');
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('csrf_token', token, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth', // Match refresh token path
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

function verifyCsrf(req: Request): boolean {
  const header = Array.isArray(req.headers['x-csrf-token'])
    ? req.headers['x-csrf-token'][0]
    : req.headers['x-csrf-token'];

  const headerToken = typeof header === 'string' ? header : undefined;
  const cookieToken = typeof req.cookies?.csrf_token === 'string' ? req.cookies.csrf_token : undefined;

  return Boolean(headerToken && cookieToken && headerToken === cookieToken);
}

function enforceCsrf(req: Request, res: Response): boolean {
  if (verifyCsrf(req)) return true;

  res.status(403).json({ success: false, message: 'CSRF validation failed' });
  return false;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password, name, email } = req.body;
    
    if (!isNonEmptyString(username) || !isNonEmptyString(password) || !isNonEmptyString(email)) {
      res.status(400).json({
        success: false,
        message: 'username, email and password are required'
      });
      return;
    }

    const result = await authService.registerUser({ username, password, name, email });

    setRefreshCookie(res, result.refreshToken);
    const csrf = setCsrfCookie(res);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: publicUser(result.user),
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        csrfToken: csrf
      }
    });
  } catch (err: any) {
    if (err instanceof AuthError && err.code === AUTH_ERRORS.USERNAME_TAKEN) {
      res.status(409).json({ success: false, message: 'Username already taken' });
      return;
    }
    if (err instanceof AuthError && err.code === AUTH_ERRORS.EMAIL_TAKEN) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { usernameOrEmail, password } = req.body;
    
    if (!isNonEmptyString(usernameOrEmail) || !isNonEmptyString(password)) {
      res.status(400).json({
        success: false,
        message: 'usernameOrEmail and password are required'
      });
      return;
    }

    const result = await authService.loginUser(usernameOrEmail, password);
    
    setRefreshCookie(res, result.refreshToken);
    const csrf = setCsrfCookie(res);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: publicUser(result.user),
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        csrfToken: csrf
      }
    });
  } catch (err: any) {
    if (err instanceof AuthError && err.code === AUTH_ERRORS.INVALID_CREDENTIALS) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!enforceCsrf(req, res)) return;

    const userId = req.user?.id;
    if (userId) {
      await authService.logoutUser(userId);
    }
    
    clearRefreshCookie(res);
    res.clearCookie('csrf_token', {
      path: '/api/auth',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Fetch fresh user data from database
    const user = await authService.getUserById(req.user.id);
    
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: { user: publicUser(user) }
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!enforceCsrf(req, res)) return;

    const token = req.cookies?.refresh_token as string | undefined;
    
    if (!token) {
      res.status(401).json({ success: false, message: 'Missing refresh token' });
      return;
    }

    const result = await authService.refreshAccessToken(token);
    
    setRefreshCookie(res, result.refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: publicUser(result.user)
      }
    });
  } catch (err: any) {
    if (err instanceof AuthError && err.code === AUTH_ERRORS.INVALID_REFRESH_TOKEN) {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }
    next(err);
  }
}

export async function google(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { idToken } = req.body;
    
    if (!isNonEmptyString(idToken)) {
      res.status(400).json({ success: false, message: 'idToken required' });
      return;
    }

    const result = await authService.googleLogin(idToken);
    
    setRefreshCookie(res, result.refreshToken);
    const csrf = setCsrfCookie(res);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: publicUser(result.user),
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        csrfToken: csrf
      }
    });
  } catch (err: any) {
    if (err instanceof AuthError && err.code === AUTH_ERRORS.GOOGLE_NOT_CONFIGURED) {
      res.status(500).json({ success: false, message: 'Google OAuth not configured' });
      return;
    }
    if (
      err instanceof AuthError &&
      (err.code === AUTH_ERRORS.INVALID_GOOGLE_TOKEN || err.code === AUTH_ERRORS.GOOGLE_NO_EMAIL)
    ) {
      res.status(400).json({ success: false, message: 'Invalid Google token' });
      return;
    }
    next(err);
  }
}

export default { register, login, logout, me, refresh, google };