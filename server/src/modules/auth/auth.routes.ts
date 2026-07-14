import express from 'express';
import ctrl from './auth.controller';
import { authMiddleware, authRateLimiter } from '@shared/middlewares';

const router = express.Router();

// Public
router.post('/register', authRateLimiter, ctrl.register);
router.post('/login', authRateLimiter, ctrl.login);
router.post('/google', authRateLimiter, ctrl.google);
router.post('/refresh', authRateLimiter, ctrl.refresh);

// Protected
router.post('/logout', authMiddleware, ctrl.logout);
router.get('/me', authMiddleware, ctrl.me);

export default router;
