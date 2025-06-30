import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@/redux/store';
import { setUser } from '../slices/authSlice'; 

const AUTH_KEY = 'auth_state';

export const loadAuthFromStorage = async () => {
  const stored = await AsyncStorage.getItem(AUTH_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      store.dispatch(setUser(parsed));
    } catch (e) {
      console.error("Failed to parse auth state:", e);
    }
  }
};

export const saveAuthToStorage = async () => {
  const auth = store.getState().auth;
  try {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch (e) {
    console.error("Failed to save auth state:", e);
  }
};
