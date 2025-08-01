import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';


export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  role: "SUPER_ADMIN" | "ADMIN" | "DIRECTOR" | "RESIDENT_MANAGER" | "FACILITY_MANAGER" | "RESIDENT" | "INDIVIDUAL";
  houseId?: number | null;
  house?: any | null;
  city: string;
  state: string;
  zipCode: string;
  image?: string;
  joinedDate: string;
  leavingDate?: string;
  task: any[];
  currentChore?: {
    id: number;
    name: string;
  }
  currentChoreId?: number;
  expoPushToken?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  expoPushToken: string | null; // Changed from token to expoPushToken
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  expoPushToken: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/users/login', { email, password });
      if (response.data && response.data.id) {
        return {
          user: response.data,
        };
      }
      return rejectWithValue('Invalid login response');
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Login failed');
    }
  }
);

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { rejectWithValue, getState, dispatch }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.expoPushToken;
    if (!token) {
      return rejectWithValue('No token available');
    }
    try {
      const response = await api.post('/users/validate-token', { token });
      if (response.data && response.data.user) {
        return response.data.user;
      }
      return rejectWithValue('Invalid token response');
    } catch (error: any) {
      dispatch(logoutAsync());
      return rejectWithValue(error?.response?.data?.message || 'Token validation failed');
    }
  }
);

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ user: User; expoPushToken?: string }>) {
      state.user = action.payload.user;
      state.expoPushToken = action.payload.expoPushToken || state.expoPushToken;
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
      .addCase(validateToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.expoPushToken = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.expoPushToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { setUser, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;