// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/Auth/AuthSlice';
import loaderReducer from '../utils/loaderSlice'
import profileReducer from '../features/Auth/profileSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    loader: loaderReducer,
    profile: profileReducer
  },
});

export default store;
