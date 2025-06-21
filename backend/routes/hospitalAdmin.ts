import express, { Router } from 'express';
import { 
  createHospitalAdmin, 
  loginHospitalAdmin,
  getDashboardData,
  createDoctor,
  allocateTests
} from '../controllers/hospitalAdminController';
import { authMiddleware } from '../middleware/auth';
import { HospitalAdmin } from '../models';

const router: Router = express.Router();


// Auth routes (no auth middleware needed)
router.post('/', createHospitalAdmin);
router.post('/login', loginHospitalAdmin);

// Protected routes (require auth)
router.get('/dashboard', authMiddleware, getDashboardData);
router.post('/doctors', createDoctor);
router.post('/allocate-tests/:doctorId', authMiddleware, allocateTests);

export default router; 