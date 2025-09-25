# Report Sistemi Kullanım Kılavuzu

Report sistemi, kullanıcıların ürün şikayetleri veya genel geri bildirimlerini iletmelerini sağlar. Sistem hem misafir kullanıcılar hem de üye kullanıcılar için çalışır.

## API Endpoint'leri

### 1. Report Ekleme (Herkese Açık)
```http
POST /api/report
Content-Type: application/json
Authorization: Bearer <token> (Opsiyonel)

{
  "message": "Bu ürünle ilgili bir problemim var...",
  "email": "user@example.com",
  "productId": "65f1234567890abcdef12345" // Opsiyonel
}
```

**Özellikler:**
- Token ile gönderilirse kullanıcı bilgisi otomatik eklenir
- Token olmadan da gönderilebilir (misafir kullanıcı)
- productId opsiyoneldir - genel şikayetler için boş bırakılabilir
- Email adresi zorunludur

### 2. Tüm Reportları Listele (Admin)
```http
GET /api/report?page=1&limit=10&status=unread&productId=xxx&userId=xxx
Authorization: Bearer <admin-token>
```

**Query Parametreleri:**
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına kayıt (varsayılan: 10)
- `status`: "read" | "unread" - Okunma durumuna göre filtrele
- `productId`: Belirli ürün için reportları filtrele
- `userId`: Belirli kullanıcı için reportları filtrele

### 3. Tek Report Detayı (Admin)
```http
GET /api/report/:id
Authorization: Bearer <admin-token>
```

### 4. Report'u Okundu Olarak İşaretle (Admin)
```http
PATCH /api/report/:id/read
Authorization: Bearer <admin-token>
```

### 5. Report Güncelleme (Admin)
```http
PUT /api/report/:id
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "markAsRead": true  // veya false
}
```

### 6. Report Silme (Admin)
```http
DELETE /api/report/:id
Authorization: Bearer <admin-token>
```

### 7. Report İstatistikleri (Admin)
```http
GET /api/report/stats
Authorization: Bearer <admin-token>
```

## Dönen Veri Örnekleri

### Report Ekleme Başarılı Yanıt:
```json
{
  "success": true,
  "message": "Rapor başarıyla oluşturuldu",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "message": "Bu ürünle ilgili bir problemim var...",
    "email": "user@example.com",
    "productId": {
      "_id": "65f1234567890abcdef12346",
      "name": "Test Ürün",
      "description": "Test açıklama"
    },
    "userId": {
      "_id": "65f1234567890abcdef12347",
      "ad": "Ahmet",
      "soyad": "Yılmaz",
      "email": "ahmet@example.com"
    },
    "readedAt": null,
    "createdAt": "2023-12-15T10:30:00.000Z"
  }
}
```

### Report Listesi Yanıtı:
```json
{
  "success": true,
  "message": "Raporlar başarıyla getirildi",
  "data": {
    "reports": [
      {
        "_id": "65f1234567890abcdef12345",
        "message": "Bu ürünle ilgili bir problemim var...",
        "email": "user@example.com",
        "productId": {
          "_id": "65f1234567890abcdef12346",
          "name": "Test Ürün",
          "description": "Test açıklama",
          "category": "Elektronik"
        },
        "userId": {
          "_id": "65f1234567890abcdef12347",
          "ad": "Ahmet",
          "soyad": "Yılmaz",
          "email": "ahmet@example.com"
        },
        "readedAt": "2023-12-15T11:30:00.000Z",
        "createdAt": "2023-12-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 47
    }
  }
}
```

### Report İstatistikleri Yanıtı:
```json
{
  "success": true,
  "message": "Rapor istatistikleri başarıyla getirildi",
  "data": {
    "total": 150,
    "read": 98,
    "unread": 52,
    "recent": 23,
    "monthly": 67,
    "readPercentage": 65,
    "topReportedProducts": [
      {
        "_id": "65f1234567890abcdef12345",
        "productName": "Problemli Ürün 1",
        "count": 15
      },
      {
        "_id": "65f1234567890abcdef12346",
        "productName": "Problemli Ürün 2",
        "count": 12
      }
    ]
  }
}
```

