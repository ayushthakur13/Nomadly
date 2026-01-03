import User from './user.model';
import { deleteFromCloudinary } from '@shared/utils';

export const USER_ERRORS = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_UPDATE_FIELDS: 'INVALID_UPDATE_FIELDS',
  INVALID_USERNAME: 'INVALID_USERNAME',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  WRONG_CURRENT_PASSWORD: 'WRONG_CURRENT_PASSWORD',
  INVALID_PASSWORD: 'INVALID_PASSWORD'
} as const;

export type UserErrorCode = (typeof USER_ERRORS)[keyof typeof USER_ERRORS];

export class UserError extends Error {
  code: UserErrorCode;

  constructor(code: UserErrorCode) {
    super(code);
    this.name = 'UserError';
    this.code = code;
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

export async function updateUserProfile(userId: string, updates: UpdateProfileDTO) {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new UserError(USER_ERRORS.USER_NOT_FOUND);
  }

  if (updates.name !== undefined) {
    const trimmedName = updates.name.trim();
    if (trimmedName.length > 50) {
      throw new Error('Name must be 50 characters or less');
    }
    user.name = trimmedName;
  }

  if (updates.bio !== undefined) {
    const trimmedBio = updates.bio.trim();
    if (trimmedBio.length > 300) {
      throw new Error('Bio must be 300 characters or less');
    }
    user.bio = trimmedBio;
  }

  if (updates.isPublic !== undefined) {
    user.isPublic = Boolean(updates.isPublic);
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
  if (!user) throw new UserError(USER_ERRORS.USER_NOT_FOUND);

  const username = (newUsername || '').trim();
  const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
  if (!isValid) throw new UserError(USER_ERRORS.INVALID_USERNAME);

  const exists = await User.findOne({ username });
  if (exists && exists.id !== user.id) {
    throw new UserError(USER_ERRORS.USERNAME_TAKEN);
  }

  user.username = username;
  await user.save();
  return user;
}

export async function changeUserPassword(userId: string, payload: { currentPassword?: string; newPassword: string; }) {
  const user = await User.findById(userId);
  if (!user) throw new UserError(USER_ERRORS.USER_NOT_FOUND);

  const newPwd = (payload.newPassword || '').trim();
  if (newPwd.length < 6) throw new UserError(USER_ERRORS.INVALID_PASSWORD);

  const hasExisting = !!user.passwordHash;
  if (hasExisting) {
    const current = (payload.currentPassword || '').trim();
    const ok = await (user as any).comparePassword(current);
    if (!ok) throw new UserError(USER_ERRORS.WRONG_CURRENT_PASSWORD);
  }

  (user as any)._plainPassword = newPwd;
  await user.save();
  return user;
}

export default {
  getUserById,
  updateUserProfile,
  updateUserAvatar,
  deleteUserAvatar,
  changeUserUsername,
  changeUserPassword
};
