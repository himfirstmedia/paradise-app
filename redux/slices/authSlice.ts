import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  role: "SUPER_ADMIN" | "DIRECTOR" | "MANAGER" | "RESIDENT";
  houseId?: number;
  house?: any | null;
  city: string;
  state: string;
  zipCode: string;
  image?: string;
  task: any[];
  currentChore?: {
    id: number;
    name: string;
  };
  currentChoreId?: number;
  expoPushToken?: string;
  periodStart?: string;
  periodEnd?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  expoPushToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  expoPushToken: null,
};

// 🔐 Login Thunk (NO token logic here)
export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/users/login', { email, password });
      if (response.data && response.data.id) {
        return { user: response.data };
      }
      return rejectWithValue('Invalid login response');
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Login failed');
    }
  }
);

// ✅ Validate push token thunk
export const validatePushToken = createAsyncThunk(
  'auth/validatePushToken',
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.expoPushToken;

    if (!token) {
      return rejectWithValue('No Expo push token available');
    }

    try {
      const response = await api.post('/users/validate-push-token', { token });
      if (response.data?.valid) {
        return response.data.valid;
      }
      return rejectWithValue('Expo token is invalid');
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || 'Push token validation failed'
      );
    }
  }
);

// 🔐 Logout
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    return true;
  }
);

// 🧠 Slice logic
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ user: User; expoPushToken?: string }>) {
      state.user = action.payload.user;
      state.expoPushToken = action.payload.expoPushToken || null;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.expoPushToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setPushToken: (state, action: PayloadAction<string>) => {
      state.expoPushToken = action.payload;
      if (state.user) {
        state.user.expoPushToken = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.expoPushToken = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      .addCase(validatePushToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validatePushToken.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(validatePushToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.expoPushToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// 🎯 Export actions
export const { setUser, logout, updateUser, setPushToken } = authSlice.actions;
export default authSlice.reducer;

// 🧠 Selector
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
