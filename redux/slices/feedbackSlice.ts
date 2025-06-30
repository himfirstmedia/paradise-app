// redux/slices/feedbackSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import StorageParams from '@/constants/StorageParams';

export interface Feedback {
  id: number;
  message: string;
  userId: number;
  taskId: number;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FeedbackState {
  feedbacks: Feedback[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; 
  error: string | null;
}

const initialState: FeedbackState = {
  feedbacks: [],
  status: 'idle',
  error: null,
};

export const loadFeedbacks = createAsyncThunk(
  'feedback/loadFeedbacks',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await AsyncStorage.getItem(StorageParams.CACHED_FEEDBACKS);
      const cachedParsed: Feedback[] = cached ? JSON.parse(cached) : [];

      const res = await api.get('/feedback');
      const latest: Feedback[] = res.data;

      if (JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
        await AsyncStorage.setItem(StorageParams.CACHED_FEEDBACKS, JSON.stringify(latest));
        return latest;
      }
      return cachedParsed;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load feedbacks.');
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFeedbacks.pending, (state) => {
        state.status = 'loading'; 
        state.error = null;
      })
      .addCase(loadFeedbacks.fulfilled, (state, action) => {
        state.status = 'succeeded'; 
        state.feedbacks = action.payload;
      })
      .addCase(loadFeedbacks.rejected, (state, action) => {
        state.status = 'failed'; 
        state.error = action.payload as string;
      });
  },
});

export default feedbackSlice.reducer;