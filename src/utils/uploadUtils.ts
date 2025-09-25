import path from 'path';
import fs from 'fs';
import { get } from 'http';

/**
 * Universal upload function - Base64 listesini fotoğraf olarak kaydeder
 * @param customPath - Hedef klasör yolu (örn: "product/blabla/foobar/", "category/", "reports/")
 * @param files - Base64 string listesi
 * @returns Yüklenen dosyaların path'lerini döndürür
 */
export const uploadFilesToPath = (
    customPath: string,
    imageName: string,
    files: string[]
): {
    success: Array<{
        originalName: string;
        newName: string;
        relativePath: string;
        fullPath: string;
        size: number;
    }>;
    failed: Array<{
        originalName: string;
        error: string;
    }>;
} => {
    const baseUploadDir = process.env.UPLOAD_PATH || './uploads';

    // Path'i temizle ve tam yol oluştur
    const cleanPath = customPath.replace(/\\/g, '/').replace(/\/+/g, '/');
    const finalPath = path.join(baseUploadDir, cleanPath);

    // Klasörü oluştur
    createDirectoryStructure(finalPath);

    const success: Array<{
        originalName: string;
        newName: string;
        relativePath: string;
        fullPath: string;
        size: number;
    }> = [];

    const failed: Array<{
        originalName: string;
        error: string;
    }> = [];

    files.forEach((base64String, index) => {
        try {
            // 1. Önce geçerli bir base64 resim formatı mı kontrol et
            if (!isValidImageBase64(base64String)) {
                failed.push({
                    originalName: `image_${index}`,
                    error: 'Geçersiz base64 resim formatı'
                });
                return;
            }

            // 2. Base64 string'i temizle (data:image/jpeg;base64, gibi prefix'leri kaldır)
            const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');

            // 3. Base64'ü buffer'a çevir
            const imageBuffer = Buffer.from(base64Data, 'base64');

            // 4. Dosya boyutu kontrolü (5MB limit)
            const fileSizeInMB = imageBuffer.length / (1024 * 1024);
            if (fileSizeInMB > 5) {
                failed.push({
                    originalName: `image_${index}`,
                    error: 'Dosya boyutu 5MB\'yi aşıyor'
                });
                return;
            }

            // 5. Dosya uzantısını belirle (base64 prefix'inden)
            let ext = '.png'; // default
            const mimeMatch = base64String.match(/^data:image\/([a-z]+);base64,/);
            if (mimeMatch) {
                ext = mimeMatch[1] === 'jpeg' ? '.jpg' : `.${mimeMatch[1]}`;
            }

            // 6. Benzersiz dosya adı oluştur
            var uniqueName = `${imageName}_${Date.now()}_${index}${ext}`;

            const newFullPath = path.join(finalPath, uniqueName);

            // 7. Dosyayı kaydet
            fs.writeFileSync(newFullPath, imageBuffer);

            const relativePath = path.relative(process.cwd(), newFullPath);

            success.push({
                originalName: `image_${index}${ext}`,
                newName: uniqueName,
                relativePath: relativePath.replace(/\\/g, '/'), // Windows compat
                fullPath: newFullPath,
                size: imageBuffer.length
            });

        } catch (error) {
            failed.push({
                originalName: `image_${index}`,
                error: error instanceof Error ? error.message : 'Base64 işleme hatası'
            });
        }
    });

    return { success, failed };
};


// Create directory structure
export const createDirectoryStructure = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Base64 string'inin geçerli bir resim formatı olup olmadığını kontrol et
export const isValidImageBase64 = (base64String: string): boolean => {
    // Base64 formatı kontrol et
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
    return base64Regex.test(base64String);
};

/**
 * Verilen path'teki resmi siler
 * @param imagePath - Silinecek resmin path'i
 * @returns Silme işleminin başarılı olup olmadığını döndürür
 */
export const deleteImage = (imagePath: string): boolean => {
    try {
        // Dosya var mı kontrol et
        if (!fs.existsSync(imagePath)) {
            console.error('Dosya bulunamadı:', imagePath);
            return false;
        }

        // Resmi sil
        fs.unlinkSync(imagePath);
        return true;

    } catch (error) {
        console.error('Resim silinirken hata:', error);
        return false;
    }
};

export const deleteDirectory = (dirPath: string): boolean => {
    try {
        // Klasör var mı kontrol et
        if (!fs.existsSync(dirPath)) {
            console.error('Klasör bulunamadı:', dirPath);
            return false;
        }

        // Klasörü ve içeriğini sil
        fs.rmdirSync(dirPath, { recursive: true });
        return true;

    } catch (error) {
        console.error('Klasör silinirken hata:', error);
        return false;
    }
};

export const changeDirectoryName = (oldPath: string, newPath: string): boolean => {
    try {
        // Eski klasör var mı kontrol et
        if (!fs.existsSync(oldPath)) {
            console.error('Eski klasör bulunamadı:', oldPath);
            return false;
        }

        // Yeni klasör zaten var mı kontrol et
        if (fs.existsSync(newPath)) {
            console.error('Yeni klasör zaten mevcut:', newPath);
            return false;
        }

        // Klasör adını değiştir
        fs.renameSync(oldPath, newPath);
        return true;

    } catch (error) {
        console.error('Klasör adı değiştirilirken hata:', error);
        return false;
    }
};

export const getFileNameEnglish = (name: string): string => {
    // Türkçe karakterleri İngilizce karşılıklarıyla değiştir
    let newName = name.toLowerCase();

    const charMap: { [key: string]: string } = {
        'ç': 'c',
        'ğ': 'g',
        'ı': 'i',
        'ş': 's',
        'ö': 'o',
        'ü': 'u',
    };

    newName = name.split('').map(char => charMap[char] || char).join('');
    newName = newName.replace(' ', '-');
    newName = newName.replace('(', '');
    newName = newName.replace(')', '');

    return newName;
};