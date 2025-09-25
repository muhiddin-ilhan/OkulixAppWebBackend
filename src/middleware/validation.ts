import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../types';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: errorMessages.join(', ')
    } as ApiResponse);
    return;
  }

  next();
};

export const validateUpdateUserAsAdmin = [
  body('id')
    .notEmpty()
    .withMessage('User ID is required'),

  body('ad')
    .trim()
    .notEmpty()
    .withMessage('Lütfen ad kısmını boş bırakmayınız.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Adınız 2 ile 50 karakter arasında olmalıdır.'),

  body('soyad')
    .trim()
    .notEmpty()
    .withMessage('Lütfen soyad kısmını boş bırakmayınız.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyadınız 2 ile 50 karakter arasında olmalıdır.'),

  body('email')
    .isEmail()
    .withMessage('Lütfen geçerli bir email adresi giriniz.')
    .normalizeEmail(),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),

  handleValidationErrors
];

export const validateDeleteUserAsAdmin = [
  body('id')
    .notEmpty()
    .withMessage('User ID is required'),

  handleValidationErrors
];

export const validateAddUserAsAdmin = [
  body('ad')
    .trim()
    .notEmpty()
    .withMessage('Lütfen ad kısmını boş bırakmayınız.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Adınız 2 ile 50 karakter arasında olmalıdır.'),

  body('soyad')
    .trim()
    .notEmpty()
    .withMessage('Lütfen soyad kısmını boş bırakmayınız.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyadınız 2 ile 50 karakter arasında olmalıdır.'),

  body('email')
    .isEmail()
    .withMessage('Lütfen geçerli bir email adresi giriniz.')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter uzunluğunda olmalıdır.'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),

  handleValidationErrors
];

// User validation rules
export const validateUserRegistration = [
  body('ad')
    .trim()
    .notEmpty()
    .withMessage('Lütfen ad kısmını boş bırakmayınız.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Adınız 2 ile 50 karakter arasında olmalıdır.'),

  body('soyad')
    .trim()
    .notEmpty()
    .withMessage('Lütfen soyad kısmını boş bırakmayınız.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyadınız 2 ile 50 karakter arasında olmalıdır.'),

  body('email')
    .isEmail()
    .withMessage('Lütfen geçerli bir email adresi giriniz.')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter uzunluğunda olmalıdır.'),

  body('confirm_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Şifre ve şifre tekrarı eşleşmiyor. Lütfen tekrar deneyin.'),

  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

export const validateChangePassword = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),

  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),

  body('confirm_new_password')
    .custom((value, { req }) => value === req.body.new_password)
    .withMessage('New password and confirmation do not match'),

  handleValidationErrors
];

