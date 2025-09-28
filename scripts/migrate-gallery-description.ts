import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product';

// Load environment variables
dotenv.config();

const migrateGalleryDescription = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/okulix_db';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Find all products with gallery but without description in gallery items
    const products = await Product.find({
      'gallery': { $exists: true, $ne: [] }
    });

    console.log(`🔍 ${products.length} ürün bulundu`);

    let updatedCount = 0;
    
    for (const product of products) {
      let hasUpdate = false;
      
      // Check each gallery item for missing description
      for (const gallery of product.gallery) {
        if (!gallery.description) {
          gallery.description = `${gallery.name} galeri açıklaması. Bu galeri ${gallery.name} için oluşturulmuş resimler içermektedir.`;
          hasUpdate = true;
        }
      }

      if (hasUpdate) {
        await product.save();
        updatedCount++;
        console.log(`✅ ${product.name} ürünü güncellendi`);
      }
    }

    console.log(`🎉 Migration tamamlandı. ${updatedCount} ürün güncellendi.`);
    
  } catch (error) {
    console.error('❌ Migration hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Veritabanı bağlantısı kesildi');
  }
};

// Run migration
migrateGalleryDescription();