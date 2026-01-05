import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import { tripsReducer } from '../features/trips/store';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    trips: tripsReducer,
    ui: uiReducer,
  },
});

// Export types for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
