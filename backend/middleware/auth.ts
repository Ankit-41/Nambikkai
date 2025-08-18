import { Request, Response, NextFunction } from 'express';
import { HospitalAdmin, Doctor, User } from '../models';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';

export const authMiddleware = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('Auth middleware - No authorization header');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);
    
    console.log('Auth middleware - Decoded token:', decoded);

    // Check if it's a hospital admin route
    const hospitalAdmin = await HospitalAdmin.findOne({ email: decoded.email });
    console.log('Auth middleware - Found hospital admin:', hospitalAdmin ? 'Yes' : 'No');
    
    if (!hospitalAdmin) {
      console.log('Auth middleware - Hospital admin not found');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    (req as any).hospitalAdmin = hospitalAdmin;
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      message: 'Invalid or expired token',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 