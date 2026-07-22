import api, { setAccessToken, clearAccessToken } from './api';
import { setCsrfToken, getCsrfToken, clearCsrfToken } from './csrf';
import { extractApiError, type ApiError } from '../utils/errorHandling';
import Cookies from 'js-cookie';
import type {
  LoginCredentials,
  SignupCredentials,
  GoogleLoginCredentials,
  AuthResponse,
  AuthSuccessPayload,
} from '../features/auth/types/auth.types';
import { AUTH_ENDPOINTS } from '../features/auth/constants/authConstants';

/**
 * Login user with credentials
 */
export const loginAPI = async (credentials: LoginCredentials): Promise<AuthSuccessPayload> => {
  try {
    const response = await api.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.LOGIN, {
      usernameOrEmail: credentials.usernameOrEmail,
      password: credentials.password,
    });

    const data = response.data.data;

    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }
    setAccessToken(data.accessToken);

    return {
      token: data.accessToken,
      user: data.user,
    };
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Login failed'));
  }
};

/**
 * Register a new user
 */
export const signupAPI = async (credentials: SignupCredentials): Promise<AuthSuccessPayload> => {
  try {
    const response = await api.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.REGISTER, {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
    });

    const data = response.data.data;

    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }
    setAccessToken(data.accessToken);

    return {
      token: data.accessToken,
      user: data.user,
    };
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Signup failed'));
  }
};

/**
 * Login with Google OAuth ID Token
 */
export const googleLoginAPI = async (credentials: GoogleLoginCredentials): Promise<AuthSuccessPayload> => {
  try {
    const response = await api.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.GOOGLE, {
      idToken: credentials.idToken,
    });

    const data = response.data.data;

    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }
    setAccessToken(data.accessToken);

    return {
      token: data.accessToken,
      user: data.user,
    };
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Google login failed'));
  }
};

/**
 * Refresh access token using CSRF header and refresh cookie
 */
export const refreshSessionAPI = async (): Promise<{ accessToken: string; user: any }> => {
  const csrf = getCsrfToken();
  if (!csrf) {
    throw new Error('Missing CSRF token');
  }

  try {
    const response = await api.post<{ data: { accessToken: string; user: any } }>(
      '/auth/refresh',
      {},
      { headers: { 'x-csrf-token': csrf } }
    );
    const data = response.data.data;
    setAccessToken(data.accessToken);
    return data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Session refresh failed'));
  }
};

/**
 * Logout user securely: calls backend logout endpoint and cleans local tokens
 */
export const logoutAPI = async (): Promise<void> => {
  const csrf = getCsrfToken();
  try {
    await api.post('/auth/logout', {}, { headers: { 'x-csrf-token': csrf || '' } });
  } finally {
    try {
      Cookies.remove('csrf_token', { path: '/api/auth' });
    } catch {}
    clearCsrfToken();
    clearAccessToken();
  }
};
