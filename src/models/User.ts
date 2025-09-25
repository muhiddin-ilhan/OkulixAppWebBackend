import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  ad: {
    type: String,
    required: [true, 'Ad is required'],
    trim: true,
    maxlength: [50, 'Ad cannot be more than 50 characters']
  },
  soyad: {
    type: String,
    required: [true, 'Soyad is required'],
    trim: true,
    maxlength: [50, 'Soyad cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  visits: {
    type: Number,
    default: 1,
    min: [0, 'Visits count cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    default: 'user',
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
