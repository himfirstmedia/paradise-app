import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

export default api;
