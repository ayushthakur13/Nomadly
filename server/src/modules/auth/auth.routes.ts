import express from 'express';
import ctrl from './auth.controller';
import { authMiddleware, authRateLimiter, validate, csrfProtection } from '@shared/middlewares';
import { registerSchema, loginSchema, googleAuthSchema } from './auth.schema';

const router = express.Router();

// Public
router.post('/register', authRateLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authRateLimiter, validate(loginSchema), ctrl.login);
router.post('/google', authRateLimiter, validate(googleAuthSchema), ctrl.google);
router.post('/refresh', authRateLimiter, csrfProtection, ctrl.refresh);

// Protected
router.post('/logout', authMiddleware, csrfProtection, ctrl.logout);
router.get('/me', authMiddleware, ctrl.me);

export default router;
