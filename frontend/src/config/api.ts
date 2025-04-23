// API configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5001/api',
  },
  production: {
    baseURL: '/api', // In production, API calls will be relative to the current domain
  },
};

// Determine current environment
const environment = import.meta.env.MODE || 'development';

// Export the API base URL
export const API_BASE_URL = API_CONFIG[environment as keyof typeof API_CONFIG].baseURL;

// Helper function for API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Get token from localStorage if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge options
  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};
