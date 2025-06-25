import { Request, Response } from 'express';
import { SuperAdmin } from '../models/SuperAdmin';
import { User } from '../models/User';
import { HospitalAdmin } from '../models/HospitalAdmin';
import mongoose from 'mongoose';

export const createSuperAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get the raw body and parse it if needed
      let body = req.body;
      
      // If body is an object with a single key that looks like JSON string
      if (typeof body === 'object' && Object.keys(body).length === 1) {
        const key = Object.keys(body)[0];
        if (key.includes('{') && key.includes('}')) {
          try {
            body = JSON.parse(key);
          } catch (e) {
            console.error('Failed to parse JSON:', e);
          }
        }
      }
  
      // Validate request body
      if (!body || !body.name || !body.email || !body.password) {
        res.status(400).json({ 
          message: 'Missing required fields',
          required: ['name', 'email', 'password'],
          received: body
        });
        return;
      }
  
      const { name, email, password } = body;
      // Check if email already exists
      const existingAdmin = await SuperAdmin.findOne({ email });
      if (existingAdmin) {
        res.status(400).json({ message: 'Email already registered' });
        return;
      }
  
      // Create user first
      const user = await User.create({
        name,
        role: 'super_admin'
      });
  
      // Create Super admin
      const superAdmin = await SuperAdmin.create({
        userId: user._id,
        email,
        password,
        hospitalCentres: [],
        testMetrics: {
            totalTests: 50,
            testsAllocated: 0,
            testsDone: 0,
            testsRemaining: 50
          },
      });
  
      res.status(201).json({
        message: 'Super centre admin created successfully',
        data: {
          id: superAdmin._id,
          name: user.name,
          email: superAdmin.email
        }
      });
  
    } catch (error) {
      console.error('Error creating Super admin:', error);
      res.status(500).json({ 
        message: 'Error creating Super admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };


export const loginSuperAdmin = async (req: Request, res: Response): Promise<void> => {
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
      const superAdmin = await SuperAdmin.findOne({ email });
      if (!superAdmin) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
  
      // Check password
      if (superAdmin.password !== password) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
  
      // Get user details
      const user = await User.findById(superAdmin.userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      res.status(200).json({
        message: 'Login successful',
        data: {
          id: superAdmin._id,
          name: user.name,
          email: superAdmin.email,
          hospitalCentres: superAdmin.hospitalCentres
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
      const superAdmin = (req as any).superAdmin;
      console.log('getDashboardData - Super admin:', superAdmin);
      
      if (!superAdmin) {
        console.log('getDashboardData - No hospital admin found in request');
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      // Populate doctors and user details
  
      await superAdmin.populate([
        {
          path: 'userId',
          select: 'name'
        },
        {
          path: 'hospitalCentres',
          populate: [
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
          ]
        }
      ]);
      
      const adminName = superAdmin.userId?.name || 'Super Admin';
      console.log('getDashboardData - Populated data:', {
        hospitalCentres: superAdmin.hospitalCentres,
        name: adminName
      });
  
      res.status(200).json({
        message: 'Dashboard data retrieved successfully',
        data: {
          id: superAdmin._id,
          name: adminName,
          email: superAdmin.email,
          testMetrics: superAdmin.testMetrics,
          hospitalCentres: superAdmin.hospitalCentres
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


export const createHospitalAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get the raw body and parse it if needed
      let body = req.body;
      
      // If body is an object with a single key that looks like JSON string
      if (typeof body === 'object' && Object.keys(body).length === 1) {
        const key = Object.keys(body)[0];
        if (key.includes('{') && key.includes('}')) {
          try {
            body = JSON.parse(key);
          } catch (e) {
            console.error('Failed to parse JSON:', e);
          }
        }
      }
  
      // Validate request body
      if (!body || !body.name || !body.email || !body.password || !body.superAdminId || !body.totalTests) {
        res.status(400).json({ 
          message: 'Missing required fields',
          required: ['name', 'email', 'password', 'superAdminId', 'totalTests'],
          received: body
        });
        return;
      }
  
      const { name, email, password, superAdminId, totalTests } = body;
  
      // Check if email already exists
      const existingAdmin = await HospitalAdmin.findOne({ email });
      if (existingAdmin) {
        res.status(400).json({ message: 'Email already registered' });
        return;
      }
  
      // Verify that the SuperAdmin exists
      const superAdmin = await SuperAdmin.findById(superAdminId);
      if (!superAdmin) {
        res.status(400).json({ message: 'Invalid SuperAdmin ID' });
        return;
      }

      // Check if requested totalTests is more than superAdmin's testsRemaining
      if (!superAdmin.testMetrics) {
        res.status(500).json({ message: 'SuperAdmin test metrics not found' });
        return;
      }
      if (totalTests > superAdmin.testMetrics.testsRemaining) {
        res.status(400).json({ message: 'Requested tests exceed super admin tests remaining' });
        return;
      }
  
      // Create user first
      const user = await User.create({
        name,
        role: 'hospital_admin'
      });
  
      // Create hospital admin
      const hospitalAdmin = await HospitalAdmin.create({
        userId: user._id,
        email,
        password,
        createdBy: superAdminId,
        testMetrics: {
          totalTests: totalTests,
          testsAllocated: 0,
          testsDone: 0,
          testsRemaining: totalTests
        },
        doctors: []
      });

      superAdmin.hospitalCentres.push(hospitalAdmin._id);
      await superAdmin.save();
  
  
      res.status(201).json({
        message: 'Hospital centre admin created successfully',
        data: {
          id: hospitalAdmin._id,
          name: user.name,
          email: hospitalAdmin.email,
          testMetrics: hospitalAdmin.testMetrics
        }
      });
  
    } catch (error) {
      console.error('Error creating hospital admin:', error);
      res.status(500).json({ 
        message: 'Error creating hospital admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

export const allocateTestsToHospitalAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { superAdminId, hospitalAdminId, count } = req.body;
    console.log('--- allocateTestsToHospitalAdmin called ---');
    console.log('superAdminId:', superAdminId);
    console.log('hospitalAdminId:', hospitalAdminId);
    console.log('count:', count);
    if (!superAdminId || !hospitalAdminId || typeof count !== 'number') {
      console.log('Missing required fields');
      res.status(400).json({ message: 'Missing required fields', required: ['superAdminId', 'hospitalAdminId', 'count'] });
      return;
    }

    // Find super admin and hospital admin
    const superAdmin = await SuperAdmin.findById(superAdminId);
    const hospitalAdmin = await HospitalAdmin.findById(hospitalAdminId);
    console.log('superAdmin:', superAdmin);
    console.log('hospitalAdmin:', hospitalAdmin);
    if (!superAdmin || !hospitalAdmin) {
      console.log('SuperAdmin or HospitalAdmin not found');
      res.status(404).json({ message: 'SuperAdmin or HospitalAdmin not found' });
      return;
    }

    // Get test metrics
    const saMetrics = superAdmin.testMetrics;
    const haMetrics = hospitalAdmin.testMetrics;
    console.log('saMetrics:', saMetrics);
    console.log('haMetrics:', haMetrics);
    if (!saMetrics || !haMetrics) {
      console.log('Test metrics not found');
      res.status(500).json({ message: 'Test metrics not found' });
      return;
    }

    // Only allow allocation if superAdmin has enough testsRemaining
    if (count > 0 && saMetrics.testsRemaining < count) {
      console.log('Not enough tests remaining in super admin to allocate');
      res.status(400).json({ message: 'Not enough tests remaining in super admin to allocate' });
      return;
    }
    // Only allow de-allocation if hospitalAdmin has enough allocated/remaining
    if (count < 0 && (haMetrics.testsRemaining < Math.abs(count) || haMetrics.totalTests < Math.abs(count))) {
      console.log('Cannot de-allocate more tests than hospital admin has');
      res.status(400).json({ message: 'Cannot de-allocate more tests than hospital admin has' });
      return;
    }

    // Update super admin metrics
    saMetrics.testsAllocated += count;
    saMetrics.testsRemaining -= count;
    // Prevent negative values
    if (saMetrics.testsAllocated < 0) saMetrics.testsAllocated = 0;
    if (saMetrics.testsRemaining < 0) saMetrics.testsRemaining = 0;
    console.log('Updated saMetrics:', saMetrics);

    // Update hospital admin metrics
    haMetrics.totalTests += count;
    haMetrics.testsRemaining += count;
    // Prevent negative values
    if (haMetrics.totalTests < 0) haMetrics.totalTests = 0;
    if (haMetrics.testsRemaining < 0) haMetrics.testsRemaining = 0;
    console.log('Updated haMetrics:', haMetrics);

    await superAdmin.save();
    await hospitalAdmin.save();
    console.log('Saved superAdmin and hospitalAdmin');

    res.status(200).json({
      message: 'Tests allocation updated successfully',
      data: {
        hospitalAdminId: hospitalAdmin._id,
        testMetrics: hospitalAdmin.testMetrics,
        superAdminTestMetrics: superAdmin.testMetrics
      }
    });
  } catch (error) {
    console.error('Error allocating tests:', error);
    res.status(500).json({ message: 'Error allocating tests', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}


