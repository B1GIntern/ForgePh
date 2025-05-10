// API configuration using environment variables

// Temporarily force local development URL for testing
export const API_BASE_URL = 'http://localhost:5001';

// Use environment variables or fallback for socket connections
export const SOCKET_URL = 'http://localhost:5001';

// Log the current API configuration
console.log('API Configuration:', {
  API_BASE_URL,
  SOCKET_URL,
  envVars: {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL
  }
});

// Helper function for API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  // Fix URL path by ensuring we don't double-add /api if it's already in the base URL
  const basePath = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
  const url = `${basePath}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  console.log(`Making API call to: ${url}`);
  
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
