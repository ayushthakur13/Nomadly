import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../../modules/auth/utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        isAdmin: boolean;
      };
    }
  }
}

export default function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const sendAuthError = (message: string) => {
    res.status(401).json({ success: false, message });
  };

  try {
    const authHeader = req.headers.authorization;
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;

    if (!token) {
      sendAuthError('Missing authorization token');
      return;
    }

    const payload: AccessTokenPayload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      isAdmin: payload.isAdmin || false
    };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      sendAuthError('Token expired');
      return;
    }
    if (err.name === 'JsonWebTokenError') {
      sendAuthError('Invalid token');
      return;
    }
    sendAuthError('Authentication failed');
  }
}
