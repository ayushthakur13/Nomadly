import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginAPI, signupAPI, googleLoginAPI } from '../../../services/auth.service';
import type {
  LoginCredentials,
  SignupCredentials,
  GoogleLoginCredentials,
  AuthSuccessPayload,
} from '../types/auth.types';

/**
 * Async thunk for user login.
 * Delegates HTTP handling to central auth.service.ts.
 */
export const loginAsync = createAsyncThunk<
  AuthSuccessPayload,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginAPI(credentials);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

/**
 * Async thunk for user signup.
 * Delegates HTTP handling to central auth.service.ts.
 */
export const signupAsync = createAsyncThunk<
  AuthSuccessPayload,
  SignupCredentials,
  { rejectValue: string }
>(
  'auth/signup',
  async (credentials, { rejectWithValue }) => {
    try {
      return await signupAPI(credentials);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

/**
 * Async thunk for Google OAuth login.
 * Delegates HTTP handling to central auth.service.ts.
 */
export const googleLoginAsync = createAsyncThunk<
  AuthSuccessPayload,
  GoogleLoginCredentials,
  { rejectValue: string }
>(
  'auth/googleLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      return await googleLoginAPI(credentials);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Google login failed');
    }
  }
);

