// src/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { redirect } from 'react-router-dom';

const initialState = {
  roleId: null,
  accessToken: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  username: null,
  gmail: null, 
  userId: null,
};

// Thunk: Gửi Google Token lên server để xác thực + nhận Access Token
export const googleLoginThunk = createAsyncThunk(
  'auth/googleLogin',
  async (googleToken, { rejectWithValue }) => {
    try {
      // Gửi token Google lên server
      console.log("google token : ", googleToken)
      const response = await axios.post('https://booklab-faise.runasp.net/odata/Authenticate/google-response', {
        token: googleToken,
        redirectUri: window.location.origin,
      }, {
        // cho phép gửi cookie (Refresh Token) từ server
        withCredentials: true,
      });
      // Server trả về: { accessToken, user }, Refresh Token ở Cookie
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk: Server sẽ đọc Refresh Token từ Cookie, trả về Access Token mới
export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('https://booklab-faise.runasp.net/odata/Authenticate/refresh', null, {
        withCredentials: true, // Gửi Cookie
      });
      return response.data; // { accessToken }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.roleId = null;
      state.accessToken = null;
      state.status = 'idle';
      state.error = null;
      state.username = null;
      state.userId = null;
      localStorage.removeItem('roleId');
    },
  },
  extraReducers: (builder) => {
    builder
      // GOOGLE LOGIN
      .addCase(googleLoginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
        state.roleId = action.payload.roleId;
        localStorage.setItem('roleId', JSON.stringify(action.payload.roleId));
        state.username = action.payload.name;
        state.gmail = action.payload.gmail;
        state.userId = action.payload.userId;
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // REFRESH TOKEN
      .addCase(refreshTokenThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
        state.gmail = action.payload.gmail;
        state.username = action.payload.name;
        state.userId = action.payload.userId;
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
