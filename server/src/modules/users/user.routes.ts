import express from 'express';
import ctrl from './user.controller';
import { authMiddleware, uploadProfile } from '@shared/middlewares';

const router = express.Router();

router.use(authMiddleware);

router.get('/me', ctrl.getProfile);
router.patch('/me', ctrl.updateProfile);

router.post('/me/avatar', uploadProfile.single('avatar'), ctrl.uploadAvatar);
router.delete('/me/avatar', ctrl.deleteAvatar);

router.patch('/me/username', ctrl.changeUsername);
router.patch('/me/password', ctrl.changePassword);

export default router;
