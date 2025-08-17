import express from 'express';
import { getPatientProfile, getPatientTests, getTestReport } from '../controllers/patientController';

const router = express.Router();

// Get patient profile by patient code
router.get('/profile/:patientCode', getPatientProfile);

// Get patient tests by patient code
router.get('/tests/:patientCode', getPatientTests);

// Get specific test report by test ID
router.get('/test-report/:testId', getTestReport);

export default router;
