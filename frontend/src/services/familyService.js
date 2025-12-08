import api from '../config/api';

const familyService = {
  /**
   * Lấy danh sách thành viên gia đình
   */
  getFamilyMembers: async () => {
    const response = await api.get('/patient/family-members', 'PATIENT');
    return response.data;
  },

  /**
   * Lấy thống kê thành viên gia đình
   */
  getFamilyStats: async () => {
    const response = await api.get('/patient/family-members/stats', 'PATIENT');
    return response.data;
  },

  /**
   * Thêm thành viên gia đình mới
   */
  createFamilyMember: async (memberData) => {
    const response = await api.post('/patient/family-members', memberData, 'PATIENT');
    return response.data;
  },

  /**
   * Cập nhật thành viên gia đình
   */
  updateFamilyMember: async (memberId, memberData) => {
    const response = await api.put(`/patient/family-members/${memberId}`, memberData, 'PATIENT');
    return response.data;
  },

  /**
   * Xóa thành viên gia đình
   */
  deleteFamilyMember: async (memberId) => {
    const response = await api.delete(`/patient/family-members/${memberId}`, 'PATIENT');
    return response.data;
  },
};

export default familyService;

