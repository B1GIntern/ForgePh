/**
 * API Debugger Utility
 * 
 * This utility helps diagnose common API connection issues
 * including CORS, network, and authentication problems.
 */

import { API_BASE_URL } from '../config/api';
import axiosInstance from '../config/axiosConfig';

/**
 * Test basic connectivity to the API 
 */
export const testApiConnection = async () => {
  console.log('API Debugger: Testing connection to', API_BASE_URL);
  
  try {
    // Try with axios instance first
    try {
      const response = await axiosInstance.get('/');
      console.log('✅ Axios connection successful:', response.status, response.data);
      return { success: true, method: 'axios', data: response.data };
    } catch (axiosError: any) {
      console.error('❌ Axios connection failed:', axiosError.message);
      
      // If axios fails, try with fetch
      try {
        console.log('Attempting with fetch API...');
        
        const fetchResponse = await fetch(API_BASE_URL);
        if (fetchResponse.ok) {
          console.log('✅ Fetch connection successful:', fetchResponse.status);
          return { success: true, method: 'fetch', status: fetchResponse.status };
        } else {
          console.error('❌ Fetch failed with status:', fetchResponse.status);
          throw new Error(`Fetch failed with status ${fetchResponse.status}`);
        }
      } catch (fetchError) {
        console.error('❌ Fetch failed completely:', fetchError);
        throw new Error(`Both axios and fetch failed. API may be down.`);
      }
    }
  } catch (error) {
    console.error('❌ API connection test failed completely:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Check for CORS issues
 */
export const checkCorsIssues = async () => {
  console.log('API Debugger: Checking for CORS issues with', API_BASE_URL);
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    // Check for CORS headers
    const corsHeadersPresent = 
      response.headers.get('Access-Control-Allow-Origin') !== null ||
      response.headers.get('Access-Control-Allow-Methods') !== null ||
      response.headers.get('Access-Control-Allow-Headers') !== null;
    
    if (corsHeadersPresent) {
      console.log('✅ CORS headers detected:', {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      });
      return { success: true, corsEnabled: true };
    } else {
      console.warn('⚠️ No CORS headers detected. Server may not support CORS properly.');
      return { success: false, corsEnabled: false };
    }
  } catch (error) {
    console.error('❌ CORS check failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      corsEnabled: false
    };
  }
};

/**
 * Check authentication by trying to fetch user profile
 */
export const checkAuthentication = async () => {
  console.log('API Debugger: Testing authentication');
  
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ No authentication token found in localStorage');
      return { success: false, authenticated: false, reason: 'No token found' };
    }
    
    try {
      const response = await axiosInstance.get('/auth/me');
      console.log('✅ Authentication successful. User profile:', response.data);
      return { success: true, authenticated: true, user: response.data };
    } catch (error: any) {
      console.error('❌ Authentication failed:', error.response?.status || error.message);
      return { 
        success: false, 
        authenticated: false, 
        status: error.response?.status,
        error: error.response?.data || error.message
      };
    }
  } catch (error) {
    console.error('❌ Authentication check failed completely:', error);
    return { 
      success: false, 
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Run all API diagnostics and return a comprehensive report
 */
export const runApiDiagnostics = async () => {
  console.log('API Debugger: Running full diagnostics on', API_BASE_URL);
  
  const results = {
    baseUrl: API_BASE_URL,
    timestamp: new Date().toISOString(),
    browserInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor
    },
    connection: await testApiConnection(),
    cors: await checkCorsIssues(),
    auth: await checkAuthentication()
  };
  
  console.log('API Diagnostics Complete:', results);
  return results;
};

// Function to log diagnostic info to console for debugging
export const debugAuth = () => {
  const token = localStorage.getItem('token');
  console.log('Auth Debug Info:');
  console.log('- API URL:', API_BASE_URL);
  console.log('- Token exists:', !!token);
  if (token) {
    // Only show first and last few characters for security
    const tokenPreview = `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
    console.log('- Token preview:', tokenPreview);
  }
  
  // Check for existing user data
  const userData = localStorage.getItem('user');
  console.log('- User data exists:', !!userData);
  
  return {
    apiUrl: API_BASE_URL,
    hasToken: !!token,
    hasUserData: !!userData
  };
}; 