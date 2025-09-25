import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
// 365 gün = 365 * 24 * 60 * 60 saniye
const JWT_EXPIRE_SECONDS = parseInt(process.env.JWT_EXPIRE_SECONDS || '31536000'); // 365 gün

export const generateToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRE_SECONDS
  };
  
  return jwt.sign(payload as object, JWT_SECRET, options);
};

export const verifyToken = (token: string): JWTPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded as JWTPayload;
};
