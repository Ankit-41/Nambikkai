import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  console.log("Axios request:", config.method?.toUpperCase(), config.url, config.data)
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('doctorData');
      localStorage.removeItem('hospitalAdminData');
      localStorage.removeItem('superAdminData');
      localStorage.removeItem('patientData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Super Admin API
export const superAdminApi = {
  createSuperAdmin: (data: { name: string; email: string; password: string }) =>
    api.post('/super-admin/create-super-admin', data),

  createHospitalAdmin: (data: { name: string; email: string; password: string; superAdminId: string, totalTests: number }) =>
    api.post('/super-admin/create-hospital-admin', data),

  // Auth
  login: (data: { email: string; password: string }) =>
    api.post('/super-admin/login', data),

  // Dashboard Data
  getDashboardData: () =>
    api.get('/super-admin/dashboard'),

  allocateTests: (data: { superAdminId: string; hospitalAdminId: string; count: number }) =>
    api.post('/super-admin/allocate-tests', data),

};

// Hospital Centre Admin API
export const hospitalAdminApi = {
  // Auth
  login: (data: { email: string; password: string }) =>
    api.post('/hospital-admin/login', data),

  // Dashboard Data
  getDashboardData: () =>
    api.get('/hospital-admin/dashboard'),

  // Doctors Management
  createDoctor: (data: {
    name: string;
    email: string;
    password: string;
    gender: 'Male' | 'Female' | 'Other';
  }) =>
    api.post('/hospital-admin/doctors', data),

  createAppointment: (appointmentData: any) =>
    api.post('/hospital-admin/appointments', appointmentData),

  // Test Management
  allocateTests: (doctorId: string, count: number) =>
    api.post(`/hospital-admin/allocate-tests/${doctorId}`, { count }),

  // Get patient details by code
  getPatientByCode: (patientCode: string) =>
    api.get(`/hospital-admin/patient/${patientCode}`),
};

// Doctor API
export const doctorApi = {
  // Auth
  login: (data: { email: string; password: string }) =>
    api.post('/doctor/login', data),

  // Dashboard Data
  getDashboardData: () =>
    api.get('/doctor/dashboard'),

  // Patients
  getPatients: () =>
    api.get('/doctor/patients'),
  createPatient: (data: {
    name: string;
    age: number;
    sex: 'Male' | 'Female' | 'Other';
    phoneNumber: string;
    address: string;
    kneeCondition: string;
    otherMorbidities?: string;
    rehabDuration: string;
    mriImage: string;
  }) =>
    api.post('/doctor/patients', data),
  updatePatient: (patientId: string, data: any) =>
    api.put(`/doctor/patients/${patientId}`, data),
  deletePatient: (patientId: string) =>
    api.delete(`/doctor/patients/${patientId}`),

  // Tests
  getTests: () =>
    api.get('/doctor/tests'),
  createTest: (data: {
    patientId: string;
    puckId: string;
  }) =>
    api.post('/doctor/tests', data),

  // Report
  getReport: (data:
    { puckId: string, timestamp: string }) =>
    api.post('/doctor/download-report', data),

  // Save Test Results
  saveTestResults: (data: {
    patientId: string;
    puckId: string;
    legTested: string;
    legLength: number;
    testResults: {
      rangeOfMotion: number;
      linearDisplacement: number;
      angularDisplacement: number;
      timeSeriesData: Array<{
        time: number;
        rangeOfMotion: number;
        linearDisplacement: number;
        angularDisplacement: number;
      }>;
    };
    doctorNotes: string;
    filesProcessed: number;
  }, appointmentId?: string) =>
    api.post('/doctor/save-test-results', { ...data, appointmentId }),
};

// Patient API
export const patientApi = {
  // Auth
  login: (data: { patientId: string }) =>
    api.post('/patient/login', data),

  // Profile
  getProfile: (patientCode: string) =>
    api.get(`/patient/profile/${patientCode}`),
  updateProfile: (data: any) =>
    api.put('/patient/profile', data),

  // Tests
  getTests: (patientCode: string) =>
    api.get(`/patient/tests/${patientCode}`),
  getTestReport: (testId: string) =>
    api.get(`/patient/test-report/${testId}`),
  getPatientByCode: (patientCode: string) =>
    api.get(`/hospital-admin/patient/${patientCode}`),
  getUniqueTest: (testId: string, patientCode: string) =>
    api.get(`/patient/test-report/${testId}?patientCode=${patientCode}`),

};

// Test API
export const testApi = {
  // Raw Data
  createRawData: (data: {
    puckId: string;
    linearDisplacement: number;
    rangeOfMotion: number;
    angularDisplacement: number;
    timeSeriesData: Array<{
      time: number;
      linearDisplacement: number;
      rangeOfMotion: number;
      angularDisplacement: number;
    }>;
  }) =>
    api.post('/test/raw-data', data),
  getRawData: (puckId: string) =>
    api.get(`/test/raw-data/${puckId}`),
  deleteRawData: (puckId: string) =>
    api.delete(`/test/raw-data/${puckId}`),
}; 