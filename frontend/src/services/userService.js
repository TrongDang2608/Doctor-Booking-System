import api from '../config/api';

const userService = {
  // Get all users with optional search
  getAllUsers: async (search = '') => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle user status (enable/disable)
  toggleUserStatus: async (id) => {
    try {
      const response = await api.patch(`/admin/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change user password
  changeUserPassword: async (id, newPassword) => {
    try {
      const response = await api.patch(`/admin/users/${id}/change-password`, {
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search users
  searchUsers: async (searchTerm) => {
    return userService.getAllUsers(searchTerm);
  }
};

export default userService;
