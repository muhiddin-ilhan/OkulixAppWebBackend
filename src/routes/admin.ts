import { Router } from 'express';
import { 
  getDailyVisitors,
  getPageVisitors,
  getVisitorStats
} from '../controllers/visitorController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin visitor analytics routes
router.post('/visitors/daily', getDailyVisitors);
router.post('/visitors/pages', getPageVisitors);
router.post('/visitors/stats', getVisitorStats);

export default router;
