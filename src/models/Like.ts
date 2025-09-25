import mongoose, { Schema } from 'mongoose';
import { ILike } from '../types';

const likeSchema = new Schema<ILike>({
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
  timestamps: false,
  versionKey: false
});

// Performance indexes
likeSchema.index({ createdAt: 1 });
likeSchema.index({ productId: 1 }); // Ürün bazlı sorgular için
likeSchema.index({ userId: 1 }); // Kullanıcı bazlı sorgular için

// Unique constraints - Aynı kullanıcı aynı ürüne birden fazla beğeni ekleyemez
likeSchema.index(
  { productId: 1, userId: 1 },
  { 
    unique: true,
    partialFilterExpression: { userId: { $ne: null } }
  }
);

export const Like = mongoose.model<ILike>('Like', likeSchema);
export default Like;