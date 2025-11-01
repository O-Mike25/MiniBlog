import { Response, NextFunction } from 'express';
import { CustomRequest } from '../types';

export function verifyRole(requiredRole: string) {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !user.role) return res.status(403).json({ message: 'Missing Role' });
    if (user.role !== requiredRole) 
        return res.status(403).json({ message: 'Unauthorized access to this role' });
    next();
  };
}
