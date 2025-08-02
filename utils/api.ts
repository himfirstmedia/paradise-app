import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

if (!BASE_URL) {
  console.warn("❌ BASE_URL is not defined in Constants.expoConfig.extra");
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Increased from 5000ms to 15000ms
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default api;