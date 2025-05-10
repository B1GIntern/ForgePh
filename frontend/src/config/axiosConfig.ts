import axios from 'axios';
import { API_BASE_URL } from './api';

// Determine the correct base URL with fallbacks
const determineBaseUrl = () => {
  // First try the env variable
  const configuredUrl = API_BASE_URL;
  
  // If we're in development and using localhost, ensure we have a fallback
  if (import.meta.env.DEV && (!configuredUrl || configuredUrl === '')) {
    console.warn('No API_BASE_URL configured, falling back to http://localhost:5001');
    return 'http://localhost:5001/api';
  }
  
  // Check if the URL already has /api suffix
  const baseURL = configuredUrl.endsWith('/api') ? configuredUrl : `${configuredUrl}/api`;
  return baseURL;
};

const baseURL = determineBaseUrl();

console.log('Initializing axios with base URL:', baseURL);

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set withCredentials depending on environment
  withCredentials: false, // default to false for CORS support
  // Add maximum timeout
  timeout: 30000,
});

// Enable withCredentials only for same-origin requests
const currentOrigin = window.location.origin;
const apiOrigin = baseURL.startsWith('http') 
  ? new URL(baseURL).origin 
  : window.location.origin;

if (currentOrigin === apiOrigin) {
  console.log('Same-origin API detected, enabling credentials');
  axiosInstance.defaults.withCredentials = true;
} else {
  console.log('Cross-origin API detected, disabling credentials for CORS compatibility');
  axiosInstance.defaults.withCredentials = false;
}

// Ensure proper CORS handling
axiosInstance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`API Request [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific error statuses
      console.error(`API Error [${error.response.status}]: ${error.response.statusText}`);
      console.error('Error data:', error.response.data);
      
      switch (error.response.status) {
        case 401:
          // Unauthorized - could redirect to login or clear token
          console.error('Unauthorized access');
          localStorage.removeItem('token');
          // Could add redirection logic here if needed
          break;
        case 403:
          console.error('Forbidden access');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`Error ${error.response.status}: ${error.response.statusText}`);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received from server', error.request);
      console.error('Request URL:', error.config?.url);
      console.error('Request method:', error.config?.method);
      
      // Log detailed error info for debugging
      console.error('Error details:', {
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data,
        withCredentials: error.config?.withCredentials,
        message: error.message
      });
    } else {
      // Something else happened while setting up the request
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 