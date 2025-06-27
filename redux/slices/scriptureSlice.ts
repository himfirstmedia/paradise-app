import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import StorageParams from '@/constants/StorageParams';

export interface Scripture {
  id: number;
  book: string;
  version: string;
  verse: string;
  scripture: string;
  createdAt: string;
  updatedAt: string;
}

interface ScriptureState {
  scriptures: Scripture[];
  loading: boolean;
  error: string | null;
}

const initialState: ScriptureState = {
  scriptures: [],
  loading: false,
  error: null,
};

export const loadScriptures = createAsyncThunk(
  'scripture/loadScriptures',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await AsyncStorage.getItem(StorageParams.CACHED_SCRIPTURES);
      const cachedParsed: Scripture[] = cached ? JSON.parse(cached) : [];

      const res = await api.get('/scriptures');
      const latest: Scripture[] = res.data;

      if (JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
        await AsyncStorage.setItem(StorageParams.CACHED_SCRIPTURES, JSON.stringify(latest));
        return latest;
      }
      return cachedParsed;
    } catch {
      return rejectWithValue('Failed to load scriptures.');
    }
  }
);

const scriptureSlice = createSlice({
  name: 'scripture',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadScriptures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadScriptures.fulfilled, (state, action) => {
        state.loading = false;
        state.scriptures = action.payload;
      })
      .addCase(loadScriptures.rejected, (state, action) => {
        state.loading = false;
        state.scriptures = [];
        state.error = action.payload as string;
      });
  },
});

export default scriptureSlice.reducer;