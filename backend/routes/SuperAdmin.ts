import express, { Router } from 'express';
import { createHospitalAdmin,createSuperAdmin, getDashboardData, loginSuperAdmin, allocateTestsToHospitalAdmin } from '../controllers/superAdminController';
import { SuperAdminAuthMiddleware } from '../middleware/authSuperAdmin';

const router: Router = express.Router();

router.post('/create-super-admin', createSuperAdmin);
router.post('/login', loginSuperAdmin);
router.get('/dashboard', SuperAdminAuthMiddleware, getDashboardData);
router.post('/create-hospital-admin', createHospitalAdmin);
router.post('/allocate-tests', allocateTestsToHospitalAdmin);

export default router;