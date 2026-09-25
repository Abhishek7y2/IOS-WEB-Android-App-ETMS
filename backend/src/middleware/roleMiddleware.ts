import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    const userDesignation = req.user?.designation;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. User role is not defined.',
      });
    }

    // Admins can also be determined by designation in this system
    const isAdminDesignation = userDesignation === 'Admin' || userDesignation === 'Project Manager' || userDesignation === 'CEO';
    
    if (allowedRoles.includes(userRole) || (allowedRoles.includes('admin') && isAdminDesignation)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden. You do not have the required permissions to access this resource.',
    });
  };
};
