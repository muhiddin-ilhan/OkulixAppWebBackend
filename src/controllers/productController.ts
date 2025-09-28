import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import { ApiResponse, AuthRequest } from '../types';
import { AppError, appErrorHandler } from '../utils/errorHandler';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { changeDirectoryName, deleteDirectory, deleteImage, getFileNameEnglish, uploadFilesToPath } from '../utils/uploadUtils';
import Like from '../models/Like';
import Favorite from '../models/Favorite';
import Download from '../models/Download';

// Helper function to get base upload path
const getUploadPath = () => {
  return process.env.UPLOAD_PATH || './uploads';
};

const getProductUploadPath = (productName: string, galleryName?: string) => {
  const basePath = `${getUploadPath().replace('./', '')}/product/${productName}`;
  return galleryName ? `${basePath}/${galleryName}` : basePath;
};

export const createProduct = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, category, visitorFake, visitor, likesFake, likes, favoritesFake, favorites, downloadsFake, downloads, isActive = true } = req.body;

  const productExists = await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, isActive: true });
  if (productExists) {
    throw new AppError('Bu isimde zaten bir ürün mevcut. Lütfen farklı bir isim seçin.', 400);
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new AppError('Kategori bulunamadı. Lütfen geçerli bir kategori sağlayın.', 400);
  }

  const product = new Product({
    name,
    description,
    category,
    visitorFake,
    visitor,
    likesFake,
    likes,
    favoritesFake,
    favorites,
    downloadsFake,
    downloads,
    isActive
  });

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  } as ApiResponse);
});

export const createProductBanner = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, banner } = req.body;

  const product = await Product.findOne({ _id: id, isActive: true });
  if (!product) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  deleteImage(product.banner);

  const bannerImage = uploadFilesToPath(`product/${product.name}/`, 'banner', [banner]);
  if (bannerImage.failed.length > 0 || bannerImage.success.length === 0) {
    throw new AppError('Banner resmi yüklenirken bir hata oluştu.', 400);
  }

  product.banner = bannerImage.success[0].relativePath;

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Product banner added successfully',
    data: product
  } as ApiResponse);
});

export const createProductGallery = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, gallery } = req.body;

  const product = await Product.findOne({ _id: id, isActive: true });
  if (!product) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  if (product.gallery.find(g => g.name === gallery.name)) {
    throw new AppError(`Bu isimde ("${gallery.name}") bir galeri zaten mevcut. Lütfen farklı bir isim seçin.`, 400);
  }

  const uploadedImages = uploadFilesToPath(`product/${product.name}/${gallery.name}/`, 'gallery', gallery.images);
  if (uploadedImages.failed.length > 0 || uploadedImages.success.length === 0) {
    throw new AppError(`Galeri "${gallery.name}" resimleri yüklenirken bir hata oluştu.`, 400);
  }

  gallery.images = uploadedImages.success.map(img => img.relativePath);

  product.gallery = [...product.gallery, gallery];

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Galeri başarıyla eklendi.',
    data: product
  } as ApiResponse);
});

export const updateProductGallery = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, galleryName, gallery } = req.body;

  const product = await Product.findOne({ _id: id });
  if (!product) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  const existingGallery = product.gallery.find(g => g.name === galleryName);

  if (!existingGallery) {
    throw new AppError(`Bu isimde ("${galleryName}") bir galeri bulunamadı.`, 404);
  }

  const checkGalleryNameExists = product.gallery.find(g => g.name === gallery.name);

  if (checkGalleryNameExists) {
    throw new AppError(`Bu isimde ("${gallery.name}") bir galeri zaten mevcut. Lütfen farklı bir isim seçin.`, 400);
  }

  const result = changeDirectoryName(getProductUploadPath(product.name, galleryName), getProductUploadPath(product.name, gallery.name));
  if (!result) {
    throw new AppError('Galeri adı değiştirilirken bir hata oluştu.', 500);
  }

  existingGallery.images = existingGallery.images.map(imgPath => {
    const parts = imgPath.split('/');
    parts[parts.length - 2] = gallery.name;
    return parts.join('/');
  });

  existingGallery.name = gallery.name;
  existingGallery.description = gallery.description;
  existingGallery.order = gallery.order;

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Galeri başarıyla güncellendi.',
    data: product
  } as ApiResponse);
});

export const deleteProductGallery = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, galleryName } = req.body;

  const product = await Product.findOne({ _id: id });
  if (!product) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  const existingGalleryIndex = product.gallery.findIndex(g => g.name === galleryName);

  if (existingGalleryIndex === -1) {
    throw new AppError(`Bu isimde ("${galleryName}") bir galeri bulunamadı.`, 404);
  }

  // Remove gallery directory
  deleteDirectory(getProductUploadPath(product.name, galleryName));

  // Remove gallery from product
  product.gallery.splice(existingGalleryIndex, 1);

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Galeri başarıyla silindi.',
    data: product
  } as ApiResponse);
});

