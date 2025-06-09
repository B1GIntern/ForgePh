// API configuration utility
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const apiConfig = {
  baseURL: API_URL,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

export default apiConfig; 