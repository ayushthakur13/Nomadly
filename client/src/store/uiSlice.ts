import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarCollapsed: boolean;
  hasUserPreference: boolean;
}

const getInitialState = (): UiState => {
  if (typeof window !== 'undefined') {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    const savedPref = localStorage.getItem('sidebarHasPreference');
    return {
      sidebarCollapsed: savedCollapsed ? savedCollapsed === 'true' : false,
      hasUserPreference: savedPref === 'true',
    };
  }
  return { sidebarCollapsed: false, hasUserPreference: false };
};

const initialState: UiState = getInitialState();

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      state.hasUserPreference = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarCollapsed', String(state.sidebarCollapsed));
        localStorage.setItem('sidebarHasPreference', 'true');
      }
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarCollapsed', String(state.sidebarCollapsed));
      }
    },
    setHasUserPreference(state, action: PayloadAction<boolean>) {
      state.hasUserPreference = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarHasPreference', String(state.hasUserPreference));
      }
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setHasUserPreference } = uiSlice.actions;
export default uiSlice.reducer;
