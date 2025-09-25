import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../types';
import { AppError } from '../utils/errorHandler';

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  parentId: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// category name unique kontrolü için pre-save middleware
categorySchema.pre('save', async function (next) {
  const category = this;
  if (category.isModified('name')) {
    const existingCategory = await mongoose.models.Category.findOne({ name: category.name });
    if (existingCategory) {
      throw new AppError('Bu kategori adı zaten kullanılıyor.', 400);
    }
  }
  next();
});

// Index for better performance (name zaten unique olduğu için ayrıca index eklenmedi)
categorySchema.index({ isActive: 1 });

export default mongoose.model<ICategory>('Category', categorySchema);
