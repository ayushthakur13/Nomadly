import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tripsReducer from './tripsSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer as any,
    trips: tripsReducer as any,
    ui: uiReducer as any,
  },
});

export default store;
