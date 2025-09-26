import { Request, Response } from 'express';
import Report from '../models/Report';
import { ApiResponse, AuthRequest } from '../types';
import { AppError, appErrorHandler } from '../utils/errorHandler';
import Product from '../models/Product';
import User from '../models/User';

// Report ekleme (Herkese açık - user optional)
export const addReport = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, message, email } = req.body;

  const report = await Report.create({
    message,
    email,
    productId: productId || null,
    userId: req.user?.id || null
  });

  res.status(201).json({
    success: true,
    message: 'Rapor başarıyla oluşturuldu',
    data: report
  } as ApiResponse);
});

// Tüm reportları getir (Admin only)
export const getReports = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const reports = await Report.find();

  res.status(200).json({
    success: true,
    message: 'Raporlar başarıyla getirildi',
    data: {
      reports,
    }
  } as ApiResponse);
});

// Tek rapor getir (Admin only)
export const getReport = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.body;
  
  if (!id) {
    throw new AppError('Rapor ID gereklidir.', 400);
  }

  let report = await Report.findById(id);

  if (!report) {
    throw new AppError('Rapor bulunamadı.', 404);
  }

  let product = null;
  if (report.productId && report.productId.length > 0) {
    product = await Product.findById(report.productId);
  }

  let user = null;
  if (report.userId && report.userId.length > 0) {
    user = await User.findById(report.userId);
  }

  res.status(200).json({
    success: true,
    message: 'Rapor başarıyla getirildi',
    data: { report, product, user }
  } as ApiResponse);
});

// Rapor güncelleme (Admin only - sadece okundu durumu)
export const updateReport = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, markAsRead } = req.body;
  
  if (!id) {
    throw new AppError('Rapor ID gereklidir.', 400);
  }
  
  const report = await Report.findById(id);

  if (!report) {
    throw new AppError('Rapor bulunamadı.', 404);
  }

  if (markAsRead === true && report.readedAt == null) {
    report.readedAt = new Date();
    await report.save();
  }

  res.status(200).json({
    success: true,
    message: 'Rapor başarıyla güncellendi'
  } as ApiResponse);
});

// Rapor silme (Admin only)
export const deleteReport = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.body;
  
  if (!id) {
    throw new AppError('Rapor ID gereklidir.', 400);
  }

  await Report.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Rapor başarıyla silindi'
  } as ApiResponse);
});