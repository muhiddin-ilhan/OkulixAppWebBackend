import { Request } from 'express';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export interface IUser extends Document {
  _id: string;
  ad: string;
  soyad: string;
  email: string;
  password: string;
  lastLoginAt?: Date;
  visits: number;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  category: string;
  visitorFake: number;
  visitor: number;
  likesFake: number;
  likes: number;
  favoritesFake: number;
  favorites: number;
  downloadsFake: number;
  downloads: number;
  isActive: boolean;
  banner: string;
  gallery: {
    name: string;
    images: string[];
    order: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  _id: string;
  name: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IVisitor extends Document {
  _id: string;
  date: Date;
  pageName: string;
  visitors: number;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  ad?: string;
  soyad?: string;
}

export interface IReport extends Document {
  _id: string;
  productId?: string;
  userId?: string;
  message: string;
  email: string;
  readedAt?: Date;
  createdAt: Date;
}

export interface IFavorite extends Document {
  _id: string;
  productId: string;
  userId?: string | null;
  createdAt: Date;
}

export interface ILike extends Document {
  _id: string;
  productId: string;
  userId?: string | null;
  createdAt: Date;
}

export interface IDownload extends Document {
  _id: string;
  productId: string;
  userId: string;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
