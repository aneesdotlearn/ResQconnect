import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
  },
});

export const { setAccessToken, clearAuth, clearError, setInitialized } = authSlice.actions;
export default authSlice.reducer;