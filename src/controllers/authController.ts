import { Request, Response } from 'express';
import User from '../models/User';
import Like from '../models/Like';
import Favorite from '../models/Favorite';
import Download from '../models/Download';
import { generateToken } from '../utils/jwt';
import { ApiResponse, AuthRequest } from '../types';
import { AppError, appErrorHandler } from '../utils/errorHandler';

export const register = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const { ad, soyad, email, password, confirm_password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Bu email zaten kayıtlı. Lütfen başka bir email kullanın.', 400);
  }

  // Create new user
  const user = new User({
    ad,
    soyad,
    email,
    password,
    lastLoginAt: new Date(),
  });

  await user.save();

  // Generate token
  const token = generateToken({
    userId: user._id,
    ad: user.ad,
    soyad: user.soyad,
    email: user.email,
    role: user.role
  });

  res.status(201).json({
    success: true,
    message: 'Kullanıcı başarıyla kaydedildi',
    data: {
      user: {
        id: user._id,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        likes: 0,
        favorites: 0,
        downloads: 0,
        visits: user.visits,
        token: token
      }
    }
  } as ApiResponse);
});

export const addUserAsAdmin = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const { ad, soyad, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Bu email zaten kayıtlı. Lütfen başka bir email kullanın.', 400);
  }

  // Create new user
  const user = new User({
    ad,
    soyad,
    email,
    password,
    role,
    lastLoginAt: new Date(),
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: 'Kullanıcı başarıyla eklendi',
    data: {
      user: {
        id: user._id,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        likes: 0,
        favorites: 0,
        downloads: 0,
        visits: user.visits
      }
    }
  } as ApiResponse);
});

export const updateUserAsAdmin = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const { id, ad, soyad, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new AppError('Kullanıcı bulunamadı. Lütfen geçerli bir ID girin.', 404);
  }

  // Update user information
  existingUser.ad = ad;
  existingUser.soyad = soyad;
  existingUser.email = email;
  existingUser.password = password;
  existingUser.role = role;

  await existingUser.save();


  res.status(200).json({
    success: true,
    message: 'Kullanıcı başarıyla güncellendi',
    data: {
      user: {
        id: existingUser._id,
        ad: existingUser.ad,
        soyad: existingUser.soyad,
        email: existingUser.email,
        role: existingUser.role,
        lastLoginAt: existingUser.lastLoginAt,
        visits: existingUser.visits
      }
    }
  } as ApiResponse);
});

export const deleteUserAsAdmin = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.body;

  // Check if user exists
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new AppError('Kullanıcı bulunamadı. Lütfen geçerli bir ID girin.', 404);
  }

  await existingUser.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Kullanıcı başarıyla silindi'
  } as ApiResponse);
});

export const login = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.isActive) {
    throw new AppError('Email veya şifre hatalı ya da kullanıcı pasif. Lütfen tekrar deneyin.', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Email veya şifre hatalı ya da kullanıcı pasif. Lütfen tekrar deneyin.', 401);
  }

  // Update last login time
  user.lastLoginAt = new Date();
  await user.save();

  // Generate token
  const token = generateToken({
    userId: user._id,
    ad: user.ad,
    soyad: user.soyad,
    email: user.email,
    role: user.role
  });

  res.status(200).json({
    success: true,
    message: 'Giriş başarıyla tamamlandı',
    data: {
      user: {
        id: user._id,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        visits: user.visits,
        token: token
      }
    }
  } as ApiResponse);
});

