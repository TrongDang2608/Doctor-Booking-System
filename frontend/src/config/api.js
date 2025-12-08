import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7070/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to determine role from URL
const getRoleFromUrl = (url) => {
  if (!url) return null;
  if (url.includes('/admin/')) return 'ADMIN';
  if (url.includes('/doctor/')) return 'DOCTOR';
  if (url.includes('/patient/')) return 'PATIENT';
  // For auth endpoints, try to use the most recently logged in role
  return null;
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Determine role from URL
    const role = getRoleFromUrl(config.url);
    
    let token = null;
    let tokenSource = '';
    
    if (role) {
      // CRITICAL: If role is determined from URL, ONLY use token for that specific role
      // Do NOT fallback to other roles' tokens to avoid 403 errors
      token = localStorage.getItem(`token_${role}`);
      if (!token) {
        tokenSource = null;
      } else {
        tokenSource = `token_${role}`;
      }
    } else {
      // For non-role-specific endpoints (e.g., /auth/**), use fallback logic
      // Try role-specific tokens first
      const roles = ['ADMIN', 'DOCTOR', 'PATIENT'];
      for (const r of roles) {
        token = localStorage.getItem(`token_${r}`);
        if (token) {
          tokenSource = `token_${r} (fallback)`;
          break;
        }
      }
      
      // Final fallback to old token key
      if (!token) {
        token = localStorage.getItem('token');
        if (token) {
          tokenSource = 'token (default fallback)';
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if JWT expired (401 or 403 with expired token error)
    const isJwtExpired = error.response?.status === 401 || 
                         (error.response?.status === 403 && 
                          error.response?.data?.message?.includes('JWT expired'));
    
    if (isJwtExpired) {
      // Unauthorized - clear all tokens and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      ['ADMIN', 'DOCTOR', 'PATIENT'].forEach(role => {
        localStorage.removeItem(`token_${role}`);
        localStorage.removeItem(`refreshToken_${role}`);
        localStorage.removeItem(`user_${role}`);
      });
      
      // Redirect to login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

