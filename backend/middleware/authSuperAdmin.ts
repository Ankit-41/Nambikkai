import { Request, Response, NextFunction } from 'express';
import { SuperAdmin } from '../models/SuperAdmin';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';

export const SuperAdminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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

    const superAdmin = await SuperAdmin.findOne({ email: decoded.email });
    console.log('Auth middleware - Found super admin:', superAdmin ? 'Yes' : 'No');
    
    if (!superAdmin) {
      console.log('Auth middleware - Super admin not found');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    (req as any).superAdmin = superAdmin;
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