import express from 'express';
import ctrl from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

// Public
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/google', ctrl.google);
router.post('/refresh', ctrl.refresh);

// Protected
router.post('/logout', authMiddleware, ctrl.logout);
router.get('/me', authMiddleware, ctrl.me);

export default router;
