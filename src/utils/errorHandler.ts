import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

/**
 * Async route handler'ları sararak hataları otomatik olarak yakalayan wrapper
 * Try-catch kullanmak yerine bu fonksiyonu kullanabilirsiniz
 * 
 * Kullanım örneği:
 * export const getUsers = asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json({ success: true, data: users });
 * });
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Error caught by asyncHandler:', error);
      
      res.status(500).json({
        success: false,
        message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      } as ApiResponse);
    });
  };
};

/**
 * Manuel hata fırlatmak için kullanılabilecek custom error sınıfı
 * Belirli HTTP status kodları ile hata döndürmek için kullanılabilir
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * AppError instance'ları için özel handler
 * Bu sayede farklı status kodları döndürebilirsiniz
 */
export const appErrorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Error caught by appErrorHandler:', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.message
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
          error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        } as ApiResponse);
      }
    });
  };
};

export default asyncHandler;
