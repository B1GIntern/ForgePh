import axiosInstance from '../config/axiosConfig';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: string;
  shopName?: string;
  phoneNumber?: string;
  location?: {
    province: string;
    city: string;
  };
}

export interface AuthResponse {
  user: any;
  token: string;
}

/**
 * Login a user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await axiosInstance.post('/auth/request-reset', { email });
    return response.data;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (token: string) => {
  try {
    const response = await axiosInstance.get(`/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, profileData: any) => {
  try {
    const response = await axiosInstance.put(`/users/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}; 