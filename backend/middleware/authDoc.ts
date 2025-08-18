import { Request, Response, NextFunction } from 'express';
import { Doctor } from '../models';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';

export const DocAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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

    const doctor = await Doctor.findOne({ email: decoded.email });
    console.log('Auth middleware - Found doctor:', doctor ? 'Yes' : 'No');
    
    if (!doctor) {
      console.log('Auth middleware - Doctor not found');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    (req as any).doctor = doctor;
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