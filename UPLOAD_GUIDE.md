# Upload Middleware Kullanım Kılavuzu

Bu dosya, yeni esnek upload middleware sisteminin nasıl kullanılacağını açıklar.

## Klasör Yapısı

Upload sistemi aşağıdaki klasör yapısını oluşturur:

```
uploads/
├── categories/
│   ├── kategori_adi/
│   │   └── kategori_adi.png
│   └── baska_kategori/
│       └── baska_kategori.jpg
├── products/
│   ├── product_adi/
│   │   ├── banner/
│   │   │   └── product_adi.jpg
│   │   ├── gallery_1/
│   │   │   ├── image-123456.jpg
│   │   │   └── image-789012.jpg
│   │   └── gallery_2/
│   │       └── image-345678.jpg
│   └── baska_product/
│       └── banner/
│           └── baska_product.png
├── users/
│   ├── user_123/
│   │   └── user_123.jpg
│   └── user_456/
│       └── user_456.png
└── general/
    ├── file-123456.jpg
    └── file-789012.pdf
```

## Route'larda Kullanım

### 1. Kategori Resmi Upload

```typescript
import { uploadCategoryImage } from '../middleware/upload';

router.post(
  '/add-category',
  authenticate,
  authorize('admin'),
  (req: Request, res: Response, next: NextFunction) => {
    const categoryName = req.body.name || 'unknown';
    return uploadCategoryImage('image', categoryName)(req, res, next);
  },
  handleUploadError,
  validateCategory,
  createCategory
);
```

**Sonuç:** `uploads/categories/kategori_adi/kategori_adi.png`

### 2. Product Banner Upload

```typescript
import { uploadProductBanner } from '../middleware/upload';

router.post(
  '/add-product',
  authenticate,
  authorize('admin'),
  (req: Request, res: Response, next: NextFunction) => {
    const productName = req.body.name || 'unknown';
    return uploadProductBanner('banner', productName)(req, res, next);
  },
  handleUploadError,
  validateProduct,
  createProduct
);
```

**Sonuç:** `uploads/products/product_adi/banner/product_adi.jpg`

### 3. Product Gallery Upload

```typescript
import { uploadProductGallery } from '../middleware/upload';

router.post(
  '/:id/upload-gallery',
  authenticate,
  authorize('admin'),
  (req: Request, res: Response, next: NextFunction) => {
    const productName = req.body.productName || 'unknown';
    const galleryName = req.body.galleryName || 'gallery';
    return uploadProductGallery('photos', productName, galleryName, 10)(req, res, next);
  },
  handleUploadError,
  uploadToGallery
);
```

**Sonuç:** `uploads/products/product_adi/gallery_adi/image-123456.jpg`

### 4. User Avatar Upload

```typescript
import { uploadUserAvatar } from '../middleware/upload';

router.post(
  '/upload-avatar',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id || 'unknown';
    return uploadUserAvatar('avatar', userId)(req, res, next);
  },
  handleUploadError,
  updateUserAvatar
);
```

**Sonuç:** `uploads/users/user_123/user_123.jpg`

## Özelleştirilmiş Kullanım

### Manuel Konfigürasyon

```typescript
import { uploadSingle, uploadMultiple } from '../middleware/upload';

// Özel kategori upload
const customCategoryUpload = uploadSingle('image', {
  entityType: 'category',
  entityName: 'my-category',
  useEntityNameAsFilename: true
});

// Özel product upload
const customProductUpload = uploadMultiple('files', 5, {
  entityType: 'product',
  entityName: 'my-product',
  subFolder: 'screenshots',
  useEntityNameAsFilename: false
});
```

## Controller'da Dosya Bilgilerine Erişim

Upload işleminden sonra, dosya bilgileri `req.file` (tek dosya) veya `req.files` (çoklu dosya) içinde bulunur:

```typescript
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'Resim yüklenemedi'
      });
    }

    // Dosya yolu: uploadedFile.path
    // Dosya adı: uploadedFile.filename
    // MIME type: uploadedFile.mimetype
    // Dosya boyutu: uploadedFile.size

    const category = new Category({
      name,
      description,
      image: uploadedFile.path
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Kategori oluşturuldu',
      data: category
    });
  } catch (error) {
    // Error handling
  }
};
```

## Utility Fonksiyonları

```typescript
import { 
  getFilePath, 
  getFilesInDirectory, 
  deleteFile,
  getRelativeUrl 
} from '../utils/uploadUtils';

// Dosya yolu alma
const categoryImagePath = getFilePath.category('kategori-adi', 'kategori-adi.png');
const productBannerPath = getFilePath.product('product-adi', 'banner', 'product-adi.jpg');

// Klasördeki dosyaları listeleme
const galleryFiles = getFilesInDirectory(getFilePath.product('product-adi', 'gallery'));

// Dosya silme
const deleted = deleteFile(categoryImagePath);

// Client için relative URL
const publicUrl = getRelativeUrl(categoryImagePath);
```

## Hata Yönetimi

```typescript
import { handleUploadError } from '../middleware/upload';

// Route'larda her zaman handleUploadError middleware'ini kullan
router.post(
  '/upload',
  uploadMiddleware,
  handleUploadError,  // Bu middleware upload hatalarını yakalar
  controllerFunction
);
```

## Önemli Notlar

1. **Dosya Adları:** Özel karakterler ve Türkçe karakterler otomatik olarak temizlenir
2. **Klasör Yapısı:** Otomatik olarak oluşturulur
3. **Dosya Boyutu:** Varsayılan maksimum boyut 5MB (env ile değiştirilebilir)
4. **Dosya Tipleri:** Sadece resim dosyaları kabul edilir
5. **Güvenlik:** Tüm dosya adları ve yolları güvenli hale getirilir