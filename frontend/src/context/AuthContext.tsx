import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';

type User = {
  _id: string;
  email: string;
  name: string;
  userType: string;
  userStatus: string;
  points?: number;
  rank?: string;
  shopName?: string;
  verified?: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Listen for token changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue !== token) {
        setToken(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token]);

  // Check auth when token changes
  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await axiosInstance.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const data = response.data;
      
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Function to refresh user data
  const refreshUserData = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};