import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tripsReducer from './tripsSlice';
import createTripModalReducer from './createTripModalSlice';

const store = configureStore({
  reducer: {
    auth: authReducer as any,
    trips: tripsReducer as any,
    createTripModal: createTripModalReducer as any,
  },
});

export default store;
