import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

if (!BASE_URL) {
  console.warn("❌ BASE_URL is not defined in Constants.expoConfig.extra");
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

export default api;