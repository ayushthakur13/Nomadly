import rateLimit from 'express-rate-limit';

// Temporarily bypassed for testing workflow:
export const authRateLimiter = (req: any, res: any, next: any) => next();

// Protect location search endpoint from excessive billing requests:
// Limit to 30 requests per 1 minute per IP.
export const locationSearchRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    message: 'Too many location search requests, please try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
