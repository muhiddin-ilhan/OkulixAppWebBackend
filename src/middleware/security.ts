import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// CORS configuration
const getCorsOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return [process.env.CORS_ORIGIN_PRODUCTION || 'https://yourdomain.com'];
  }
  return [
    process.env.CORS_ORIGIN_DEV_1 || 'http://localhost:3000',
    process.env.CORS_ORIGIN_DEV_2 || 'http://localhost:3001'
  ];
};

export const corsOptions = {
  origin: getCorsOrigins(),
  credentials: true,
  optionsSuccessStatus: 200
};

// Rate limiting
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limit
export const generalLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes by default
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Auth rate limit
export const authLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes by default
  parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5'), // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.'
);

// Helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [process.env.HELMET_CSP_DEFAULT_SRC === 'self' ? "'self'" : process.env.HELMET_CSP_DEFAULT_SRC || "'self'"],
      styleSrc: [
        process.env.HELMET_CSP_STYLE_SRC?.includes('self') ? "'self'" : "'self'",
        ...(process.env.HELMET_CSP_STYLE_SRC?.includes('unsafe-inline') ? ["'unsafe-inline'"] : ["'unsafe-inline'"])
      ],
      scriptSrc: [process.env.HELMET_CSP_SCRIPT_SRC === 'self' ? "'self'" : process.env.HELMET_CSP_SCRIPT_SRC || "'self'"],
      imgSrc: (process.env.HELMET_CSP_IMG_SRC || 'self data: https:').split(' ').map(src => 
        src === 'self' ? "'self'" : src
      ),
    },
  },
  crossOriginEmbedderPolicy: false
});
