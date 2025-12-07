import api from '../config/api';

const notificationService = {
  /**
   * Lấy tất cả thông báo của patient
   */
  getNotifications: async () => {
    const response = await api.get('/patient/notifications');
    return response.data;
  },

  /**
   * Đếm số thông báo chưa đọc
   */
  getUnreadCount: async () => {
    const response = await api.get('/patient/notifications/unread-count');
    return response.data.unreadCount;
  },

  /**
   * Đánh dấu thông báo là đã đọc
   */
  markAsRead: async (notificationId) => {
    const response = await api.put(`/patient/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: async () => {
    const response = await api.put('/patient/notifications/mark-all-read');
    return response.data;
  },

  /**
   * Xóa thông báo
   */
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/patient/notifications/${notificationId}`);
    return response.data;
  }
};

export default notificationService;