export const validateChangeEmail = [
  body('new_email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  handleValidationErrors
];

export const validateProductGalleryDelete = [
  body('id')
    .notEmpty()
    .withMessage('Ürün ID\'si boş bırakılamaz. Lütfen bir ürün ID\'si sağlayın.'),

  body('galleryName')
    .notEmpty()
    .withMessage('Galeri adı boş bırakılamaz. Lütfen bir galeri adı girin.'),

  handleValidationErrors
];

export const validateProductGalleryAddphoto = [
  body('id')
    .notEmpty()
    .withMessage('Ürün ID\'si boş bırakılamaz. Lütfen bir ürün ID\'si sağlayın.'),

  body('galleryName')
    .notEmpty()
    .withMessage('Galeri adı boş bırakılamaz. Lütfen bir galeri adı girin.'),

  body('gallery')
    .isObject()
    .withMessage('Galeri bir nesne olmalıdır.'),

  body('gallery.images')
    .isArray({ min: 1 })
    .withMessage('En az bir fotoğraf eklemelisiniz.'),

  handleValidationErrors
];

export const validateProductGalleryUpdate = [
  body('id')
    .notEmpty()
    .withMessage('Ürün ID\'si boş bırakılamaz. Lütfen bir ürün ID\'si sağlayın.'),

  body('galleryName')
    .notEmpty()
    .withMessage('Galeri adı boş bırakılamaz. Lütfen bir galeri adı girin.'),

  body('gallery')
    .isObject()
    .withMessage('Galeri bir nesne olmalıdır.'),

  body('gallery.name')
    .trim()
    .notEmpty()
    .withMessage('Galeri adı boş bırakılamaz. Lütfen bir galeri adı girin.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Galeri adı 2 ile 100 karakter arasında olmalıdır.'),

  body('gallery.order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Galeri sırası sıfır veya daha büyük bir tam sayı olmalıdır.'),

  handleValidationErrors
];

export const validateProductGallery = [
  body('id')
    .notEmpty()
    .withMessage('Ürün ID\'si boş bırakılamaz. Lütfen bir ürün ID\'si sağlayın.'),

  body('gallery')
    .isObject()
    .withMessage('Galeri bir nesne olmalıdır.'),

  body('gallery.name')
    .trim()
    .notEmpty()
    .withMessage('Galeri adı boş bırakılamaz. Lütfen bir galeri adı girin.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Galeri adı 2 ile 100 karakter arasında olmalıdır.'),

  body('gallery.images')
    .isArray({ min: 1 })
    .withMessage('Her galeri öğesi en az bir resim içermelidir.'),

  body('gallery.order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Galeri sırası sıfır veya daha büyük bir tam sayı olmalıdır.'),

  handleValidationErrors
];

export const validateProductBanner = [
  body('id')
    .notEmpty()
    .withMessage('Ürün ID\'si boş bırakılamaz. Lütfen bir ürün ID\'si sağlayın.'),

  body('banner')
    .notEmpty()
    .withMessage('Banner resmi boş bırakılamaz. Lütfen bir banner resmi sağlayın.'),

  handleValidationErrors
];

export const validateProductDelete = [
  body('id')
    .notEmpty()
    .withMessage('Ürün ID\'si boş bırakılamaz. Lütfen bir ürün ID\'si sağlayın.'),

  handleValidationErrors
];

export const validateProductLike = [
  body('productId')
    .notEmpty()
    .withMessage('Ürün ID\'si boş bırakılamaz. Lütfen bir ürün ID\'si sağlayın.'),

  handleValidationErrors
];

export const validateProductDownload = [
  body('id')
    .notEmpty()
    .withMessage('Ürün ID\'si boş bırakılamaz. Lütfen bir ürün ID\'si sağlayın.'),

  body('galleryName')
    .notEmpty()
    .withMessage('Galeri adı boş bırakılamaz. Lütfen bir galeri adı girin.'),

  handleValidationErrors
];

// Product validation rules
export const validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Ad alanını boş bırakılamaz. Lütfen bir ad girin.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Adınız 2 ile 100 karakter arasında olmalıdır.'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Ürün açıklaması boş bırakılamaz. Lütfen bir açıklama girin.')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Açıklamanız 10 ile 1000 karakter arasında olmalıdır.'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Kategori alanı boş bırakılamaz. Lütfen bir kategori seçin.'),

  body('visitorFake')
    .isNumeric()
    .withMessage('Ziyaretçi sayısı boş bırakılamaz. Lütfen bir değer girin.')
    .isInt({ min: 0 })
    .withMessage('Ziyaretçi sahte sayısı sıfır veya daha büyük bir tam sayı olmalıdır.'),

  body('visitor')
    .isNumeric()
    .withMessage('Ziyaretçi sayısı boş bırakılamaz. Lütfen bir değer girin.')
    .isInt({ min: 0 })
    .withMessage('Ziyaretçi sayısı sıfır veya daha büyük bir tam sayı olmalıdır.'),

  body('likesFake')
    .isNumeric()
    .withMessage('Ziyaretçi sayısı boş bırakılamaz. Lütfen bir değer girin.')
    .isInt({ min: 0 })
    .withMessage('Ziyaretçi sahte sayısı sıfır veya daha büyük bir tam sayı olmalıdır.'),

  body('likes')
    .isNumeric()
    .withMessage('Ziyaretçi sayısı boş bırakılamaz. Lütfen bir değer girin.')
    .isInt({ min: 0 })
    .withMessage('Ziyaretçi sayısı sıfır veya daha büyük bir tam sayı olmalıdır.'),

  body('favoritesFake')
    .isNumeric()
    .withMessage('Ziyaretçi sayısı boş bırakılamaz. Lütfen bir değer girin.')
    .isInt({ min: 0 })
    .withMessage('Favori sahte sayısı sıfır veya daha büyük bir tam sayı olmalıdır.'),

  body('favorites')
    .isNumeric()
    .withMessage('Ziyaretçi sayısı boş bırakılamaz. Lütfen bir değer girin.')
    .isInt({ min: 0 })
    .withMessage('Favori sayısı sıfır veya daha büyük bir tam sayı olmalıdır.'),

  body('downloadsFake')
    .isNumeric()
    .withMessage('Ziyaretçi sayısı boş bırakılamaz. Lütfen bir değer girin.')
    .isInt({ min: 0 })
    .withMessage('İndirme sahte sayısı sıfır veya daha büyük bir tam sayı olmalıdır.'),

  body('downloads')
    .isNumeric()
    .withMessage('Ziyaretçi sayısı boş bırakılamaz. Lütfen bir değer girin.')
    .isInt({ min: 0 })
    .withMessage('İndirme sayısı sıfır veya daha büyük bir tam sayı olmalıdır.'),

  handleValidationErrors
];

// Category validation rules
export const validateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),

  body('image')
    .notEmpty()
    .withMessage('Category image is required'),

  handleValidationErrors
];

export const validateUpdateCategory = [
  body('id')
    .notEmpty()
    .withMessage('Category ID is required'),

  handleValidationErrors
];

// Visitor validation rules
export const validateVisitor = [
  body('pageName')
    .trim()
    .notEmpty()
    .withMessage('Page name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Page name must be between 1 and 100 characters'),

  handleValidationErrors
];

// Report validation rules
export const validateReport = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Mesaj gereklidir')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Mesaj 10 ile 1000 karakter arasında olmalıdır'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('E-posta adresi gereklidir')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),

  body('productId')
    .optional()
    .isMongoId()
    .withMessage('Ürün ID geçerli bir MongoDB ObjectId olmalıdır'),

  handleValidationErrors
];
