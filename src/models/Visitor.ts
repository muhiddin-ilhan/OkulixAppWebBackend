import mongoose, { Schema } from 'mongoose';
import { IVisitor } from '../types';

const visitorSchema = new Schema<IVisitor>({
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  pageName: {
    type: String,
    required: [true, 'Page name is required'],
    trim: true,
    maxlength: [100, 'Page name cannot be more than 100 characters']
  },
  visitors: {
    type: Number,
    required: [true, 'Visitors count is required'],
    min: [0, 'Visitors count cannot be negative'],
    default: 1
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Compound unique index - aynı gün aynı sayfa için sadece bir kayıt
visitorSchema.index({ date: 1, pageName: 1 }, { unique: true });

// Performance indexes
visitorSchema.index({ date: -1 }); // Tarih bazlı sorgular için
visitorSchema.index({ pageName: 1 }); // Sayfa bazlı sorgular için
visitorSchema.index({ visitors: -1 }); // Ziyaretçi sayısı bazlı sıralama için

export default mongoose.model<IVisitor>('Visitor', visitorSchema);
