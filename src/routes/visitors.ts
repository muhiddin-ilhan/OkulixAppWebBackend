import express from 'express';
import {
  addVisitor,
  getDailyVisitors,
  getPageVisitors,
  getVisitorStats
} from '../controllers/visitorController';
import { validateVisitor } from '../middleware/validation';

const router = express.Router();

// Ziyaretçi ekleme (her sayfa başlangıcında çağırılacak)
// POST /api/visitors
router.post('/', validateVisitor, addVisitor);

// Günlük ziyaretçi istatistikleri
// POST /api/visitors/daily
router.post('/daily', getDailyVisitors);

// Sayfa bazında ziyaretçi istatistikleri
// POST /api/visitors/pages
router.post('/pages', getPageVisitors);

// Genel ziyaretçi istatistikleri
// POST /api/visitors/stats
router.post('/stats', getVisitorStats);

export default router;