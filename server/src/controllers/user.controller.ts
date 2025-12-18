import { Request, Response, NextFunction } from 'express';
import userService, { UserError, USER_ERRORS } from '../services/user.service';

function publicUser(u: any) {
  if (!u) return null;
  return {
    id: u._id?.toString() || u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    bio: u.bio,
    profilePicUrl: u.profilePicUrl,
    isAdmin: u.isAdmin || false,
    isPublic: u.isPublic || false,
    hasPassword: Boolean(u.passwordHash),
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await userService.getUserById(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: publicUser(user)
      }
    });
  } catch (err: any) {
    if (err instanceof UserError && err.code === USER_ERRORS.USER_NOT_FOUND) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { name, bio, isPublic } = req.body;

    // Validate at least one field is provided
    if (name === undefined && bio === undefined && isPublic === undefined) {
      res.status(400).json({
        success: false,
        message: 'At least one field (name, bio, isPublic) must be provided'
      });
      return;
    }

    const updatedUser = await userService.updateUserProfile(req.user.id, {
      name,
      bio,
      isPublic
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: publicUser(updatedUser)
      }
    });
  } catch (err: any) {
    if (err instanceof UserError && err.code === USER_ERRORS.USER_NOT_FOUND) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    if (err.message?.includes('Name must be') || err.message?.includes('Bio must be')) {
      res.status(400).json({
        success: false,
        message: err.message
      });
      return;
    }

    next(err);
  }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Avatar image is required'
      });
      return;
    }

    // Multer + Cloudinary provides file info
    const avatarUrl = req.file.path;
    const publicId = req.file.filename;

    const updatedUser = await userService.updateUserAvatar(req.user.id, {
      url: avatarUrl,
      publicId: publicId
    });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        user: publicUser(updatedUser)
      }
    });
  } catch (err: any) {
    if (err instanceof UserError && err.code === USER_ERRORS.USER_NOT_FOUND) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    next(err);
  }
}

export async function deleteAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const updatedUser = await userService.deleteUserAvatar(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully',
      data: {
        user: publicUser(updatedUser)
      }
    });
  } catch (err: any) {
    if (err instanceof UserError && err.code === USER_ERRORS.USER_NOT_FOUND) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    next(err);
  }
}

export async function changeUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { username } = req.body || {};
    if (typeof username !== 'string') {
      res.status(400).json({ success: false, message: 'username is required' });
      return;
    }

    const updatedUser = await userService.changeUserUsername(req.user.id, username);
    res.status(200).json({ success: true, message: 'Username updated', data: { user: publicUser(updatedUser) } });
  } catch (err: any) {
    if (err instanceof UserError) {
      if (err.code === USER_ERRORS.INVALID_USERNAME) {
        res.status(400).json({ success: false, message: 'Invalid username (3-20 chars, letters/numbers/underscore only)' });
        return;
      }
      if (err.code === USER_ERRORS.USERNAME_TAKEN) {
        res.status(409).json({ success: false, message: 'Username already taken' });
        return;
      }
      if (err.code === USER_ERRORS.USER_NOT_FOUND) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
    }
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { currentPassword, newPassword } = req.body || {};
    if (typeof newPassword !== 'string') {
      res.status(400).json({ success: false, message: 'newPassword is required' });
      return;
    }

    const updatedUser = await userService.changeUserPassword(req.user.id, { currentPassword, newPassword });
    res.status(200).json({ success: true, message: 'Password updated successfully', data: { user: publicUser(updatedUser) } });
  } catch (err: any) {
    if (err instanceof UserError) {
      if (err.code === USER_ERRORS.INVALID_PASSWORD) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        return;
      }
      if (err.code === USER_ERRORS.WRONG_CURRENT_PASSWORD) {
        res.status(400).json({ success: false, message: 'Invalid current password' });
        return;
      }
      if (err.code === USER_ERRORS.USER_NOT_FOUND) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
    }
    next(err);
  }
}

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changeUsername,
  changePassword
};