export const getProfile = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user;
  
  if (!user) {
    throw new AppError('Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.', 401);
  }

  // Kullanıcının like, favorite, download sayılarını al
  const [likesCount, favoritesCount, downloadsCount] = await Promise.all([
    Like.countDocuments({ userId: user._id }),
    Favorite.countDocuments({ userId: user._id }),
    Download.countDocuments({ userId: user._id })
  ]);

  res.status(200).json({
    success: true,
    message: 'Kullanıcı profili başarıyla getirildi',
    data: {
      user: {
        id: user._id,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        likes: likesCount,
        favorites: favoritesCount,
        downloads: downloadsCount,
        visits: user.visits,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    }
  } as ApiResponse);
});
export const getProfileAsAdmin = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    throw new AppError('Kullanıcı bilgisi bulunamadı.', 401);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Kullanıcı bilgisi bulunamadı.', 401);
  }

  // Kullanıcının like, favorite, download sayılarını al
  const [likesCount, favoritesCount, downloadsCount] = await Promise.all([
    Like.countDocuments({ userId: userId }),
    Favorite.countDocuments({ userId: userId }),
    Download.countDocuments({ userId: userId })
  ]);

  res.status(200).json({
    success: true,
    message: 'Kullanıcı profili başarıyla getirildi',
    data: {
      user: {
        id: userId,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        likes: likesCount,
        favorites: favoritesCount,
        downloads: downloadsCount,
        visits: user.visits,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    }
  } as ApiResponse);
});

export const getAllUsersAsAdmin = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  // MongoDB aggregation pipeline ile performanslı veri çekimi
  const users = await User.aggregate([
    {
      $lookup: {
        from: 'favorites',
        localField: '_id',
        foreignField: 'userId',
        as: 'userFavorites'
      }
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'userId',
        as: 'userLikes'
      }
    },
    {
      $lookup: {
        from: 'downloads',
        localField: '_id',
        foreignField: 'userId',
        as: 'userDownloads'
      }
    },
    {
      $project: {
        password: 0, // Şifreyi exclude et
        _id: 1,
        ad: 1,
        soyad: 1,
        email: 1,
        role: 1,
        lastLoginAt: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        visits: 1,
        // Gerçek sayıları hesapla
        likes: { $size: '$userLikes' },
        favorites: { $size: '$userFavorites' },
        downloads: { $size: '$userDownloads' }
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Kullanıcılar başarıyla getirildi',
    data: {
      users,
    }
  } as ApiResponse);
});

export const changePassword = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user;
  const { current_password, new_password } = req.body;

  if (!user) {
    throw new AppError('Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.', 401);
  }

  // Find user and include password
  const existingUser = await User.findById(user._id).select('+password');
  if (!existingUser) {
    throw new AppError('Kullanıcı bulunamadı. Lütfen tekrar deneyin.', 404);
  }

  // Check current password
  const isCurrentPasswordValid = await existingUser.comparePassword(current_password);
  if (!isCurrentPasswordValid) {
    throw new AppError('Mevcut şifre hatalı. Lütfen tekrar deneyin.', 401);
  }

  // Update password
  existingUser.password = new_password;
  await existingUser.save();

  res.status(200).json({
    success: true,
    message: 'Şifre başarıyla değiştirildi'
  } as ApiResponse);
});

export const changeEmail = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user;
  const { new_email } = req.body;

  if (!user) {
    throw new AppError('Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.', 401);
  }

  // Check if new email is already taken
  const existingUser = await User.findOne({ email: new_email });
  if (existingUser) {
    throw new AppError('Bu email zaten kayıtlı. Lütfen başka bir email kullanın.', 400);
  }

  // Update email
  const currentUser = await User.findById(user._id);
  if (!currentUser) {
    throw new AppError('Kullanıcı bulunamadı. Lütfen tekrar deneyin.', 404);
  }

  currentUser.email = new_email;
  await currentUser.save();

  res.status(200).json({
    success: true,
    message: 'Email başarıyla değiştirildi',
    data: {
      user: {
        id: currentUser._id,
        ad: currentUser.ad,
        soyad: currentUser.soyad,
        email: currentUser.email,
        role: currentUser.role,
        lastLoginAt: currentUser.lastLoginAt,
        visits: currentUser.visits,
        isActive: currentUser.isActive,
        createdAt: currentUser.createdAt
      }
    }
  } as ApiResponse);
});