## Frontend Entegrasyon Örnekleri

### React.js ile Report Gönderme:
```javascript
const sendReport = async (reportData) => {
  try {
    const response = await fetch('/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Token varsa ekle
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        message: reportData.message,
        email: reportData.email,
        productId: reportData.productId || null
      })
    });

    const data = await response.json();
    
    if (data.success) {
      alert('Raporunuz başarıyla gönderildi!');
    } else {
      alert('Hata: ' + data.message);
    }
  } catch (error) {
    console.error('Report gönderme hatası:', error);
    alert('Bir hata oluştu, lütfen tekrar deneyin.');
  }
};
```

### Admin Panel - Report Listesi:
```javascript
const fetchReports = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.productId) queryParams.append('productId', filters.productId);
    
    const response = await fetch(`/api/report?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      setReports(data.data.reports);
      setPagination(data.data.pagination);
    }
  } catch (error) {
    console.error('Reports getirme hatası:', error);
  }
};

// Kullanım
fetchReports({ page: 1, status: 'unread' });
```

### Report'u Okundu Olarak İşaretleme:
```javascript
const markReportAsRead = async (reportId) => {
  try {
    const response = await fetch(`/api/report/${reportId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      // Listeyi güncelle
      fetchReports();
    }
  } catch (error) {
    console.error('Report işaretleme hatası:', error);
  }
};
```

## Veritabanı Yapısı

```javascript
{
  productId: String,     // Ürün ID (opsiyonel, null olabilir)
  userId: String,        // Kullanıcı ID (opsiyonel, null olabilir)
  message: String,       // Rapor mesajı (10-1000 karakter, zorunlu)
  email: String,         // E-posta adresi (zorunlu, validate edilir)
  readedAt: Date,        // Okunma tarihi (null = okunmamış)
  createdAt: Date        // Oluşturulma tarihi (otomatik)
}

// Indexes:
// - { productId: 1 }
// - { userId: 1 }  
// - { email: 1 }
// - { createdAt: -1 }
// - { readedAt: 1 }
// - { productId: 1, createdAt: -1 }
// - { userId: 1, createdAt: -1 }
// - { email: 1, createdAt: -1 }
```

## Validation Kuralları

- **message**: 10-1000 karakter arası, zorunlu
- **email**: Geçerli e-posta formatı, zorunlu
- **productId**: MongoDB ObjectId formatı (opsiyonel)
- **userId**: Otomatik set edilir (token varsa)

## Test Örnekleri

```bash
# Misafir kullanıcı report gönderme
curl -X POST http://localhost:5225/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bu ürünle ilgili bir problemim var, kalitesi çok kötü.",
    "email": "misafir@example.com",
    "productId": "65f1234567890abcdef12345"
  }'

# Üye kullanıcı report gönderme
curl -X POST http://localhost:5225/api/report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "message": "Genel bir şikayetim var, müşteri hizmetleriniz çok yavaş.",
    "email": "user@example.com"
  }'

# Admin - tüm reportları listele
curl -X GET "http://localhost:5225/api/report?page=1&status=unread" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Admin - report'u okundu işaretle  
curl -X PATCH http://localhost:5225/api/report/REPORT_ID/read \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Admin - report istatistikleri
curl -X GET http://localhost:5225/api/report/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Güvenlik ve İzinler

- **addReport**: Herkese açık (token opsiyonel)
- **getReports**: Sadece admin
- **getReport**: Sadece admin  
- **markAsRead**: Sadece admin
- **updateReport**: Sadece admin
- **deleteReport**: Sadece admin
- **getReportStats**: Sadece admin

Report sistemi artık tamamen hazır ve kullanıma hazır! 🚀