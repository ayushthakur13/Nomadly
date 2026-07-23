import User from './user.model';
import Trip from '../trips/core/trip.model';
import { deleteFromCloudinary } from '@shared/utils';

export const USER_ERRORS = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_UPDATE_FIELDS: 'INVALID_UPDATE_FIELDS',
  INVALID_USERNAME: 'INVALID_USERNAME',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  WRONG_CURRENT_PASSWORD: 'WRONG_CURRENT_PASSWORD',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_INPUT: 'INVALID_INPUT'
} as const;

export type UserErrorCode = (typeof USER_ERRORS)[keyof typeof USER_ERRORS];

export class UserError extends Error {
  code: UserErrorCode;
  statusCode: number;

  constructor(code: UserErrorCode, message?: string) {
    super(message || code);
    this.name = 'UserError';
    this.code = code;
    if (code === 'USER_NOT_FOUND') {
      this.statusCode = 404;
    } else if (code === 'USERNAME_TAKEN' || code === 'EMAIL_TAKEN') {
      this.statusCode = 409;
    } else {
      this.statusCode = 400;
    }
  }
}

export interface UpdateProfileDTO {
  name?: string;
  bio?: string;
  isPublic?: boolean;
}

export interface AvatarData {
  url: string;
  publicId: string;
}

export async function getUserById(userId: string) {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new UserError(USER_ERRORS.USER_NOT_FOUND);
  }
  
  return user;
}

export async function getUserByUsername(username: string) {
  return await User.findOne({ username });
}

export async function updateUserProfile(userId: string, updates: UpdateProfileDTO) {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new UserError(USER_ERRORS.USER_NOT_FOUND);
  }

  if (updates.name !== undefined) {
    const trimmedName = updates.name.trim();
    if (trimmedName.length > 50) {
      throw new UserError(USER_ERRORS.INVALID_INPUT, 'Name must be 50 characters or less');
    }
    user.name = trimmedName;
  }

  if (updates.bio !== undefined) {
    const trimmedBio = updates.bio.trim();
    if (trimmedBio.length > 300) {
      throw new UserError(USER_ERRORS.INVALID_INPUT, 'Bio must be 300 characters or less');
    }
    user.bio = trimmedBio;
  }

  if (updates.isPublic !== undefined) {
    const nextIsPublic = Boolean(updates.isPublic);
    if (user.isPublic && !nextIsPublic) {
      // Transition all user's published trips to drafts automatically
      await Trip.updateMany(
        { createdBy: user._id, isPublic: true },
        { isPublic: false }
      );
    }
    user.isPublic = nextIsPublic;
  }

  await user.save();
  return user;
}

export async function updateUserAvatar(userId: string, avatarData: AvatarData) {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new UserError(USER_ERRORS.USER_NOT_FOUND);
  }

  if (user.profilePicPublicId) {
    try {
      await deleteFromCloudinary(user.profilePicPublicId);
    } catch (error) {
      console.warn('Failed to delete old avatar:', error);
    }
  }

  user.profilePicUrl = avatarData.url;
  user.profilePicPublicId = avatarData.publicId;
  
  await user.save();
  return user;
}

export async function deleteUserAvatar(userId: string) {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new UserError(USER_ERRORS.USER_NOT_FOUND);
  }

  if (user.profilePicPublicId) {
    try {
      await deleteFromCloudinary(user.profilePicPublicId);
    } catch (error) {
      console.warn('Failed to delete avatar from Cloudinary:', error);
    }
  }

  user.profilePicUrl = null;
  user.profilePicPublicId = null;
  
  await user.save();
  return user;
}

export async function changeUserUsername(userId: string, newUsername: string) {
  const user = await User.findById(userId);
  if (!user) throw new UserError(USER_ERRORS.USER_NOT_FOUND, 'User not found');

  const username = (newUsername || '').trim();
  const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
  if (!isValid) throw new UserError(USER_ERRORS.INVALID_USERNAME, 'Invalid username (3-20 chars, letters/numbers/underscore only)');

  const exists = await User.findOne({ username });
  if (exists && exists.id !== user.id) {
    throw new UserError(USER_ERRORS.USERNAME_TAKEN, 'Username already taken');
  }

  user.username = username;
  await user.save();
  return user;
}

export async function changeUserPassword(userId: string, payload: { currentPassword?: string; newPassword: string; }) {
  const user = await User.findById(userId);
  if (!user) throw new UserError(USER_ERRORS.USER_NOT_FOUND, 'User not found');

  const newPwd = (payload.newPassword || '').trim();
  if (newPwd.length < 6) throw new UserError(USER_ERRORS.INVALID_PASSWORD, 'Password must be at least 6 characters');

  const hasExisting = !!user.passwordHash;
  if (hasExisting) {
    const current = (payload.currentPassword || '').trim();
    const ok = await (user as any).comparePassword(current);
    if (!ok) throw new UserError(USER_ERRORS.WRONG_CURRENT_PASSWORD, 'Incorrect current password');
  }

  (user as any)._plainPassword = newPwd;
  await user.save();
  return user;
}

export async function updateUserEmail(userId: string, payload: { newEmail: string; currentPassword?: string; }) {
  const user = await User.findById(userId);
  if (!user) throw new UserError(USER_ERRORS.USER_NOT_FOUND, 'User not found');

  if (user.googleId && !user.passwordHash) {
    throw new UserError(USER_ERRORS.INVALID_INPUT, 'Email changes are managed by your Google OAuth provider');
  }

  const email = (payload.newEmail || '').trim().toLowerCase();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) throw new UserError(USER_ERRORS.INVALID_INPUT, 'Invalid email address');

  const existing = await User.findOne({ email });
  if (existing && existing.id !== user.id) {
    throw new UserError(USER_ERRORS.EMAIL_TAKEN, 'Email address is already registered');
  }

  if (user.passwordHash) {
    const current = (payload.currentPassword || '').trim();
    if (!current) throw new UserError(USER_ERRORS.INVALID_INPUT, 'Current password is required to update email');
    const ok = await (user as any).comparePassword(current);
    if (!ok) throw new UserError(USER_ERRORS.WRONG_CURRENT_PASSWORD, 'Incorrect current password');
  }

  user.email = email;
  await user.save();
  return user;
}

export default {
  getUserById,
  getUserByUsername,
  updateUserProfile,
  updateUserAvatar,
  deleteUserAvatar,
  changeUserUsername,
  changeUserPassword,
  updateUserEmail
};
