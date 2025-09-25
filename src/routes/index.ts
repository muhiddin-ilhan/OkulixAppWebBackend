import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import categoryRoutes from './categories';
import adminRoutes from './admin';
import reportRoutes from './reports';
import visitorRoutes from './visitors';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/product', productRoutes);
router.use('/category', categoryRoutes);
router.use('/report', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/visitors', visitorRoutes);

export default router;