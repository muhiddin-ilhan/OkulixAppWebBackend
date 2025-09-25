import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { AppError, appErrorHandler } from '../utils/errorHandler';

export const authenticate = appErrorHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('Lütfen giriş yapın ve tekrar deneyin.', 401);
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      throw new AppError('Geçersiz kullanıcı, lütfen tekrar giriş yapın.', 401);
    }

    if (!user.role) {
      throw new AppError('Kullanıcı rolü tanımlanmamış, lütfen tekrar giriş yapın.', 403);
    }

    req.user = user;
    next();

});

// Optional authenticate - user bilgisini set eder ama hata vermez
export const optionalAuthenticate = appErrorHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive && user.role) {
          req.user = user;
        }
      } catch (error) {
        // Token geçersizse de devam et, sadece user bilgisi olmaz
      }
    }
    
    next();
});

export const authenticateOptional = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
      return;
    }

    const hasRole = roles.includes(req.user.role);
    if (!hasRole) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
      return;
    }

    next();
  };
};
