import { Request, Response } from 'express';
import { User, Doctor, Patient } from '../models';

export const loginDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Doctor login attempt:', req.body);
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      console.log('Missing fields:', { email, password });
      res.status(400).json({ 
        message: 'Missing required fields',
        required: ['email', 'password']
      });
      return;
    }

    // Find doctor by email
    const doctor = await Doctor.findOne({ email });
    console.log('Found doctor:', doctor ? 'Yes' : 'No');
    
    if (!doctor) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    if (doctor.password !== password) {
      console.log('Password mismatch');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Get user details
    const user = await User.findById(doctor.userId);
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Login successful',
      data: {
        id: doctor._id,
        name: user.name,
        email: doctor.email,
        gender: doctor.gender,
        testMetrics: doctor.testMetrics
      }
    });

  } catch (error) {
    console.error('Error logging in doctor:', error);
    res.status(500).json({ 
      message: 'Error logging in',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Getting dashboard data for doctor');
    const doctor = (req as any).doctor;
    console.log('Doctor from request:', doctor ? 'Found' : 'Not found');
    
    if (!doctor) {
      console.log('No doctor found in request');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    // Get all patients for this doctor
    const patients = await Patient.find({ doctorId: doctor._id })
      .populate('userId', 'name')
      .populate('tests');
    
    console.log('Found patients:', patients.length);

    await doctor.populate('userId', 'name');
    const doctorName = doctor.userId?.name || 'Doctor';
    const testMetrics = doctor.testMetrics;
   console.log('doctor name incoming - ', doctorName);
    res.status(200).json({
      message: 'Dashboard data retrieved successfully',
      data: {
        patients,
        doctorName,
        testMetrics
      }
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ 
      message: 'Error getting dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      age,
      sex,
      phoneNumber,
      address,
      kneeCondition,
      otherMorbidities,
      rehabDuration,
      mriImage
    } = req.body;

    const doctor = (req as any).doctor;
    if (!doctor) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Create user first
    const user = await User.create({
      name,
      role: 'patient'
    });

    // Create patient
    const patient = await Patient.create({
      userId: user._id,
      age,
      sex,
      phoneNumber,
      address,
      kneeCondition,
      otherMorbidities,
      rehabDuration,
      mriImage,
      doctorId: doctor._id,
      tests: []
    });

    res.status(201).json({
      message: 'Patient created successfully',
      data: {
        id: patient._id,
        name: user.name,
        age: patient.age,
        sex: patient.sex,
        kneeCondition: patient.kneeCondition
      }
    });

  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ 
      message: 'Error creating patient',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 