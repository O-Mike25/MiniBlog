import { Response, NextFunction } from 'express';
import { CustomRequest } from '../types';

export function verifyRoles(...allowedRoles: string[]) {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !user.role) {
      return res.status(403).json({ message: "Missing role information" });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Unauthorized access for this role" });
    }
    next();
  };
}
