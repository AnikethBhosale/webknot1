import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Simple localStorage wrapper for web compatibility
const storage = {
  getItem: async (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: async (key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
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

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking auth state...');
      const token = await storage.getItem('studentToken');
      console.log('🔑 Token found:', !!token);
      
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('🌐 Making API call to backend...');
        const response = await axios.get('http://localhost:5000/api/auth/student/me');
        console.log('✅ Student data received:', response.data);
        setStudent(response.data);
      } else {
        console.log('❌ No token found, user not logged in');
      }
    } catch (error) {
      console.error('❌ Error checking auth state:', error.message);
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.log('🌐 Backend not available, continuing without auth check');
      }
      await storage.removeItem('studentToken');
      delete axios.defaults.headers.common['Authorization'];
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
      await storage.setItem('studentToken', token);
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

  const logout = async () => {
    await storage.removeItem('studentToken');
    delete axios.defaults.headers.common['Authorization'];
    setStudent(null);
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
