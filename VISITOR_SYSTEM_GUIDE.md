# Visitor Sistemi Kullanım Kılavuzu

Visitor sistemi, web sitenizdeki sayfa ziyaretlerini gün ve sayfa bazında takip etmenizi sağlar. Her sayfa için otomatik olarak günlük ziyaret sayılarını tutar.

## API Endpoint'leri

### 1. Ziyaretçi Ekleme
```http
POST /api/visitors
Content-Type: application/json

{
  "pageName": "home"
}
```

**Kullanım:** Her sayfa yüklendiğinde bu endpoint'i çağırın.

**Özellikler:**
- Aynı gün için aynı sayfa adıyla tekrar çağrılırsa ziyaretçi sayısını artırır
- Yeni gün olursa yeni kayıt oluşturur
- Race condition'lara karşı korumalıdır

### 2. Günlük İstatistikler
```http
GET /api/visitors/daily?startDate=2023-01-01&endDate=2023-12-31
```

**Dönen veri örneği:**
```json
{
  "success": true,
  "message": "Günlük ziyaretçi istatistikleri başarıyla getirildi",
  "data": {
    "dailyStats": [
      {
        "date": "2023-12-15T00:00:00.000Z",
        "totalVisitors": 145,
        "pageCount": 8,
        "pages": [
          {
            "pageName": "home",
            "visitors": 87
          },
          {
            "pageName": "products",
            "visitors": 32
          },
          {
            "pageName": "about",
            "visitors": 26
          }
        ]
      }
    ],
    "totalDays": 30
  }
}
```

### 3. Sayfa Bazında İstatistikler
```http
GET /api/visitors/pages?pageName=home&startDate=2023-01-01&endDate=2023-12-31
```

**Dönen veri örneği:**
```json
{
  "success": true,
  "message": "Sayfa bazında ziyaretçi istatistikleri başarıyla getirildi",
  "data": {
    "pageStats": [
      {
        "pageName": "home",
        "totalVisitors": 2543,
        "visitDays": 30,
        "averageVisitorsPerDay": 84.77,
        "dailyBreakdown": [
          {
            "date": "2023-12-15T00:00:00.000Z",
            "visitors": 87,
            "createdAt": "2023-12-15T09:30:21.000Z"
          }
        ]
      }
    ],
    "totalPages": 8
  }
}
```

### 4. Genel İstatistikler
```http
GET /api/visitors/stats
```

**Dönen veri örneği:**
```json
{
  "success": true,
  "message": "Genel ziyaretçi istatistikleri başarıyla getirildi",
  "data": {
    "totalVisitors": 15432,
    "totalUniquePages": 12,
    "totalActiveDays": 45,
    "averageVisitorsPerDay": 342.93,
    "mostVisitedPage": {
      "_id": "home",
      "totalVisitors": 5432
    }
  }
}
```

## Frontend Entegrasyon Örnekleri

### React.js ile kullanım:
```javascript
// Her sayfa yüklendiğinde çağır
useEffect(() => {
  const trackVisitor = async () => {
    try {
      await fetch('/api/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageName: 'home' // Sayfa adını dinamik olarak değiştir
        })
      });
    } catch (error) {
      console.error('Ziyaretçi kaydedilemedi:', error);
    }
  };
  
  trackVisitor();
}, []);
```

### Vanilla JavaScript ile kullanım:
```javascript
// Sayfa yüklendiğinde otomatik çağır
window.addEventListener('load', async () => {
  try {
    const response = await fetch('/api/visitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageName: window.location.pathname.slice(1) || 'home'
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Ziyaret kaydedildi:', data.data);
    }
  } catch (error) {
    console.error('Ziyaretçi kaydedilemedi:', error);
  }
});
```

### Next.js ile kullanım:
```javascript
// pages/_app.js
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const trackVisitor = async (pageName) => {
      try {
        await fetch('/api/visitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageName: pageName || 'home'
          })
        });
      } catch (error) {
        console.error('Ziyaretçi kaydedilemedi:', error);
      }
    };

    // İlk yükleme
    trackVisitor(router.pathname.slice(1));

    // Route değişimlerini dinle
    const handleRouteChange = (url) => {
      trackVisitor(url.slice(1));
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return <Component {...pageProps} />;
}
```

## Veritabanı Yapısı

```javascript
{
  date: Date,        // Tarih (sadece gün, saat sıfırlanmış)
  pageName: String,  // Sayfa adı (home, products, about, vb.)
  visitors: Number,  // O gün o sayfayı ziyaret eden sayısı
  createdAt: Date,   // Kayıt oluşturulma zamanı
  updatedAt: Date    // Son güncellenme zamanı
}

// Compound Index: { date: 1, pageName: 1 } - Unique
```

## Öneriler

1. **Sayfa adları tutarlı olsun:** "home", "products", "about" gibi kısa ve anlamlı isimler kullanın.

2. **Hata yönetimi:** Frontend'de hata durumlarını handle edin, ziyaretçi takibi başarısız olsa bile sayfa çalışmaya devam etsin.

3. **Rate limiting:** Aynı kullanıcının çok hızlı istekte bulunmasını önlemek için frontend'de debounce kullanabilirsiniz.

4. **Raporlama:** İstatistik endpoint'lerini kullanarak admin panelinde raporlar oluşturabilirsiniz.

## Test Örnekleri

```bash
# Ziyaretçi ekleme testi
curl -X POST http://localhost:5000/api/visitors \
  -H "Content-Type: application/json" \
  -d '{"pageName": "home"}'

# Günlük istatistikler
curl -X GET "http://localhost:5000/api/visitors/daily?startDate=2023-12-01&endDate=2023-12-31"

# Sayfa istatistikleri  
curl -X GET "http://localhost:5000/api/visitors/pages?pageName=home"

# Genel istatistikler
curl -X GET http://localhost:5000/api/visitors/stats
```