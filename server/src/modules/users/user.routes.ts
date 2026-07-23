import express from 'express';
import ctrl from './user.controller';
import { authMiddleware, uploadProfile, validate } from '@shared/middlewares';
import { asyncHandler } from '@shared/utils';
import { updateProfileSchema, changeUsernameSchema, changePasswordSchema, updateEmailSchema } from './user.schema';

const router = express.Router();

router.get('/public/:username', asyncHandler(ctrl.getPublicProfile));

router.use(authMiddleware);

router.get('/me', ctrl.getProfile);
router.patch('/me', validate(updateProfileSchema), ctrl.updateProfile);

router.post('/me/avatar', uploadProfile.single('avatar'), ctrl.uploadAvatar);
router.delete('/me/avatar', ctrl.deleteAvatar);

router.patch('/me/username', validate(changeUsernameSchema), ctrl.changeUsername);
router.patch('/me/password', validate(changePasswordSchema), ctrl.changePassword);
router.patch('/me/email', validate(updateEmailSchema), ctrl.updateEmail);

export default router;
