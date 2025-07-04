import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import StorageParams from '@/constants/StorageParams';

export type ProgressType = "PENDING" | "COMPLETED" | "OVERDUE";

export interface Task {
  id: number;
  name: string;
  category: "PRIMARY" | "MAINTENANCE" | "SPECIAL";
  description: string;
  status: "PENDING" |"REVIEWING" | "APPROVED";
  progress: string;
  type: "PENDING" | "COMPLETED" | "OVERDUE";
  userId?: number | null;
  instruction?: string;
}

interface TaskState {
  tasks: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  status: 'idle', // Initial status
  error: null,
};

export const loadTasks = createAsyncThunk(
  'task/loadTasks',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await AsyncStorage.getItem(StorageParams.CACHED_TASKS);
      const cachedParsed: Task[] = cached ? JSON.parse(cached) : [];

      const res = await api.get('/tasks');
      const latest: Task[] = res.data;

      if (JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
        await AsyncStorage.setItem(StorageParams.CACHED_TASKS, JSON.stringify(latest));
        return latest;
      }
      return cachedParsed;
    } catch {
      return rejectWithValue('Failed to load tasks.');
    }
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default taskSlice.reducer;