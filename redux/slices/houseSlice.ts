import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import StorageParams from '@/constants/StorageParams';

export interface House {
  id: number;
  name: string;
  abbreviation: string;
  capacity: number;
  users: { id: number }[];
  workPeriod?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    carryOverEnabled: boolean;
  };
}

interface HouseState {
  houses: House[];
  loading: boolean;
  error: string | null;
}

const initialState: HouseState = {
  houses: [],
  loading: false,
  error: null,
};

const filterUsers = (users: any[]) =>
  Array.isArray(users)
    ? users.filter((u) => u.role !== 'SUPER_ADMIN' && u.role !== 'DIRECTOR')
    : [];

export const loadHouses = createAsyncThunk(
  'house/loadHouses',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await AsyncStorage.getItem(StorageParams.CACHED_HOUSES);
      const cachedParsed: House[] = cached
        ? JSON.parse(cached).map((house: any) => ({
            ...house,
            users: filterUsers(house.users),
          }))
        : [];

      const res = await api.get('/houses');
      const latest: House[] = res.data.map((house: any) => ({
        ...house,
        users: filterUsers(house.users),
      }));

      if (JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
        await AsyncStorage.setItem(StorageParams.CACHED_HOUSES, JSON.stringify(latest));
        return latest;
      }
      return cachedParsed;
    } catch {
      return rejectWithValue('Failed to load houses.');
    }
  }
);

const houseSlice = createSlice({
  name: 'house',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadHouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadHouses.fulfilled, (state, action) => {
        state.loading = false;
        state.houses = action.payload;
      })
      .addCase(loadHouses.rejected, (state, action) => {
        state.loading = false;
        state.houses = [];
        state.error = action.payload as string;
      });
  },
});

export default houseSlice.reducer;
