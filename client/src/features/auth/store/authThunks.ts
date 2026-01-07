import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { setAccessToken } from '../../../services/api';
import { setCsrfToken } from '../../../services/csrf';
import { extractApiError } from '../../../utils/errorHandling';
import type {
  LoginCredentials,
  SignupCredentials,
  GoogleLoginCredentials,
  AuthResponse,
  AuthSuccessPayload,
} from '../types/auth.types';
import { AUTH_ENDPOINTS } from '../constants/authConstants';

/**
 * Async thunk for user login.
 * Handles API call, token management, and CSRF token persistence.
 */
export const loginAsync = createAsyncThunk<
  AuthSuccessPayload,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.LOGIN, {
        usernameOrEmail: credentials.usernameOrEmail,
        password: credentials.password,
      });

      const data = response.data.data;

      // Store CSRF token if provided
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }

      // Store access token in API client
      setAccessToken(data.accessToken);

      return {
        token: data.accessToken,
        user: data.user,
      };
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Login failed'));
    }
  }
);

/**
 * Async thunk for user signup.
 * Handles API call, token management, and CSRF token persistence.
 */
export const signupAsync = createAsyncThunk<
  AuthSuccessPayload,
  SignupCredentials,
  { rejectValue: string }
>(
  'auth/signup',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.REGISTER, {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data.data;

      // Store CSRF token if provided
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }

      // Store access token in API client
      setAccessToken(data.accessToken);

      return {
        token: data.accessToken,
        user: data.user,
      };
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Signup failed'));
    }
  }
);

/**
 * Async thunk for Google OAuth login.
 * Handles API call with ID token, token management, and CSRF token persistence.
 */
export const googleLoginAsync = createAsyncThunk<
  AuthSuccessPayload,
  GoogleLoginCredentials,
  { rejectValue: string }
>(
  'auth/googleLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<{ data: AuthResponse }>(AUTH_ENDPOINTS.GOOGLE, {
        idToken: credentials.idToken,
      });

      const data = response.data.data;

      // Store CSRF token if provided
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }

      // Store access token in API client
      setAccessToken(data.accessToken);

      return {
        token: data.accessToken,
        user: data.user,
      };
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Google login failed'));
    }
  }
);
