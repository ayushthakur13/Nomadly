import User from '../models/user.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { hashToken, compareToken } from '../utils/hash';
import { OAuth2Client } from 'google-auth-library';

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
  const safeName = name?.trim();
  const safeProfilePicUrl = profilePicUrl?.trim();

  // Check for existing username or email
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

  // Create new user
  const user = new User({
    username: normalizedUsername,
    email: normalizedEmail,
    name: safeName,
    profilePicUrl: safeProfilePicUrl
  });

  // Set plain password (will be hashed by pre-save hook)
  (user as any)._plainPassword = password;

  // Generate tokens before persisting to avoid a second write
  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  // Persist hashed refresh token
  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
}

export async function loginUser(usernameOrEmail: string, password: string) {
  const identifier = usernameOrEmail.trim();
  const emailCandidate = identifier.toLowerCase();

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ username: identifier }, { email: emailCandidate }]
  });

  if (!user) {
    throw new AuthError(AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  // Compare password using instance method
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthError(AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  // Generate new tokens
  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  // Store hashed refresh token
  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  // Verify token signature and expiration
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

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
  }

  // Verify token matches stored hash
  const isTokenValid = await compareToken(refreshToken, user.refreshTokenHash);
  if (!isTokenValid) {
    throw new AuthError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
  }

  // Implement token rotation for security
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
  // Clear refresh token hash to invalidate all sessions
  await User.findByIdAndUpdate(userId, {
    $set: { refreshTokenHash: null }
  });
  return true;
}

export async function googleLogin(idToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_APP_ID;
  
  if (!clientId) {
    throw new AuthError(AUTH_ERRORS.GOOGLE_NOT_CONFIGURED);
  }

  // Verify Google ID token
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

  // Try to find existing user by googleId first, then by email
  let user = await User.findOne({ googleId });
  
  if (!user) {
    user = await User.findOne({ email });
  }

  if (!user) {
    // Create new user with unique username
    const baseUsername = email.split('@')[0];
    let username = baseUsername;
    let counter = 1;

    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    user = new User({
      username,
      email,
      name,
      profilePicUrl: picture,
      googleId
    });
  } else if (!user.googleId) {
    // Link Google ID to existing account
    user.googleId = googleId;
  }

  // Generate tokens
  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  // Store hashed refresh token
  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
}

export async function getUserById(userId: string) {
  return User.findById(userId);
}

export default {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  googleLogin,
  getUserById
};