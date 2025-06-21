import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hospital Admin API
export const hospitalAdminApi = {
  // Auth
  create: (data: { name: string; email: string; password: string }) => 
    api.post('/hospital-admin', data),
  login: (data: { email: string; password: string }) => 
    api.post('/hospital-admin/login', data),

  // Dashboard Data
  getDashboardData: (email: string) => 
    api.get(`/hospital-admin/dashboard?email=${email}`),
  
  // Doctors Management
  createDoctor: (email: string, data: { 
    name: string; 
    email: string; 
    password: string;
    gender: 'Male' | 'Female' | 'Other';
  }) => 
    api.post(`/hospital-admin/doctors?email=${email}`, data),


  // Test Management
  allocateTests: (email: string, doctorId: string, count: number) => 
    api.post(`/hospital-admin/allocate-tests/${doctorId}?email=${email}`, { count }),
};

// Doctor API
export const doctorApi = {
  // Auth
  login: (data: { email: string; password: string }) => 
    api.post('/doctor/login', data),

  // Dashboard Data
  getDashboardData: (email: string) => 
    api.get(`/doctor/dashboard?email=${email}`),

  // Patients
  getPatients: (email: string) => 
    api.get(`/doctor/patients?email=${email}`),
  createPatient: (email: string, data: {
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
    api.post(`/doctor/patients?email=${email}`, data),
  updatePatient: (email: string, patientId: string, data: any) => 
    api.put(`/doctor/patients/${patientId}?email=${email}`, data),
  deletePatient: (email: string, patientId: string) => 
    api.delete(`/doctor/patients/${patientId}?email=${email}`),

  // Tests
  getTests: (email: string) => 
    api.get(`/doctor/tests?email=${email}`),
  createTest: (email: string, data: {
    patientId: string;
    puckId: string;
  }) => 
    api.post(`/doctor/tests?email=${email}`, data),
};

// Patient API
export const patientApi = {
  // Auth
  login: (data: { patientId: string }) => 
    api.post('/patient/login', data),

  // Profile
  getProfile: () => 
    api.get('/patient/profile'),
  updateProfile: (data: any) => 
    api.put('/patient/profile', data),

  // Tests
  getTests: () => 
    api.get('/patient/tests'),
  getTestReport: (testId: string) => 
    api.get(`/patient/tests/${testId}/report`),
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