export const addPhotoToGallery = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, galleryName, gallery } = req.body;

  const product = await Product.findOne({ _id: id });
  if (!product) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  const existingGallery = product.gallery.find(g => g.name === galleryName);

  if (!existingGallery) {
    throw new AppError(`Bu isimde ("${galleryName}") bir galeri bulunamadı.`, 404);
  }

  const uploadedImages = uploadFilesToPath(`product/${product.name}/${galleryName}/`, 'gallery', gallery.images);
  if (uploadedImages.failed.length > 0 || uploadedImages.success.length === 0) {
    throw new AppError(`Galeri "${galleryName}" resimleri yüklenirken bir hata oluştu.`, 400);
  }

  const newImagePaths = uploadedImages.success.map(img => img.relativePath);
  existingGallery.images.push(...newImagePaths);

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Galeri resimleri başarıyla eklendi.',
    data: product
  } as ApiResponse);
});

export const deletePhotoFromGallery = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, galleryName, gallery } = req.body;

  const product = await Product.findOne({ _id: id });
  if (!product) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  const existingGallery = product.gallery.find(g => g.name === galleryName);

  if (!existingGallery) {
    throw new AppError(`Bu isimde ("${galleryName}") bir galeri bulunamadı.`, 404);
  }

  if (existingGallery.images.length < 2) {
    throw new AppError(`Silinecek en az bir resim bulunmalıdır.`, 404);
  }

  existingGallery.images.forEach((imgPath: string) => {
    if (gallery.images.includes(imgPath)) {
      deleteImage(imgPath);
    }
  });

  existingGallery.images = existingGallery.images.filter(imgPath => !gallery.images.includes(imgPath));

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Galeri resimleri başarıyla silindi.',
    data: product
  } as ApiResponse);
});

// Helper function to get all subcategory IDs recursively
const getAllSubcategoryIds = async (categoryId: string): Promise<string[]> => {
  const subcategories = await Category.find({ parentId: categoryId, isActive: true });
  let allIds = [categoryId];
  
  for (const subcategory of subcategories) {
    const subIds = await getAllSubcategoryIds(subcategory._id.toString());
    allIds = [...allIds, ...subIds];
  }
  
  return allIds;
};

export const getProducts = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const { categoryName } = req.body;

  let query = { isActive: true } as any;

  if (categoryName) {
    const category = await Category.findOne({ 
      name: { $regex: new RegExp(`^${categoryName}$`, 'i') }, 
      isActive: true 
    });
    if (!category) {
      throw new AppError('Kategori bulunamadı. Lütfen geçerli bir kategori sağlayın.', 400);
    }
    
    // Get all subcategory IDs recursively (including the main category)
    const categoryIds = await getAllSubcategoryIds(category._id.toString());
    query.category = { $in: categoryIds };
  }

  // Find products
  const products = await Product.find(query).lean();

  if (products.length === 0) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  // Get unique category IDs from products to minimize database queries
  const uniqueCategoryIds = [...new Set(products.map(p => p.category.toString()))];
  
  // Fetch all categories at once for better performance
  const categories = await Category.find({ _id: { $in: uniqueCategoryIds } }).lean();
  
  // Create a category map for O(1) lookup
  const categoryMap = new Map(categories.map(cat => [cat._id.toString(), cat]));

  // Add category model information to each product
  const productsWithCategory = products.map(product => {
    const categoryModel = categoryMap.get(product.category.toString());
    return {
      ...product,
      categoryModel: categoryModel || null
    };
  });

  res.status(200).json({
    success: true,
    message: 'Products retrieved successfully',
    data: productsWithCategory,
  } as ApiResponse);
});

export const getProduct = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findOne({ name: { $regex: new RegExp(`^${req.body.name}$`, 'i') } });

  if (!product) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Ürün başarıyla getirildi.',
    data: product
  } as ApiResponse);
});

