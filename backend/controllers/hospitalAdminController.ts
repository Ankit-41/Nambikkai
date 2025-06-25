import { Request, Response } from 'express';
import { User, HospitalAdmin, Doctor } from '../models';
import mongoose from 'mongoose';



export const loginHospitalAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      res.status(400).json({ 
        message: 'Missing required fields',
        required: ['email', 'password']
      });
      return;
    }

    // Find hospital admin by email
    const hospitalAdmin = await HospitalAdmin.findOne({ email });
    if (!hospitalAdmin) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    if (hospitalAdmin.password !== password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Get user details
    const user = await User.findById(hospitalAdmin.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Login successful',
      data: {
        id: hospitalAdmin._id,
        name: user.name,
        email: hospitalAdmin.email,
        testMetrics: hospitalAdmin.testMetrics,
        doctors: hospitalAdmin.doctors
      }
    });

  } catch (error) {
    console.error('Error logging in hospital admin:', error);
    res.status(500).json({ 
      message: 'Error logging in',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    const hospitalAdmin = (req as any).hospitalAdmin;
    console.log('getDashboardData - Hospital admin:', hospitalAdmin);
    
    if (!hospitalAdmin) {
      console.log('getDashboardData - No hospital admin found in request');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    // Populate doctors and user details

    await hospitalAdmin
    .populate([
      {
        path: 'userId',
        select: 'name'
      },
      {
        path: 'doctors',
        populate: {
          path: 'userId',
          select: 'name'
        }
      }
    ]);
    const adminName = hospitalAdmin.userId?.name || 'Hospital Admin';
    console.log('getDashboardData - Populated data:', {
      testMetrics: hospitalAdmin.testMetrics,
      doctorsCount: hospitalAdmin.doctors.length,
      doctors: hospitalAdmin.doctors,
      name: adminName
    });

    res.status(200).json({
      message: 'Dashboard data retrieved successfully',
      data: {
        name: adminName,
        testMetrics: hospitalAdmin.testMetrics,
        doctors: hospitalAdmin.doctors
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



export const createDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, gender } = req.body;
    const adminEmail = req.query.email as string;

    // Validate request body
    if (!name || !email || !password || !gender) {
      res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'email', 'password', 'gender']
      });
      return;
    }

    // Find hospital admin by email
    const hospitalAdmin = await HospitalAdmin.findOne({ email: adminEmail });
    if (!hospitalAdmin) {
      res.status(401).json({ message: 'Hospital admin not found' });
      return;
    }

    // Check if doctor email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      res.status(400).json({ message: 'Doctor email already registered' });
      return;
    }

    // Create user first
    const user = await User.create({
      name,
      role: 'doctor'
    });

    // Create doctor
    const doctor = await Doctor.create({
      userId: user._id,
      email,
      password,
      gender,
      hospitalAdminId: hospitalAdmin._id,
      testMetrics: {
        totalTests: 0,
        testsAllocated: 0,
        testsDone: 0,
        testsRemaining: 0
      }
    });

    // Add doctor to hospital admin's doctors array
    hospitalAdmin.doctors.push(doctor._id);
    await hospitalAdmin.save();

    res.status(201).json({
      message: 'Doctor created successfully',
      data: {
        id: doctor._id,
        name: user.name,
        email: doctor.email,
        gender: doctor.gender,
        testMetrics: doctor.testMetrics
      }
    });

  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ 
      message: 'Error creating doctor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



export const allocateTests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const { count } = req.body;

    if (!count || count <= 0) {
      res.status(400).json({ message: 'Invalid test count' });
      return;
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    const hospitalAdmin = await HospitalAdmin.findById(doctor.hospitalAdminId);
    if (!hospitalAdmin) {
      res.status(404).json({ message: 'Hospital admin not found' });
      return;
    }

    // Check if testMetrics exists
    if (!hospitalAdmin.testMetrics) {
      res.status(500).json({ message: 'Hospital admin test metrics not initialized' });
      return;
    }

    // Check if doctor's testMetrics exists
    if (!doctor.testMetrics) {
      res.status(500).json({ message: 'Doctor test metrics not initialized' });
      return;
    }

    // Check if enough tests are available
    if (hospitalAdmin.testMetrics.testsRemaining < count) {
      res.status(400).json({ message: 'Not enough tests available' });
      return;
    }

    // Update doctor's test metrics
    doctor.testMetrics.testsAllocated += count;
    doctor.testMetrics.testsRemaining += count;
    await doctor.save();

    // Update hospital admin's test metrics
    hospitalAdmin.testMetrics.testsAllocated -= count;
    hospitalAdmin.testMetrics.testsRemaining -= count;
    await hospitalAdmin.save();

    res.status(200).json({
      message: 'Tests allocated successfully',
      data: {
        doctor: doctor.testMetrics,
        hospitalAdmin: hospitalAdmin.testMetrics
      }
    });
  } catch (error) {
    console.error('Error allocating tests:', error);
    res.status(500).json({ 
      message: 'Error allocating tests',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 