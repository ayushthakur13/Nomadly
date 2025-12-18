import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'createTripModal',
  initialState: { isOpen: false },
  reducers: {
    openCreateTripModal: (state) => { state.isOpen = true; },
    closeCreateTripModal: (state) => { state.isOpen = false; },
  },
});

export const { openCreateTripModal, closeCreateTripModal } = slice.actions;
export default slice.reducer;
