# POST-Only API Endpoint'leri Rehberi

Bu uygulamada tüm API istekleri POST metoduyla yapılır. Parametreler ve veriler request body içinde gönderilir.

## 🔐 Authentication Endpoints

### Kullanıcı Kaydı
```http
POST /api/auth/register
Content-Type: application/json

{
  "ad": "Ahmet",
  "soyad": "Yılmaz", 
  "email": "ahmet@example.com",
  "password": "123456789"
}
```

### Kullanıcı Girişi
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmet@example.com",
  "password": "123456789"
}
```

### Profil Bilgileri
```http
POST /api/auth/profile
Authorization: Bearer <token>
```

### Şifre Değiştirme
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "123456789",
  "newPassword": "newpassword123"
}
```

### Email Değiştirme
```http
POST /api/auth/change-email
Authorization: Bearer <token>
Content-Type: application/json

{
  "newEmail": "newemail@example.com",
  "password": "123456789"
}
```

## 📦 Product Endpoints

### Ürün Listesi
```http
POST /api/product/
Content-Type: application/json

{
  "categoryId": "65f1234567890abcdef12345" // Opsiyonel
}
```

### Ürün Detayı
```http
POST /api/product/detail
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345"
}
```

### Ürün Beğenme
```http
POST /api/product/like
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "65f1234567890abcdef12345"
}
```

### Ürün Favorilere Ekleme
```http
POST /api/product/favorite
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "65f1234567890abcdef12345"
}
```

### Ürün İndirme
```http
POST /api/product/download
Authorization: Bearer <token> // Opsiyonel
Content-Type: application/json

{
  "productId": "65f1234567890abcdef12345"
}
```

## 🏷️ Category Endpoints

### Kategori Listesi
```http
POST /api/category/
```

### Kategori Detayı
```http
POST /api/category/detail
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345"
}
```

## 📊 Visitor Endpoints

### Ziyaretçi Ekleme
```http
POST /api/visitors/
Content-Type: application/json

{
  "pageName": "home"
}
```

### Günlük İstatistikler
```http
POST /api/visitors/daily
Content-Type: application/json

{
  "startDate": "2023-12-01",
  "endDate": "2023-12-31"
}
```

### Sayfa İstatistikleri
```http
POST /api/visitors/pages
Content-Type: application/json

{
  "startDate": "2023-12-01",
  "endDate": "2023-12-31",
  "pageName": "home" // Opsiyonel
}
```

### Genel İstatistikler
```http
POST /api/visitors/stats
```

## 📢 Report Endpoints

### Report Ekleme (Herkese Açık)
```http
POST /api/report/
Authorization: Bearer <token> // Opsiyonel
Content-Type: application/json

{
  "message": "Bu ürünle ilgili bir problemim var...",
  "email": "user@example.com",
  "productId": "65f1234567890abcdef12345" // Opsiyonel
}
```

### Report Listesi (Admin)
```http
POST /api/report/list
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "page": 1,
  "limit": 10,
  "status": "unread", // "read" | "unread" - Opsiyonel
  "productId": "65f1234567890abcdef12345", // Opsiyonel
  "userId": "65f1234567890abcdef12345" // Opsiyonel
}
```

### Report Detayı (Admin)
```http
POST /api/report/detail
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345"
}
```

### Report Okundu İşaretleme (Admin)
```http
POST /api/report/mark-read
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345"
}
```

### Report Güncelleme (Admin)
```http
POST /api/report/update
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345",
  "markAsRead": true // veya false
}
```

### Report Silme (Admin)
```http
POST /api/report/delete
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345"
}
```

### Report İstatistikleri (Admin)
```http
POST /api/report/stats
Authorization: Bearer <admin-token>
```

## 👑 Admin Endpoints

### Admin - Visitor Günlük İstatistikler
```http
POST /api/admin/visitors/daily
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "startDate": "2023-12-01",
  "endDate": "2023-12-31"
}
```

### Admin - Visitor Sayfa İstatistikleri
```http
POST /api/admin/visitors/pages
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "startDate": "2023-12-01",
  "endDate": "2023-12-31",
  "pageName": "home"
}
```

### Admin - Visitor Genel İstatistikler
```http
POST /api/admin/visitors/stats
Authorization: Bearer <admin-token>
```

### Admin - Tüm Kullanıcılar
```http
POST /api/auth/get-all-admin
Authorization: Bearer <admin-token>
```

### Admin - Kullanıcı Detayı
```http
POST /api/auth/get-detail-admin
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345"
}
```

### Admin - Kullanıcı Ekleme
```http
POST /api/auth/add-admin
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "ad": "Yeni",
  "soyad": "Kullanıcı",
  "email": "yeni@example.com",
  "password": "123456789",
  "role": "admin" // veya "user"
}
```

### Admin - Kullanıcı Güncelleme
```http
POST /api/auth/update-admin
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345",
  "ad": "Güncellenmiş",
  "soyad": "Kullanıcı",
  "email": "updated@example.com",
  "role": "user"
}
```

### Admin - Kullanıcı Silme
```http
POST /api/auth/delete-admin
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345"
}
```

### Admin - Ürün Ekleme
```http
POST /api/product/add
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Yeni Ürün",
  "description": "Ürün açıklaması",
  "category": "65f1234567890abcdef12345"
}
```

### Admin - Ürün Güncelleme
```http
POST /api/product/update
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345",
  "name": "Güncellenmiş Ürün",
  "description": "Yeni açıklama"
}
```

### Admin - Ürün Silme
```http
POST /api/product/delete
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345"
}
```

### Admin - Kategori Ekleme
```http
POST /api/category/add
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Yeni Kategori",
  "description": "Kategori açıklaması"
}
```

### Admin - Kategori Güncelleme
```http
POST /api/category/update
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345",
  "name": "Güncellenmiş Kategori"
}
```

### Admin - Kategori Silme
```http
POST /api/category/delete
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "65f1234567890abcdef12345"
}
```

## 🛡️ Güvenlik ve Yetki Seviyeleri

- **🟢 Herkese Açık**: Authentication gerektirmez
- **🟡 Kullanıcı**: Bearer token gerekli
- **🔴 Admin**: Bearer token + admin yetkisi gerekli
- **🟣 Opsiyonel Auth**: Token varsa kullanıcı bilgisi eklenir

## 💡 Önemli Notlar

1. **Sadece POST**: Tüm endpoint'ler POST metodu kullanır
2. **Body Parametreleri**: Tüm parametreler request body'de gönderilir
3. **Content-Type**: application/json header'ı gereklidir
4. **Authentication**: Bearer token header ile gönderilir
5. **ID Parametreleri**: URL params yerine body'de "id" field'ı kullanılır

## 🧪 Test Örnekleri

```bash
# Visitor ekleme
curl -X POST http://localhost:5225/api/visitors \
  -H "Content-Type: application/json" \
  -d '{"pageName": "home"}'

# Report gönderme
curl -X POST http://localhost:5225/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bu ürünle ilgili bir problem var",
    "email": "test@example.com"
  }'

# Admin - Report listesi
curl -X POST http://localhost:5225/api/report/list \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"page": 1, "limit": 10, "status": "unread"}'
```

POST-only API sistemi artık tamamen aktif! 🚀