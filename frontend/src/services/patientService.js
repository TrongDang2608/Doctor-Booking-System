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

  // AI Symptom Checker
  checkSymptoms: async (symptoms) => {
    // Gọi endpoint mà chúng ta vừa test trên Postman
    const response = await api.post('/patient/ai/check-symptoms', { symptoms });
    return response.data;
  },
};

