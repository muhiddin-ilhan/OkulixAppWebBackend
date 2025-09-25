import { Request, Response } from 'express';
import Visitor from '../models/Visitor';
import { ApiResponse } from '../types';
import { AppError, appErrorHandler } from '../utils/errorHandler';

// Ziyaretçi ekleme fonksiyonu
export const addVisitor = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const { pageName } = req.body;

  if (!pageName) {
    throw new AppError('Sayfa adı gereklidir.', 400);
  }

  // Bugünün tarihini al (sadece tarih kısmı, saat dahil değil)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Saati sıfırla, sadece tarih kalsın

  try {
    // Bugün bu sayfa için kayıt var mı kontrol et
    const existingRecord = await Visitor.findOne({
      date: today,
      pageName: pageName
    });

    if (existingRecord) {
      // Kayıt varsa ziyaretçi sayısını artır
      existingRecord.visitors += 1;
      await existingRecord.save();

      res.status(200).json({
        success: true,
        message: 'Ziyaretçi sayısı güncellendi',
        data: {
          date: existingRecord.date,
          pageName: existingRecord.pageName,
          visitors: existingRecord.visitors
        }
      } as ApiResponse);
    } else {
      // Kayıt yoksa yeni kayıt oluştur
      const newVisitor = new Visitor({
        date: today,
        pageName: pageName,
        visitors: 1
      });

      await newVisitor.save();

      res.status(201).json({
        success: true,
        message: 'Yeni ziyaretçi kaydı oluşturuldu',
        data: {
          date: newVisitor.date,
          pageName: newVisitor.pageName,
          visitors: newVisitor.visitors
        }
      } as ApiResponse);
    }
  } catch (error) {
    // Eğer unique constraint hatası ise (race condition durumunda)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      // Tekrar dene - bu sefer kayıt var olacak
      const existingRecord = await Visitor.findOne({
        date: today,
        pageName: pageName
      });

      if (existingRecord) {
        existingRecord.visitors += 1;
        await existingRecord.save();

        res.status(200).json({
          success: true,
          message: 'Ziyaretçi sayısı güncellendi',
          data: {
            date: existingRecord.date,
            pageName: existingRecord.pageName,
            visitors: existingRecord.visitors
          }
        } as ApiResponse);
      }
    } else {
      throw error;
    }
  }
});

// Günlük ziyaretçi istatistikleri (gün bazında toplam)
export const getDailyVisitors = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.body;

  // Aggregation pipeline ile günlük toplam ziyaretçileri al
  const matchStage: any = {};
  
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate as string);
    if (endDate) matchStage.date.$lte = new Date(endDate as string);
  }

  const dailyStats = await Visitor.aggregate([
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: '$date',
        totalVisitors: { $sum: '$visitors' },
        pageCount: { $sum: 1 },
        pages: {
          $push: {
            pageName: '$pageName',
            visitors: '$visitors'
          }
        }
      }
    },
    {
      $sort: { _id: -1 } // En yeni tarihler önce
    },
    {
      $project: {
        date: '$_id',
        totalVisitors: 1,
        pageCount: 1,
        pages: 1,
        _id: 0
      }
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Günlük ziyaretçi istatistikleri başarıyla getirildi',
    data: {
      dailyStats,
      totalDays: dailyStats.length
    }
  } as ApiResponse);
});

// Sayfa bazında ziyaretçi istatistikleri (gün ve sayfa bazında detay)
export const getPageVisitors = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, pageName } = req.body;

  const matchStage: any = {};
  
  // Tarih filtresi
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate as string);
    if (endDate) matchStage.date.$lte = new Date(endDate as string);
  }

  // Sayfa adı filtresi
  if (pageName) {
    matchStage.pageName = pageName;
  }

  const pageStats = await Visitor.aggregate([
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: {
          pageName: '$pageName',
          date: '$date'
        },
        visitors: { $first: '$visitors' },
        createdAt: { $first: '$createdAt' }
      }
    },
    {
      $group: {
        _id: '$_id.pageName',
        totalVisitors: { $sum: '$visitors' },
        visitDays: { $sum: 1 },
        dailyBreakdown: {
          $push: {
            date: '$_id.date',
            visitors: '$visitors',
            createdAt: '$createdAt'
          }
        }
      }
    },
    {
      $sort: { totalVisitors: -1 } // En çok ziyaret edilen sayfalar önce
    },
    {
      $project: {
        pageName: '$_id',
        totalVisitors: 1,
        visitDays: 1,
        averageVisitorsPerDay: {
          $round: [{ $divide: ['$totalVisitors', '$visitDays'] }, 2]
        },
        dailyBreakdown: {
          $sortArray: {
            input: '$dailyBreakdown',
            sortBy: { date: -1 }
          }
        },
        _id: 0
      }
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Sayfa bazında ziyaretçi istatistikleri başarıyla getirildi',
    data: {
      pageStats,
      totalPages: pageStats.length
    }
  } as ApiResponse);
});

// Genel istatistikler
export const getVisitorStats = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const totalStats = await Visitor.aggregate([
    {
      $group: {
        _id: null,
        totalVisitors: { $sum: '$visitors' },
        totalPages: { $addToSet: '$pageName' },
        totalDays: { $addToSet: '$date' },
        mostVisitedPage: {
          $push: {
            pageName: '$pageName',
            visitors: '$visitors'
          }
        }
      }
    },
    {
      $project: {
        totalVisitors: 1,
        totalUniquePages: { $size: '$totalPages' },
        totalActiveDays: { $size: '$totalDays' },
        averageVisitorsPerDay: {
          $round: [
            { $divide: ['$totalVisitors', { $size: '$totalDays' }] },
            2
          ]
        },
        _id: 0
      }
    }
  ]);

  // En çok ziyaret edilen sayfa
  const topPage = await Visitor.aggregate([
    {
      $group: {
        _id: '$pageName',
        totalVisitors: { $sum: '$visitors' }
      }
    },
    { $sort: { totalVisitors: -1 } },
    { $limit: 1 }
  ]);

  res.status(200).json({
    success: true,
    message: 'Genel ziyaretçi istatistikleri başarıyla getirildi',
    data: {
      ...totalStats[0],
      mostVisitedPage: topPage[0] || null
    }
  } as ApiResponse);
});
