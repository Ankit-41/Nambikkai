import { Request, Response, NextFunction } from 'express';
import {  Doctor } from '../models';

export const DocAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.query.email as string;
    console.log('Auth middleware - Email:', email);

    if (!email) {
      console.log('Auth middleware - No email provided');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const doctor = await Doctor.findOne({ email });
    console.log('Auth middleware - Found doctor:', doctor ? 'Yes' : 'No');
    
    if (!doctor) {
      console.log('Auth middleware - Doctor not found');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    (req as any).doctor = doctor;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 