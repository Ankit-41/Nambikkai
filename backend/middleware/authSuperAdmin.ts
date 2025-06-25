import { Request, Response, NextFunction } from 'express';
import {  SuperAdmin } from '../models/SuperAdmin';

export const SuperAdminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.query.email as string;
    console.log('Auth middleware - Email:', email);

    if (!email) {
      console.log('Auth middleware - No email provided');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const superAdmin = await SuperAdmin.findOne({ email });
    console.log('Auth middleware - Found super admin:', superAdmin ? 'Yes' : 'No');
    
    if (!superAdmin) {
      console.log('Auth middleware - Super admin not found');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    (req as any).superAdmin = superAdmin;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 