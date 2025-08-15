import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import StorageParams from '@/constants/StorageParams';

export type ChoreCategory = "PRIMARY" | "MAINTENANCE" | "SPECIAL";
export type ChoreStatus = "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED";
export type ChoreType = "PENDING" | "COMPLETED" | "OVERDUE";

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
  };

  // Optional detailed task fields
  category?: ChoreCategory;
  status?: ChoreStatus;
  type?: ChoreType;
  progress?: string;
  userId?: number | null;
  instruction?: string;
  image?: string;

  choreId?: number;
  chore?: {
    id: number;
    name: string;
  };

  user?: {
    houseId: number;
  };

  tasks?: {
    id: number;
    name: string;
  }[];
}

interface ChoreSummary {
  weekStatus: string;
  monthStatus: string;
  periodStatus: string;
  previousBalance: string;
  currentBalance: string;
  daysRemaining: number;
  currentPeriod: string;
  nextDeadline: string;
  expectedMinutesToDate: number;
  netMinutes: number;
}

interface ChoreState {
  chores: Chore[];
  choresStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  summary?: ChoreSummary;
  summaryStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ChoreState = {
  chores: [],
  choresStatus: 'idle',
  summaryStatus: 'idle',
  error: null,
};

// Load chores with AsyncStorage fallback
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

// Load chore summary for the current user
export const loadChoreSummary = createAsyncThunk(
  'chore/loadChoreSummary',
  async (userId: number | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get(`/chores/summary?userId=${userId}`);

      console.log(`Loading chore summary for user ID: ${userId}`, res.data);
      return res.data;
      
      
    } catch {
      return rejectWithValue('Failed to load chore summary.');
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

      .addCase(loadChoreSummary.pending, (state) => {
        state.summaryStatus = 'loading';
      })
      .addCase(loadChoreSummary.fulfilled, (state, action) => {
        state.summaryStatus = 'succeeded';
        state.summary = action.payload;
      })
      .addCase(loadChoreSummary.rejected, (state, action) => {
        state.summaryStatus = 'failed';
        state.error = action.payload as string || 'Failed to load chore summary';
      });
  },
});

export default choreSlice.reducer;
