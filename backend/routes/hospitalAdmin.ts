import express, { Router } from 'express';
import { 
  loginHospitalAdmin,
  getDashboardData,
  createDoctor,
  allocateTests,
  createAppointment,
  getPatientByCode
} from '../controllers/hospitalAdminController';
import { authMiddleware } from '../middleware/auth';
import { HospitalAdmin } from '../models';
import { SuperAdminAuthMiddleware } from '../middleware/authSuperAdmin';

const router: Router = express.Router();


// Auth routes (no auth middleware needed)
router.post('/login', loginHospitalAdmin);

// Protected routes (require auth)
router.get('/dashboard', authMiddleware, getDashboardData);
router.post('/doctors', authMiddleware, createDoctor);
router.post('/allocate-tests/:doctorId', authMiddleware, allocateTests);
router.post('/appointments', authMiddleware, createAppointment);
router.get('/patient/:patientCode', getPatientByCode);

export default router; 