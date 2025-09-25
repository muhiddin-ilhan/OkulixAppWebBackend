import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../types';

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    ref: 'Category'
  },
  visitorFake: {
    type: Number,
    default: 0,
    min: [0, 'Visitor fake count cannot be negative']
  },
  visitor: {
    type: Number,
    default: 0,
    min: [0, 'Visitor count cannot be negative']
  },
  likesFake: {
    type: Number,
    default: 0,
    min: [0, 'Likes fake count cannot be negative']
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes count cannot be negative']
  },
  favoritesFake: {
    type: Number,
    default: 0,
    min: [0, 'Favorites fake count cannot be negative']
  },
  favorites: {
    type: Number,
    default: 0,
    min: [0, 'Favorites count cannot be negative']
  },
  downloadsFake: {
    type: Number,
    default: 0,
    min: [0, 'Downloads fake count cannot be negative']
  },
  downloads: {
    type: Number,
    default: 0,
    min: [0, 'Downloads count cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  banner: {
    type: String,
    default: ''
  },
  gallery: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Gallery name cannot be more than 100 characters']
    },
    images: [{
      type: String,
      required: true
    }],
    order: { 
      type: Number, 
      default: 0
    },
  }]
}, {
  timestamps: true
});

// Gallery name unique kontrolü için pre-save middleware
productSchema.pre('save', function(next) {
  if (this.gallery && this.gallery.length > 0) {
    const galleryNames = this.gallery.map(g => g.name.toLowerCase());
    const uniqueNames = [...new Set(galleryNames)];
    
    if (galleryNames.length !== uniqueNames.length) {
      const error = new Error('Gallery names must be unique within a product');
      return next(error);
    }
  }
  next();
});

// Index for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ visitor: 1 });
productSchema.index({ likes: 1 });
productSchema.index({ favorites: 1 });
productSchema.index({ downloads: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
