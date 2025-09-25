import { Router, Request, Response, NextFunction } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  likeProduct,
  favoriteProduct,
  downloadProduct,
  createProductBanner,
  createProductGallery,
  updateProductGallery,
  deleteProductGallery,
  addPhotoToGallery,
  deletePhotoFromGallery,
} from '../controllers/productController';
import { validateProduct, validateProductBanner, validateProductDelete, validateProductDownload, validateProductGallery, validateProductGalleryAddphoto, validateProductGalleryDelete, validateProductGalleryUpdate, validateProductLike } from '../middleware/validation';
import { authenticate, authenticateOptional, authorize } from '../middleware/auth';


const router = Router();

// Public routes
router.post('/', getProducts);
router.post('/detail', getProduct);

// Protected routes (only admin users can create, update, delete)
router.post('/add', authenticate, authorize('admin'), validateProduct, createProduct);
router.post('/add-banner', authenticate, authorize('admin'), validateProductBanner, createProductBanner);
router.post('/add-gallery', authenticate, authorize('admin'), validateProductGallery, createProductGallery);
router.post('/update-gallery', authenticate, authorize('admin'), validateProductGalleryUpdate, updateProductGallery);
router.post('/delete-gallery', authenticate, authorize('admin'), validateProductGalleryDelete, deleteProductGallery);
router.post('/add-photo-to-gallery', authenticate, authorize('admin'), validateProductGalleryAddphoto, addPhotoToGallery);
router.post('/delete-photo-from-gallery', authenticate, authorize('admin'), validateProductGalleryAddphoto, deletePhotoFromGallery);
router.post('/update', authenticate, authorize('admin'), validateProduct, updateProduct);
router.post('/delete', authenticate, authorize('admin'), validateProductDelete, deleteProduct);

// User interaction routes
router.post('/like', authenticate, validateProductLike, likeProduct);
router.post('/favorite', authenticate, validateProductLike, favoriteProduct);
router.post('/download', authenticateOptional, validateProductDownload, downloadProduct);

export default router;
