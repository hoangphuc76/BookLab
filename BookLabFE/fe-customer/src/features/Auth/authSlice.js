// src/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


const initialState = {
  roleId: null,
  campusId: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};



// Thunk: Gửi Google Token lên server để xác thực + nhận Access Token
export const googleLoginThunk = createAsyncThunk(
  'auth/googleLogin',
  async (googleToken, { rejectWithValue }) => {
    try {
      // Gửi token Google lên server
      const response = await axios.post('https://localhost:5001/odata/Authenticate/google-response', {
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
      const response = await axios.post('https://localhost:5001/odata/Authenticate/refresh', null, {
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
      state.status = 'idle';
      state.error = null;
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
        state.roleId = action.payload.roleId;
        state.campusId = action.payload.campusId;
        localStorage.setItem('campusId', JSON.stringify(action.payload.campusId));
        localStorage.setItem('roleId', JSON.stringify(action.payload.roleId));
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
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
