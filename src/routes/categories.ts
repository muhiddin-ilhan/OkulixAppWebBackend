import { Router } from 'express';
import { 
  createCategory, 
  getCategories, 
  getCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';
import { validateCategory, validateUpdateCategory } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/', getCategories);
router.post('/detail', getCategory);

// Protected routes (only authenticated users can create, update, delete)
router.post(
  '/add', 
  authenticate, 
  authorize('admin'),
  validateCategory,
  createCategory
);

router.post(
  '/update', 
  authenticate,
  authorize('admin'),
  validateUpdateCategory,
  updateCategory
);

router.post(
  '/delete',
  authenticate,
  authorize('admin'),
  validateUpdateCategory,
  deleteCategory
);

export default router;
