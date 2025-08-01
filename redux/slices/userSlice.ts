import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import StorageParams from '@/constants/StorageParams';
import { Task } from '@/types/task';

export interface User {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
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
  task: Task[];
  currentChoreId?: number;
  currentChore?: {
    id: number;
    name: string;
  }
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

export const loadUsers = createAsyncThunk(
  'user/loadUsers',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await AsyncStorage.getItem(StorageParams.CACHED_USERS);
      const cachedParsed: User[] = cached ? JSON.parse(cached) : [];

      const res = await api.get('/users');
      const latest: User[] = res.data;

      if (JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
        await AsyncStorage.setItem(StorageParams.CACHED_USERS, JSON.stringify(latest));
        return latest;
      }
      return cachedParsed;
    } catch {
      return rejectWithValue('Failed to load users.');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.loading = false;
        state.users = [];
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;