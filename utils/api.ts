/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from 'axios';

const API_BASE_URL = 'http://192.168.100.94:5000/api';
const PRODUCTION_API_BASE_URL = 'https://paradise-backend-wyov.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // baseURL: PRODUCTION_API_BASE_URL,
  timeout: 5000,
});

export default api;
