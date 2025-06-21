import express, { Router } from 'express';
import { 
  loginDoctor,
  getDashboardData,
  createPatient
} from '../controllers/doctorController';
import { authMiddleware } from '../middleware/auth';
import { DocAuthMiddleware } from '../middleware/authDoc';

const router: Router = express.Router();

// Auth routes (no auth middleware needed)
router.post('/login', loginDoctor);

// Protected routes (require auth)
router.get('/dashboard', DocAuthMiddleware, getDashboardData);
router.post('/patients', DocAuthMiddleware, createPatient);

export default router; 