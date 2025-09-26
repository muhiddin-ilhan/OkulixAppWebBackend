import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/okulix_db';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      directConnection: true, // Direct connection
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    // Retry bağlantısı
    setTimeout(() => {
      console.log('Retrying database connection...');
      connectDB();
    }, 5000);
  }
};

export default connectDB;