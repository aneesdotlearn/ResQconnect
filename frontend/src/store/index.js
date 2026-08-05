import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sosReducer from './slices/sosSlice';
import locationReducer from './slices/locationSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sos: sosReducer,
    location: locationReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['sos.activeAlert'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export default store;