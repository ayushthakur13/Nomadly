import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginAsync, signupAsync, googleLoginAsync } from './authThunks';
import type {
  AuthState,
  AuthSuccessPayload,
} from '../types/auth.types';
import type { User } from '@shared/types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  initialized: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<AuthSuccessPayload>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.initialized = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.initialized = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.initialized = true;
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
    updateProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action: PayloadAction<{ user: Partial<User> }>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload.user };
      }
      state.loading = false;
      state.error = null;
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // loginAsync handlers
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.initialized = true;
      });

    // signupAsync handlers
    builder
      .addCase(signupAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Signup failed';
        state.initialized = true;
      });

    // googleLoginAsync handlers
    builder
      .addCase(googleLoginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(googleLoginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Google login failed';
        state.initialized = true;
      });
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  setInitialized,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure
} = authSlice.actions;
export default authSlice.reducer;
