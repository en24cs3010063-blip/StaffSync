import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Load initial state from localStorage if available
const token = localStorage.getItem('staffsync_token');
let storedUser = null;
try {
  const raw = localStorage.getItem('staffsync_user');
  if (raw) storedUser = JSON.parse(raw);
} catch (e) {
  localStorage.removeItem('staffsync_user');
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token, user, employee } = response.data;
      localStorage.setItem('staffsync_token', token);
      localStorage.setItem('staffsync_user', JSON.stringify({ ...user, employee }));
      return { token, user, employee };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/auth/me');
      const { user, employee } = response.data;
      localStorage.setItem('staffsync_user', JSON.stringify({ ...user, employee }));
      return { user, employee };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to authenticate session');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      const { user, employee } = response.data;
      localStorage.setItem('staffsync_user', JSON.stringify({ ...user, employee }));
      return { user, employee };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    user: storedUser || null,
    employee: storedUser?.employee || null,
    isAuthenticated: !!token,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.employee = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('staffsync_token');
      localStorage.removeItem('staffsync_user');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.employee = action.payload.employee;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.employee = null;
        state.error = action.payload;
      });

    // Fetch me
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.employee = action.payload.employee;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.employee = null;
        state.isAuthenticated = false;
      });

    // Update profile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.employee = action.payload.employee;
    });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
