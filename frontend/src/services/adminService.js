import api from '../config/api';

export const adminService = {
  // Doctor Management
  getAllDoctors: async (search) => {
    const params = search ? { search } : {};
    const response = await api.get('/admin/doctors', { params });
    return response.data;
  },

  getDoctorById: async (id) => {
    const response = await api.get(`/admin/doctors/${id}`);
    return response.data;
  },

  createDoctor: async (doctorData) => {
    const response = await api.post('/admin/doctors', doctorData);
    return response.data;
  },

  updateDoctor: async (id, doctorData) => {
    const response = await api.put(`/admin/doctors/${id}`, doctorData);
    return response.data;
  },

  // Patient Management
  searchPatients: async (search) => {
    const params = search ? { search } : {};
    const response = await api.get('/admin/patients', { params });
    return response.data;
  },

  getPatientById: async (id) => {
    const response = await api.get(`/admin/patients/${id}`);
    return response.data;
  },

  createPatient: async (patientData) => {
    try {
      const response = await api.post('/admin/patients', patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePatient: async (id, patientData) => {
    try {
      const response = await api.put(`/admin/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Appointment Management
  getAllAppointments: async (date) => {
    const params = date ? { date } : {};
    const response = await api.get('/admin/appointments', { params });
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/admin/appointments/${id}`);
    return response.data;
  },

  updateAppointment: async (id, appointmentData) => {
    try {
      const response = await api.put(`/admin/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteAppointment: async (id) => {
    try {
      await api.delete(`/admin/appointments/${id}`);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  cancelAppointment: async (id, cancellationReason) => {
    try {
      const response = await api.post(`/admin/appointments/${id}/cancel`, { cancellationReason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Feedback Management
  getAllFeedbacks: async (status) => {
    const params = status ? { status } : {};
    const response = await api.get('/admin/feedbacks', { params });
    return response.data;
  },

  getFeedbackById: async (id) => {
    const response = await api.get(`/admin/feedbacks/${id}`);
    return response.data;
  },

  getFeedbacksByDoctor: async (doctorId) => {
    const response = await api.get(`/admin/feedbacks/doctor/${doctorId}`);
    return response.data;
  },

  getFeedbacksByPatient: async (patientId) => {
    const response = await api.get(`/admin/feedbacks/patient/${patientId}`);
    return response.data;
  },

  hideFeedback: async (id) => {
    try {
      const response = await api.put(`/admin/feedbacks/${id}/hide`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  unhideFeedback: async (id) => {
    try {
      const response = await api.put(`/admin/feedbacks/${id}/unhide`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

