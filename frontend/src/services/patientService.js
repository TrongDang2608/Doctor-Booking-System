import api from '../config/api';

export const patientService = {
  // Profile Management
  getProfile: async () => {
    const response = await api.get('/patient/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/patient/profile', profileData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    await api.post('/patient/change-password', { currentPassword, newPassword });
  },

  // Appointments
  createAppointment: async (appointmentData) => {
    const response = await api.post('/patient/appointments', appointmentData);
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/patient/appointments');
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/patient/appointments/${id}`);
    return response.data;
  },

  cancelAppointment: async (id) => {
    await api.delete(`/patient/appointments/${id}`);
  },

  // Doctors
  searchDoctors: async (search) => {
    const params = search ? { search } : {};
    const response = await api.get('/patient/doctors', { params });
    return response.data;
  },

  getDoctorById: async (id) => {
    const response = await api.get(`/patient/doctors/${id}`);
    return response.data;
  },

  // Treatments
  getTreatments: async () => {
    const response = await api.get('/patient/treatments');
    return response.data;
  },

  getTreatmentById: async (id) => {
    const response = await api.get(`/patient/treatments/${id}`);
    return response.data;
  },

  getTreatmentByAppointmentId: async (appointmentId) => {
    const response = await api.get(`/patient/appointments/${appointmentId}/treatment`);
    return response.data;
  },

  // Feedbacks
  createFeedback: async (feedbackData) => {
    const response = await api.post('/patient/feedbacks', feedbackData);
    return response.data;
  },

  getFeedbacks: async () => {
    const response = await api.get('/patient/feedbacks');
    return response.data;
  },

  getFeedbackById: async (id) => {
    const response = await api.get(`/patient/feedbacks/${id}`);
    return response.data;
  },

  updateFeedback: async (id, feedbackData) => {
    try {
      const response = await api.put(`/patient/feedbacks/${id}`, feedbackData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // AI Symptom Checker
  checkSymptoms: async (symptoms) => {
    // Gọi endpoint mà chúng ta vừa test trên Postman
    const response = await api.post('/patient/ai/check-symptoms', { symptoms });
    return response.data;
  },

  // Wallet
  getWallet: async () => {
    const response = await api.get('/patient/wallet');
    return response.data;
  },

  topUp: async (amount, paymentMethod) => {
    const response = await api.post('/patient/wallet/top-up', {
      amount,
      paymentMethod
    });
    return response.data;
  },

  getTransactions: async (page = 0, size = 10) => {
    const response = await api.get('/patient/wallet/transactions', {
      params: { page, size }
    });
    return response.data;
  },

  // Available Time Slots
  getAvailableTimeSlots: async (doctorId, date) => {
    const response = await api.get('/patient/appointments/available-slots', {
      params: { doctorId, date }
    });
    return response.data;
  }
};

