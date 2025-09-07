import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Simple localStorage wrapper for web compatibility
const storage = {
  getItem: (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  clearAll: () => {
    if (typeof window !== 'undefined') {
      try {
        // Clear all localStorage items that might be related to auth
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('token') || key.includes('auth') || key.includes('student') || key.includes('Token'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('🧹 Cleared all auth-related localStorage items:', keysToRemove);
        
        // Also try to clear the specific token key
        localStorage.removeItem('studentToken');
        localStorage.removeItem('StudentToken');
        localStorage.removeItem('token');
        localStorage.removeItem('Token');
        
        // Clear any cached data
        if (window.caches) {
          window.caches.keys().then(names => {
            names.forEach(name => {
              window.caches.delete(name);
            });
          });
        }
        
      } catch (error) {
        console.error('Error clearing localStorage:', error);
        // Fallback: clear everything
        localStorage.clear();
      }
    }
  }
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking auth state...');
      
      // If we're in the process of logging out, don't check auth state
      if (isLoggingOut) {
        console.log('🚪 Logout in progress, skipping auth check');
        setLoading(false);
        return;
      }
      
      const token = storage.getItem('studentToken');
      console.log('🔑 Token found:', !!token);
      
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('🌐 Making API call to backend...');
        const response = await axios.get('http://localhost:5000/api/auth/student/me');
        console.log('✅ Student data received:', response.data);
        setStudent(response.data);
      } else {
        console.log('❌ No token found, user not logged in');
        setStudent(null);
      }
    } catch (error) {
      console.error('❌ Error checking auth state:', error.message);
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.log('🌐 Backend not available, continuing without auth check');
      }
      // Clear invalid token
      storage.removeItem('studentToken');
      delete axios.defaults.headers.common['Authorization'];
      setStudent(null);
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/student/login', {
        email,
        password
      });

      const { token, student: studentData } = response.data;
      storage.setItem('studentToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setStudent(studentData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    try {
      console.log('🚪 Logging out student...');
      console.log('🔍 Current student state before logout:', student);
      
      // Set logout flag to prevent auth check from running
      setIsLoggingOut(true);
      
      // Clear student state immediately
      setStudent(null);
      console.log('👤 Student state set to null');
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      console.log('🔑 Authorization header cleared');
      
      // Clear all localStorage auth data
      storage.clearAll();
      console.log('🗑️ All auth data cleared from localStorage');
      
      // Also clear sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        console.log('🗑️ SessionStorage cleared');
      }
      
      // Force immediate redirect to login page
      console.log('🔄 Redirecting to login page...');
      window.location.href = window.location.origin + window.location.pathname;
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Force logout even if there's an error
      setIsLoggingOut(true);
      setStudent(null);
      delete axios.defaults.headers.common['Authorization'];
      storage.clearAll();
      
      // Force redirect
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  const value = {
    student,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
