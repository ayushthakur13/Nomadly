import rateLimit from 'express-rate-limit';

// Prevent brute-force credential guessing on auth endpoints:
// Limit to 15 requests per 15 minutes per IP.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

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
