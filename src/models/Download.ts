import mongoose, { Schema } from 'mongoose';
import { IDownload } from '../types';

const downloadSchema = new Schema<IDownload>({
  productId: {
    type: String,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  userId: {
    type: String,
    ref: 'User',
    required: [true, 'User ID is required']
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
downloadSchema.index({ createdAt: 1 });
downloadSchema.index({ productId: 1 }); // Ürün bazlı sorgular için
downloadSchema.index({ userId: 1 }); // Kullanıcı bazlı sorgular için

// Compound index for better query performance
downloadSchema.index({ productId: 1, userId: 1 });

export const Download = mongoose.model<IDownload>('Download', downloadSchema);
export default Download;