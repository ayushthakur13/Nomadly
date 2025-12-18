import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null as any,
    token: null as string | null,
    initialized: false,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.initialized = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
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
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;
