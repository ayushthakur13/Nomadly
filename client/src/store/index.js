import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import tripsSlice from './tripsSlice';
import createTripModalSlice from './createTripModalSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    trips: tripsSlice,
    createTripModal: createTripModalSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;