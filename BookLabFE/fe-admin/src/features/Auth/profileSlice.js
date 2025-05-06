// src/features/profile/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/ApiClient'; // Giả sử apiClient đã được cấu hình với withCredentials: true

// Thunk để gọi API /profile
export const fetchProfile = createAsyncThunk(
  'auth/profile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/Authenticate/profile');
      return response.data; // { message, userId, email, jti, roleId }
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch profile');
    }
  }
);


const initialState = {
  userId: null,
  username:  null,
  gmail: null,
  avatar: null,
  campusName: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  isLogOut: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile(state) {
      state.userId = null;
      state.gmail = null;
      state.avatar = null;
      state.campusName = null;
      state.username = null;
      state.status = 'idle';
      state.error = null;
      state.isLogOut = true;
      localStorage.removeItem('roleId');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userId = action.payload.userId;
        state.gmail = action.payload.gmail;
        state.username = action.payload.username;
        state.avatar = action.payload.avatar;
        state.campusName = action.payload.campusName;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;