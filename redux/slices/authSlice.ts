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
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/login', { email, password });
      if (response.data && response.data.id) {
        // REMOVE storage calls - handled by redux-persist
        return response.data;
      }
      return rejectWithValue('Invalid login response');
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  // REMOVE storage calls - handled by redux-persist
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout(state) {
      state.user = null;
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
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { setUser, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;