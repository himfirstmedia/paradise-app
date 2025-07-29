import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import StorageParams from '@/constants/StorageParams';

export type ProgressType = "PENDING" | "COMPLETED" | "OVERDUE";

export interface Chore {
  id: number;
  name: string;
  description?: string;
  houseId: number;
  house?: {
    id: number;
    name: string;
    abbreviation: string;
  };
  currentUser: {
    id: number;
    name: string;
  }
  tasks?: {
    id: number;
    name: string;
  }
}


interface ChoreState {
  chores: Chore[];
  choresStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ChoreState = {
  chores: [],
  choresStatus: 'idle',
  error: null,
};


export const loadChores = createAsyncThunk(
  'chore/loadChores',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await AsyncStorage.getItem(StorageParams.CACHED_CHORES);
      const cachedParsed: Chore[] = cached ? JSON.parse(cached) : [];

      const res = await api.get('/chores');
      const latest: Chore[] = res.data;

      if (JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
        await AsyncStorage.setItem(StorageParams.CACHED_CHORES, JSON.stringify(latest));
        return latest;
      }
      return cachedParsed;
    } catch {
      return rejectWithValue('Failed to load Chores.');
    }
  }
);






const choreSlice = createSlice({
  name: 'chore',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadChores.pending, (state) => {
        state.choresStatus = 'loading';
        state.error = null;
      })
      .addCase(loadChores.fulfilled, (state, action) => {
        state.choresStatus = 'succeeded';
        state.chores = action.payload;
      })
      .addCase(loadChores.rejected, (state, action) => {
        state.choresStatus = 'failed';
        state.error = action.payload as string;
      })
  },
});

export default choreSlice.reducer;