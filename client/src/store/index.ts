import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tripsReducer from './tripsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer as any,
    trips: tripsReducer as any,
  },
});

export default store;
