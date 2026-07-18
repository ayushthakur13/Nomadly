import { Request, Response, NextFunction } from 'express';

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const header = Array.isArray(req.headers['x-csrf-token'])
    ? req.headers['x-csrf-token'][0]
    : req.headers['x-csrf-token'];

  const headerToken = typeof header === 'string' ? header : undefined;
  const cookieToken = typeof req.cookies?.csrf_token === 'string' ? req.cookies.csrf_token : undefined;

  if (headerToken && cookieToken && headerToken === cookieToken) {
    next();
    return;
  }

  res.status(403).json({ success: false, message: 'CSRF validation failed' });
}
