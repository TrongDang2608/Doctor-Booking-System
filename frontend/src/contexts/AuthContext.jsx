import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

// Helper to determine role from pathname
const getRoleFromPathname = (pathname) => {
  if (pathname.startsWith('/admin')) return 'ADMIN';
  if (pathname.startsWith('/doctor')) return 'DOCTOR';
  if (pathname.startsWith('/patient')) return 'PATIENT';
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine role from current pathname
    const pathname = window.location.pathname;
    const roleFromPath = getRoleFromPathname(pathname);
    
    // Try to load user for specific role first, then fallback
    let currentUser = null;
    if (roleFromPath) {
      currentUser = authService.getCurrentUser(roleFromPath);
    }
    
    // Fallback: try to load any user
    if (!currentUser) {
      currentUser = authService.getCurrentUser();
    }
    
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const authResponse = await authService.login(username, password);
      
      // Save to localStorage
      authService.setAuthData(authResponse);
      
      // Update state
      const userData = {
        id: authResponse.id,
        username: authResponse.username,
        email: authResponse.email,
        role: authResponse.role,
        fullName: authResponse.fullName,
      };
      setUser(userData);
      
      return authResponse;
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const authResponse = await authService.register(userData);
      authService.setAuthData(authResponse);
      setUser({
        id: authResponse.id,
        username: authResponse.username,
        email: authResponse.email,
        role: authResponse.role,
        fullName: authResponse.fullName,
      });
      return authResponse;
    } catch (error) {
      throw error;
    }
  };

  const logout = (role = null) => {
    // If role is provided, only logout that role
    // Otherwise logout all roles
    if (role) {
      authService.logout(role);
      // Only clear user state if current user matches the role
      if (user?.role === role) {
        setUser(null);
      }
    } else {
      authService.logout();
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

