// User type is imported from shared types - single source of truth
import type { User } from '@shared/types';

export type { User } from '@shared/types';

/**
 * Login credentials
 */
export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

/**
 * Signup/Registration credentials
 */
export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

/**
 * Google OAuth credentials
 */
export interface GoogleLoginCredentials {
  idToken: string;
}

/**
 * Auth response from API
 */
export interface AuthResponse {
  accessToken: string;
  user: User;
  csrfToken?: string;
}

/**
 * Auth state shape in Redux store
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Payload for successful auth operations
 */
export interface AuthSuccessPayload {
  token: string;
  user: User;
}
