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
  image?: string;
  choreId?: number;
  chore?: {
    id: number;
    name: string;
  }
  user?:{
    houseId: number;
  }
}

interface TaskSummary {
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



interface TaskState {
  tasks: Task[];
  tasksStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  summary?: TaskSummary;
  summaryStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  tasksStatus: 'idle',
  summaryStatus: 'idle',
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

export const loadTaskSummary = createAsyncThunk(
  'task/loadTaskSummary',
  async (userId: number | undefined, { rejectWithValue }) => {
    try {
      // console.log("📡 Fetching task summary for userId=", userId);
      const res = await api.get(`/tasks/summary?userId=${userId}`);
      console.log("✅ Task summary response:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error loading task summary:", error);
      return rejectWithValue('Failed to load task summary.');
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
        state.tasksStatus = 'loading';
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.tasksStatus = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.tasksStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(loadTaskSummary.pending, (state) => {
      state.summaryStatus = 'loading';
    })
    .addCase(loadTaskSummary.fulfilled, (state, action) => {
      state.summaryStatus = 'succeeded';
      state.summary = action.payload;
    })
    .addCase(loadTaskSummary.rejected, (state, action) => {
        state.summaryStatus = 'failed';
        state.error = action.payload as string || 'Failed to load task summary';
      });
  },
});

export default taskSlice.reducer;