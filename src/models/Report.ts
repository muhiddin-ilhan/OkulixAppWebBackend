import mongoose, { Schema } from 'mongoose';
import { IReport } from '../types';

const reportSchema = new Schema<IReport>({
  productId: {
    type: String,
    required: false,
    default: null,
    ref: 'Product'
  },
  userId: {
    type: String,
    required: false,
    default: null,
    ref: 'User'
  },
  message: {
    type: String,
    required: [true, 'Mesaj gereklidir'],
    trim: true,
    minlength: [10, 'Mesaj en az 10 karakter olmalıdır'],
    maxlength: [1000, 'Mesaj en fazla 1000 karakter olabilir']
  },
  email: {
    type: String,
    required: [true, 'E-posta adresi gereklidir'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  readedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index for better performance
reportSchema.index({ productId: 1 });
reportSchema.index({ userId: 1 });
reportSchema.index({ email: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ readedAt: 1 });

// Compound indexes
reportSchema.index({ productId: 1, createdAt: -1 });
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model<IReport>('Report', reportSchema);