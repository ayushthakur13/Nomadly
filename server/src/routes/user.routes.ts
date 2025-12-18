import express from 'express';
import ctrl from '../controllers/user.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { uploadProfile } from '../middlewares/multer';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/me', ctrl.getProfile);
router.patch('/me', ctrl.updateProfile);

// Avatar routes
router.post('/me/avatar', uploadProfile.single('avatar'), ctrl.uploadAvatar);
router.delete('/me/avatar', ctrl.deleteAvatar);

// Username & Password
router.patch('/me/username', ctrl.changeUsername);
router.patch('/me/password', ctrl.changePassword);

export default router;
