import { Request, Response, NextFunction } from 'express';
import userService, { UserError, USER_ERRORS } from './user.service';
import tripService from '../trips/core/trip.service';

function publicProfileUser(u: any, publicTripCount: number) {
  if (!u) return null;
  return {
    username: u.username,
    name: u.name,
    profilePicUrl: u.profilePicUrl,
    bio: u.bio || '',
    publicTripCount
  };
}

function publicUser(u: any) {
  if (!u) return null;
  const idStr = u._id?.toString() || u.id;
  return {
    id: idStr,
    _id: idStr,
    username: u.username,
    name: u.name,
    email: u.email,
    bio: u.bio,
    profilePicUrl: u.profilePicUrl,
    isAdmin: u.isAdmin || false,
    isPublic: u.isPublic || false,
    googleId: u.googleId || null,
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
    if (err instanceof UserError) {
      res.status(err.statusCode).json({ success: false, message: err.message });
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

    const avatarUrl = (req.file as any).path;
    const publicId = (req.file as any).filename;

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
    if (err instanceof UserError) {
      res.status(err.statusCode).json({ success: false, message: err.message });
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
    if (err instanceof UserError) {
      res.status(err.statusCode).json({ success: false, message: err.message });
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

    const updatedUser = await userService.changeUserUsername(req.user.id, username);
    res.status(200).json({ success: true, message: 'Username updated', data: { user: publicUser(updatedUser) } });
  } catch (err: any) {
    if (err instanceof UserError) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
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

    const updatedUser = await userService.changeUserPassword(req.user.id, { currentPassword, newPassword });
    res.status(200).json({ success: true, message: 'Password updated successfully', data: { user: publicUser(updatedUser) } });
  } catch (err: any) {
    if (err instanceof UserError) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username } = req.params;
    if (!username) {
      res.status(400).json({ success: false, message: 'Username is required' });
      return;
    }

    const user = await userService.getUserByUsername(username);
    if (!user || !user.isPublic) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const count = await tripService.countPublicCreatedTripsByUserId(user.id);
    const trips = await tripService.getPublicCreatedTripsByUserId(user.id);

    res.status(200).json({
      success: true,
      message: 'Public profile retrieved successfully',
      data: {
        user: publicProfileUser(user, count),
        trips
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { newEmail, currentPassword } = req.body || {};

    const updatedUser = await userService.updateUserEmail(req.user.id, { newEmail, currentPassword });
    res.status(200).json({ success: true, message: 'Email address updated successfully', data: { user: publicUser(updatedUser) } });
  } catch (err: any) {
    if (err instanceof UserError) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
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
  changePassword,
  updateEmail,
  getPublicProfile
};
