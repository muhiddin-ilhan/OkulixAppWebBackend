import { Router } from 'express';
import { 
  addReport,
  getReports,
  getReport,
  updateReport,
  deleteReport
} from '../controllers/reportController';
import { validateReport } from '../middleware/validation';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Public route - Report ekleme (user optional)
router.post('/add', optionalAuthenticate, validateReport, addReport);

// Admin routes (authentication ve admin yetki gerekli)
router.post('/list', authenticate, authorize('admin'), getReports);
router.post('/detail', authenticate, authorize('admin'), getReport);
router.post('/update', authenticate, authorize('admin'), updateReport);
router.post('/delete', authenticate, authorize('admin'), deleteReport);

export default router;
