# Okulix Backend API

Modern e-commerce backend API built with Express.js, TypeScript, and MongoDB.

## Features

- 🔐 JWT Authentication & Authorization
- 📦 Product Management with Image Upload
- 🏷️ Category Management
- 👥 User Management
- 🛡️ Security Middleware (Helmet, CORS, Rate Limiting)
- 📊 Performance Optimizations (Compression, Caching)
- ✅ Input Validation
- 🚨 Error Handling
- 📝 TypeScript Support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Performance**: Compression, Morgan Logging

## Project Structure

```
src/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── server.ts        # Main server file
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Then update the values in `.env` file according to your environment:
   ```env
   # Environment
   NODE_ENV=development
   
   # Server Configuration
   PORT=3000
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/okulix_db
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE_SECONDS=31536000
   
   # CORS Configuration
   CORS_ORIGIN_PRODUCTION=https://yourdomain.com
   CORS_ORIGIN_DEV_1=http://localhost:3000
   CORS_ORIGIN_DEV_2=http://localhost:3001
   
   # File Upload Configuration
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE_MB=5
   REQUEST_BODY_LIMIT=10mb
   
   # Rate Limiting Configuration
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   AUTH_RATE_LIMIT_MAX_REQUESTS=5
   
   # Security Configuration
   HELMET_CSP_DEFAULT_SRC=self
   HELMET_CSP_STYLE_SRC=self unsafe-inline
   HELMET_CSP_SCRIPT_SRC=self
   HELMET_CSP_IMG_SRC=self data: https:
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (Protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Protected)
- `PUT /api/products/:id` - Update product (Protected)
- `DELETE /api/products/:id` - Delete product (Protected)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Protected)
- `PUT /api/categories/:id` - Update category (Protected)
- `DELETE /api/categories/:id` - Delete category (Protected)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile

## Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## File Upload

- Product images: Multiple files (max 5)
- Category images: Single file
- Supported formats: JPEG, PNG, GIF, WebP
- Max file size: 5MB

## Environment Variables

### Core Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3000 |

### Database Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/okulix_db |

### JWT Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE_SECONDS | JWT expiration time in seconds | 31536000 |

### CORS Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| CORS_ORIGIN_PRODUCTION | Production CORS origin | https://yourdomain.com |
| CORS_ORIGIN_DEV_1 | Development CORS origin 1 | http://localhost:3000 |
| CORS_ORIGIN_DEV_2 | Development CORS origin 2 | http://localhost:3001 |

### File Upload Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| UPLOAD_PATH | File upload directory | ./uploads |
| MAX_FILE_SIZE_MB | Max file size in MB | 5 |
| REQUEST_BODY_LIMIT | Request body size limit | 10mb |

### Rate Limiting Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| RATE_LIMIT_WINDOW_MS | Rate limit window in milliseconds | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |
| AUTH_RATE_LIMIT_MAX_REQUESTS | Max auth requests per window | 5 |

### Security Configuration (Helmet CSP)
| Variable | Description | Default |
|----------|-------------|---------|
| HELMET_CSP_DEFAULT_SRC | Default CSP source | self |
| HELMET_CSP_STYLE_SRC | Style CSP sources | self unsafe-inline |
| HELMET_CSP_SCRIPT_SRC | Script CSP source | self |
| HELMET_CSP_IMG_SRC | Image CSP sources | self data: https: |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation
- Password hashing with bcrypt
- JWT token authentication
- File upload restrictions

## Performance Features

- Response compression
- Request logging
- Cache control headers
- Database indexing
- Error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
