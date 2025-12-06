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
      if (token) {
        tokenSource = `token_${role}`;
        console.log(`✅ API Request - Using ${tokenSource} for ${config.url} (role: ${role})`);
      } else {
        // Role-specific token not found - log warning but don't use wrong token
        console.warn(`⚠️ API Request - Role ${role} token not found for ${config.url}. Token will not be added.`);
        console.warn(`⚠️ Available tokens:`, {
          hasToken_ADMIN: !!localStorage.getItem('token_ADMIN'),
          hasToken_DOCTOR: !!localStorage.getItem('token_DOCTOR'),
          hasToken_PATIENT: !!localStorage.getItem('token_PATIENT'),
          hasToken_default: !!localStorage.getItem('token')
        });
      }
    } else {
      // For non-role-specific endpoints (e.g., /auth/**), use fallback logic
      // Try role-specific tokens first
      const roles = ['ADMIN', 'DOCTOR', 'PATIENT'];
      for (const r of roles) {
        token = localStorage.getItem(`token_${r}`);
        if (token) {
          tokenSource = `token_${r} (fallback)`;
          console.log(`🔵 API Request - Using ${tokenSource} for ${config.url}`);
          break;
        }
      }
      
      // Final fallback to old token key
      if (!token) {
        token = localStorage.getItem('token');
        if (token) {
          tokenSource = 'token (default fallback)';
          console.log(`🔵 API Request - Using ${tokenSource} for ${config.url}`);
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔵 API Request - Token added to headers:', {
        url: config.url,
        method: config.method,
        role: role || 'none (non-role endpoint)',
        tokenSource: tokenSource,
        hasToken: !!token,
        tokenLength: token.length
      });
    } else {
      if (role) {
        console.error(`❌ API Request - No ${role} token found. Request will fail with 401/403:`, {
          url: config.url,
          method: config.method,
          requiredRole: role
        });
      } else {
        console.warn('⚠️ API Request - No token found in localStorage:', {
          url: config.url,
          method: config.method
        });
      }
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
    if (error.response?.status === 401) {
      // Unauthorized - clear all tokens and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      ['ADMIN', 'DOCTOR', 'PATIENT'].forEach(role => {
        localStorage.removeItem(`token_${role}`);
        localStorage.removeItem(`refreshToken_${role}`);
        localStorage.removeItem(`user_${role}`);
      });
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - check if it's due to expired JWT token
      // If the error message contains "JWT expired" or "expired", treat it as auth issue
      const errorMessage = error.response?.data?.message || error.response?.data || '';
      const errorString = JSON.stringify(errorMessage).toLowerCase();
      
      if (errorString.includes('expired') || errorString.includes('jwt')) {
        // JWT expired - clear all tokens and redirect to login
        console.warn('⚠️ JWT token expired. Clearing tokens and redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        ['ADMIN', 'DOCTOR', 'PATIENT'].forEach(role => {
          localStorage.removeItem(`token_${role}`);
          localStorage.removeItem(`refreshToken_${role}`);
          localStorage.removeItem(`user_${role}`);
        });
        window.location.href = '/login';
      }
      // Otherwise, it's a legitimate permission issue - let component handle it
    }
    return Promise.reject(error);
  }
);

export default api;

