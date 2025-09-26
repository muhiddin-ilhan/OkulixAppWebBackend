import express from 'express';
import {
  addVisitor,
  getDailyVisitors,
  getPageVisitors,
  getVisitorStats
} from '../controllers/visitorController';
import { validateVisitor } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Ziyaretçi ekleme (her sayfa başlangıcında çağırılacak)
// POST /api/visitors
router.post('/add', validateVisitor, addVisitor);

// Günlük ziyaretçi istatistikleri
// POST /api/visitors/daily
router.post('/daily',authenticate, authorize('admin'), getDailyVisitors);

// Sayfa bazında ziyaretçi istatistikleri
// POST /api/visitors/pages
router.post('/pages', authenticate, authorize('admin'), getPageVisitors);

// Genel ziyaretçi istatistikleri
// POST /api/visitors/stats
router.post('/stats', authenticate, authorize('admin'), getVisitorStats);

export default router;