export const updateProduct = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, name, description, category, visitorFake, visitor, likesFake, likes, favoritesFake, favorites, downloadsFake, downloads, isActive } = req.body;

  const product = await Product.findById(id);
  if (!product || !product.isActive) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists || !categoryExists.isActive) {
      throw new AppError('Kategori bulunamadı. Lütfen geçerli bir kategori sağlayın.', 400);
    }
  }

  if (name && name !== product.name) {
    // Change product directory name    
    const result = changeDirectoryName(getProductUploadPath(product.name), getProductUploadPath(name));

    // Update gallery image paths
    product.gallery.forEach(gallery => {
      gallery.images = gallery.images.map(imgPath => {
        const parts = imgPath.split('/');
        parts[parts.length - 3] = name; // 'product' klasöründen sonraki kısım
        return parts.join('/');
      });
    });

    // Update banner path
    if (product.banner) {
      const bannerParts = product.banner.split('/');
      bannerParts[bannerParts.length - 2] = name;
      product.banner = bannerParts.join('/');
    }

    product.name = name;
  }

  // Update fields
  if (description) product.description = description;
  if (category) product.category = category;
  if (visitorFake !== undefined) product.visitorFake = visitorFake;
  if (visitor !== undefined) product.visitor = visitor;
  if (likesFake !== undefined) product.likesFake = likesFake;
  if (likes !== undefined) product.likes = likes;
  if (favoritesFake !== undefined) product.favoritesFake = favoritesFake;
  if (favorites !== undefined) product.favorites = favorites;
  if (downloadsFake !== undefined) product.downloadsFake = downloadsFake;
  if (downloads !== undefined) product.downloads = downloads;
  if (isActive !== undefined) product.isActive = isActive;

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Ürün başarıyla güncellendi.',
    data: product
  } as ApiResponse);
});

export const deleteProduct = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const product = await Product.findById(req.body.id);
  if (!product) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  // hard delete: remove product directory
  const result = deleteDirectory(getProductUploadPath(product.name));

  await product.deleteOne();

  await Like.deleteMany({ productId: product._id });
  await Favorite.deleteMany({ productId: product._id });

  res.status(200).json({
    success: true,
    message: 'Ürün başarıyla silindi.'
  } as ApiResponse);
});

export const likeProduct = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.body;
  
  // Request'ten otomatik olarak bilgileri al
  const user = req.user;
  if (!user) {
    throw new AppError('Beğenmek için giriş yapmalısınız.', 401);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Ürün bulunamadı. Lütfen geçerli bir ürün ID\'si sağlayın.', 404);
  }

  const like = await Like.find({ productId, userId: user._id });
  if (like.length > 0) {
    await Like.deleteMany({ productId, userId: user._id });
    // Decrement likes count
    product.likes -= 1;
  }else {
    // beğeni yoksa beğen ekle.
    const newLike = new Like({
      productId,
      userId: user._id,
    });
    await newLike.save();
    // Increment likes count
    product.likes += 1;
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Ürün başarıyla beğenildi',
    data: {
      likesCount: product.likes + product.likesFake
    }
  } as ApiResponse);
});

export const favoriteProduct = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.body;
  
  // Request'ten otomatik olarak bilgileri al
  const user = req.user;
  if (!user) {
    throw new AppError('Favorilere eklemek için giriş yapmalısınız.', 401);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Ürün bulunamadı. Lütfen geçerli bir ürün ID\'si sağlayın.', 404);
  }

  const favorite = await Favorite.find({ productId, userId: user?._id });
  if (favorite.length > 0) {
    await Favorite.deleteMany({ productId, userId: user?._id });
    // Decrement favorites count
    product.favorites -= 1;
  }else {
    // favori yoksa favori ekle.
    const newFavorite = new Favorite({
      productId,
      userId: user?._id,
    });
    await newFavorite.save();
    // Increment favorites count
    product.favorites += 1;
  }

  await product.save();


  res.status(200).json({
    success: true,
    message: 'Ürün başarıyla favorilere eklendi',
    data: {
      favoritesCount: product.favorites + product.favoritesFake
    }
  } as ApiResponse);
});

export const downloadProduct = appErrorHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, galleryName } = req.body;
  const user = req.user;

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  const galleryItem = product.gallery.find(g => g.name === galleryName);
  if (!galleryItem) {
    throw new AppError(`Bu isimde ("${galleryName}") bir galeri bulunamadı.`, 404);
  }

  // Download kaydı oluştur (sadece kayıtlı kullanıcılar için)
  if (user) {
    const newDownload = new Download({
      productId: id,
      userId: user._id
    });
    await newDownload.save();
  }

  // Increment downloads count
  product.downloads += 1;
  await product.save();

  // ZIP dosyası oluştur ve indir
  const zipFileName = `${galleryName}.zip`;


  // Response headers set et
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

  // Archiver oluştur
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maksimum sıkıştırma
  });

  // Hata yönetimi
  archive.on('error', (err) => {
    if (!res.headersSent) {
      throw new AppError('Dosya arşivlenirken bir hata oluştu.', 500);
    }
  });

  // Archive'i response stream'e pipe et
  archive.pipe(res);

  // Gallery klasör yolu
  const galleryPath = path.join(process.cwd(), getProductUploadPath(product.name, galleryName));

  console.log(galleryPath);

  // Klasör var mı kontrol et
  if (fs.existsSync(galleryPath)) {
    // Klasördeki tüm dosyaları archive'e ekle
    archive.directory(galleryPath, false);

    // Archive'i sonlandır
    await archive.finalize();
  } else {
    throw new AppError('Galeri dosyaları bulunamadı.', 404);
  }
});
