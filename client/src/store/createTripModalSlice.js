import { createSlice } from '@reduxjs/toolkit';

const createTripModalSlice = createSlice({
  name: 'createTripModal',
  initialState: {
    isOpen: false
  },
  reducers: {
    openCreateTripModal: (state) => {
      state.isOpen = true;
    },
    closeCreateTripModal: (state) => {
      state.isOpen = false;
    }
  }
});

export const { openCreateTripModal, closeCreateTripModal } = createTripModalSlice.actions;
export default createTripModalSlice.reducer;