import { Request, Response } from 'express';
import Report from '../models/Report';
import { ApiResponse, AuthRequest } from '../types';
import { AppError, appErrorHandler } from '../utils/errorHandler';

// Report ekleme (Herkese açık - user optional)
export const addReport = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, message, email } = req.body;

  if (!message || !email) {
    throw new AppError('Mesaj ve e-posta adresi gereklidir.', 400);
  }

  const reportData: any = {
    message,
    email,
    productId: productId || null,
    userId: req.user?.id || null
  };

  const report = await Report.create(reportData);

  // Populate product ve user bilgilerini getir
  await report.populate([
    { path: 'productId', select: 'name description' },
    { path: 'userId', select: 'ad soyad email' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Rapor başarıyla oluşturuldu',
    data: report
  } as ApiResponse);
});

// Tüm reportları getir (Admin only)
export const getReports = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.body.page) || 1;
  const limit = parseInt(req.body.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, productId, userId } = req.body;

  // Filtreleme koşulları
  const filter: any = {};
  
  if (status === 'read') {
    filter.readedAt = { $ne: null };
  } else if (status === 'unread') {
    filter.readedAt = null;
  }
  
  if (productId) {
    filter.productId = productId;
  }
  
  if (userId) {
    filter.userId = userId;
  }

  const reports = await Report.find(filter)
    .populate('productId', 'name description category')
    .populate('userId', 'ad soyad email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Report.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Raporlar başarıyla getirildi',
    data: {
      reports,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  } as ApiResponse);
});

// Tek rapor getir (Admin only)
export const getReport = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.body;
  
  if (!id) {
    throw new AppError('Rapor ID gereklidir.', 400);
  }

  const report = await Report.findById(id)
    .populate('productId', 'name description category')
    .populate('userId', 'ad soyad email');

  if (!report) {
    throw new AppError('Rapor bulunamadı.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Rapor başarıyla getirildi',
    data: report
  } as ApiResponse);
});

// Raporu okundu olarak işaretle (Admin only)
export const markAsRead = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.body;
  
  if (!id) {
    throw new AppError('Rapor ID gereklidir.', 400);
  }

  const report = await Report.findById(id);

  if (!report) {
    throw new AppError('Rapor bulunamadı.', 404);
  }

  if (report.readedAt) {
    throw new AppError('Bu rapor zaten okunmuş.', 400);
  }

  report.readedAt = new Date();
  await report.save();

  // Güncellenmiş raporu populate ile getir
  await report.populate([
    { path: 'productId', select: 'name description' },
    { path: 'userId', select: 'ad soyad email' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Rapor okundu olarak işaretlendi',
    data: report
  } as ApiResponse);
});

// Rapor güncelleme (Admin only - sadece okundu durumu)
export const updateReport = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, markAsRead: shouldMarkAsRead } = req.body;
  
  if (!id) {
    throw new AppError('Rapor ID gereklidir.', 400);
  }
  
  const report = await Report.findById(id);

  if (!report) {
    throw new AppError('Rapor bulunamadı.', 404);
  }

  if (shouldMarkAsRead !== undefined) {
    report.readedAt = shouldMarkAsRead ? new Date() : undefined;
    await report.save();
  }

  // Güncellenmiş raporu populate ile getir
  await report.populate([
    { path: 'productId', select: 'name description' },
    { path: 'userId', select: 'ad soyad email' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Rapor başarıyla güncellendi',
    data: report
  } as ApiResponse);
});

// Rapor silme (Admin only)
export const deleteReport = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.body;
  
  if (!id) {
    throw new AppError('Rapor ID gereklidir.', 400);
  }

  const report = await Report.findById(id);

  if (!report) {
    throw new AppError('Rapor bulunamadı.', 404);
  }

  await Report.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Rapor başarıyla silindi'
  } as ApiResponse);
});

// Rapor istatistikleri (Admin only)
export const getReportStats = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const totalReports = await Report.countDocuments();
  const readReports = await Report.countDocuments({ readedAt: { $ne: null } });
  const unreadReports = totalReports - readReports;
  
  // Son 7 günlük raporlar
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentReports = await Report.countDocuments({ 
    createdAt: { $gte: sevenDaysAgo } 
  });

  // Son 30 günlük raporlar
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlyReports = await Report.countDocuments({ 
    createdAt: { $gte: thirtyDaysAgo } 
  });

  // En çok rapor edilen ürünler
  const topReportedProducts = await Report.aggregate([
    {
      $match: { productId: { $ne: null } }
    },
    {
      $group: {
        _id: '$productId',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $project: {
        productName: '$product.name',
        count: 1
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Rapor istatistikleri başarıyla getirildi',
    data: {
      total: totalReports,
      read: readReports,
      unread: unreadReports,
      recent: recentReports,
      monthly: monthlyReports,
      readPercentage: totalReports > 0 ? Math.round((readReports / totalReports) * 100) : 0,
      topReportedProducts
    }
  } as ApiResponse);
});