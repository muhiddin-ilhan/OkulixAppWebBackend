import compression from 'compression';
import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';

// Compression middleware
export const compressionMiddleware = compression({
  level: 6,
  threshold: 10000,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// Morgan logging
export const morganMiddleware = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
);

// Cache control middleware
export const cacheControl = (req: Request, res: Response, next: NextFunction) => {
  // Set cache headers for static assets
  if (req.path.startsWith('/uploads/')) {
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
  } else {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
};

// Request timing middleware
export const requestTiming = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
