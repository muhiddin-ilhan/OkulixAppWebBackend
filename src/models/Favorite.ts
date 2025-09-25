import mongoose, { Schema } from 'mongoose';
import { IFavorite } from '../types';

const favoriteSchema = new Schema<IFavorite>({
  productId: {
    type: String,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  userId: {
    type: String,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // createdAt'ı manuel olarak yönetiyoruz
  versionKey: false
});

// Performance indexes
favoriteSchema.index({ createdAt: 1 });
favoriteSchema.index({ productId: 1 }); // Ürün bazlı sorgular için
favoriteSchema.index({ userId: 1 }); // Kullanıcı bazlı sorgular için

// Unique constraints - Aynı kullanıcı aynı ürüne birden fazla favori ekleyemez
favoriteSchema.index(
  { productId: 1, userId: 1 },
  { 
    unique: true,
    partialFilterExpression: { userId: { $ne: null } }
  }
);

export const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);
export default Favorite;