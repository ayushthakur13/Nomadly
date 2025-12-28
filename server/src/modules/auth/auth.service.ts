import User from '../users/user.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './utils/jwt';
import { hashToken, compareToken } from './utils/hash';
import { OAuth2Client } from 'google-auth-library';
import { uploadFromUrl } from '../../shared/utils/cloudinary.utils';

export const AUTH_ERRORS = {
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  GOOGLE_NOT_CONFIGURED: 'GOOGLE_NOT_CONFIGURED',
  INVALID_GOOGLE_TOKEN: 'INVALID_GOOGLE_TOKEN',
  GOOGLE_NO_EMAIL: 'GOOGLE_NO_EMAIL'
} as const;

export type AuthErrorCode = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
    this.code = code;
  }
}

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_APP_ID
);

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  name?: string;
  profilePicUrl?: string;
}

export async function registerUser(data: RegisterDTO) {
  const { username, email, password, name, profilePicUrl } = data;
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const safeName = name?.trim() || normalizedUsername;
  const safeProfilePicUrl = profilePicUrl?.trim();

  const existing = await User.findOne({
    $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
  });

  if (existing) {
    if (existing.username === normalizedUsername) {
      throw new AuthError(AUTH_ERRORS.USERNAME_TAKEN);
    }
    if (existing.email === normalizedEmail) {
      throw new AuthError(AUTH_ERRORS.EMAIL_TAKEN);
    }
  }

  const user = new User({
    username: normalizedUsername,
    email: normalizedEmail,
    name: safeName,
    profilePicUrl: safeProfilePicUrl
  });

  (user as any)._plainPassword = password;

  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
}

export async function loginUser(usernameOrEmail: string, password: string) {
  const identifier = usernameOrEmail.trim();
  const emailCandidate = identifier.toLowerCase();

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: emailCandidate }]
  });

  if (!user) {
    throw new AuthError(AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthError(AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: any;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AuthError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
  }

  const userId = payload.sub;
  if (!userId) {
    throw new AuthError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
  }

  const isTokenValid = await compareToken(refreshToken, user.refreshTokenHash);
  if (!isTokenValid) {
    throw new AuthError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
  }

  const newRefreshToken = generateRefreshToken(user);
  const newRefreshTokenHash = await hashToken(newRefreshToken);
  
  user.refreshTokenHash = newRefreshTokenHash;
  await user.save();

  const newAccessToken = generateAccessToken(user);

  return {
    user,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
}

export async function logoutUser(userId: string): Promise<boolean> {
  await User.findByIdAndUpdate(userId, {
    $set: { refreshTokenHash: null }
  });
  return true;
}

export async function getUserById(userId: string) {
  return User.findById(userId);
}

export async function googleLogin(idToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_APP_ID;
  
  if (!clientId) {
    throw new AuthError(AUTH_ERRORS.GOOGLE_NOT_CONFIGURED);
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId
    });
  } catch (err) {
    throw new AuthError(AUTH_ERRORS.INVALID_GOOGLE_TOKEN);
  }

  const payload = ticket.getPayload();
  if (!payload) {
    throw new AuthError(AUTH_ERRORS.INVALID_GOOGLE_TOKEN);
  }

  const email = payload.email?.trim().toLowerCase();
  const googleId = payload.sub;
  const name = payload.name?.trim() || '';
  const picture = payload.picture?.trim() || undefined;

  if (!email) {
    throw new AuthError(AUTH_ERRORS.GOOGLE_NO_EMAIL);
  }

  let user = await User.findOne({ googleId });
  
  if (!user) {
    user = await User.findOne({ email });
  }

  if (!user) {
    const baseUsername = email.split('@')[0];
    let username = baseUsername;
    let counter = 1;

    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    let cloudinaryUrl = undefined;
    let cloudinaryPublicId = undefined;
    
    if (picture) {
      const uploadResult = await uploadFromUrl(picture, 'nomadly/profiles');
      if (uploadResult) {
        cloudinaryUrl = uploadResult.url;
        cloudinaryPublicId = uploadResult.publicId;
      }
    }

    user = new User({
      username,
      email,
      name,
      profilePicUrl: cloudinaryUrl || picture,
      profilePicPublicId: cloudinaryPublicId,
      googleId
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    
    if (!user.profilePicUrl && picture) {
      const uploadResult = await uploadFromUrl(picture, 'nomadly/profiles');
      if (uploadResult) {
        user.profilePicUrl = uploadResult.url;
        user.profilePicPublicId = uploadResult.publicId;
      }
    }
  }

  const refreshToken = generateRefreshToken(user);
  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  const accessToken = generateAccessToken(user);

  return { user, accessToken, refreshToken };
}

export default {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  googleLogin,
  getUserById
};
