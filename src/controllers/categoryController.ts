import { Request, Response } from 'express';
import Category from '../models/Category';
import { ApiResponse } from '../types';
import { appErrorHandler, AppError } from '../utils/errorHandler';
import { deleteImage, uploadFilesToPath } from '../utils/uploadUtils';

export const createCategory = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, description, image, parentId } = req.body;

  const uploadedPhotoResults = uploadFilesToPath('categories', name, [image]);

  if (uploadedPhotoResults.failed.length > 0 || uploadedPhotoResults.success.length === 0) {
    throw new AppError('Kategori resmi yüklenirken bir hata oluştu: ' + uploadedPhotoResults.failed.map(f => f.error).join(', '), 500);
  }

  const category = new Category({
    name,
    description,
    parentId,
    image: uploadedPhotoResults.success[0].relativePath
  });

  await category.save();

  res.status(201).json({
    success: true,
    message: 'Kategori başarıyla oluşturuldu',
    data: category
  } as ApiResponse);
});

export const getCategories = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const rootCategories = await Category.find({ parentId: null });

  // Recursive function to get all children
  const getChildrenRecursive = async (parentId: string): Promise<any[]> => {
    const children = await Category.find({ parentId });
    
    const childrenWithSubChildren = await Promise.all(
      children.map(async (child) => ({
        ...child.toObject(),
        children: await getChildrenRecursive(child._id.toString())
      }))
    );
    
    return childrenWithSubChildren;
  };

  // Build categories with nested children
  const categoriesWithChildren = await Promise.all(
    rootCategories.map(async (category) => ({
      ...category.toObject(),
      children: await getChildrenRecursive(category._id.toString())
    }))
  );

  res.status(200).json({
    success: true,
    message: 'Kategoriler başarıyla getirildi',
    data: categoriesWithChildren
  } as ApiResponse);
});

export const getCategory = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findById(req.body.id);

  if (!category) {
    throw new AppError('Kategori bulunamadı.', 404);
  }

  // Recursive function to get all children
  const getChildrenRecursive = async (parentId: string): Promise<any[]> => {
    const children = await Category.find({ parentId });
    
    const childrenWithSubChildren = await Promise.all(
      children.map(async (child) => ({
        ...child.toObject(),
        children: await getChildrenRecursive(child._id.toString())
      }))
    );
    
    return childrenWithSubChildren;
  };

  // Build the response with all nested children
  const categoryWithChildren = {
    ...category.toObject(),
    children: await getChildrenRecursive(category._id.toString())
  };

  res.status(200).json({
    success: true,
    message: 'Kategori başarıyla getirildi.',
    data: categoryWithChildren
  } as ApiResponse);
});

export const updateCategory = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const { id, name, description, image, parentId } = req.body;

  const category = await Category.findById(id);
  
  if (!category) {
    throw new AppError('Kategori bulunamadı.', 404);
  }

  if (image) {
    const uploadedPhotoResults = uploadFilesToPath('categories', name, [image]);
    
    if (uploadedPhotoResults.failed.length > 0 || uploadedPhotoResults.success.length === 0) {
      throw new AppError('Kategori resmi yüklenirken bir hata oluştu: ' + uploadedPhotoResults.failed.map(f => f.error).join(', '), 500);
    }

    if (category.image){
      deleteImage(category.image);
    }

    category.image = uploadedPhotoResults.success[0].relativePath;
  }

  // Update fields
  if (name) category.name = name;
  if (description) category.description = description;
  if (parentId !== undefined) category.parentId = parentId;

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Kategori başarıyla güncellendi.',
    data: category
  } as ApiResponse);
});

export const deleteCategory = appErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findById(req.body.id);

  if (!category) {
    throw new AppError('Kategori bulunamadı.', 404);
  }

  const children = await Category.find({ parentId: category._id });

  if (children.length > 0) {
    throw new AppError('Bu kategori silinemez çünkü alt kategorilere sahip.', 400);
  }

  if (category.image) {
    deleteImage(category.image);
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Kategori başarıyla silindi.'
  } as ApiResponse);
});
