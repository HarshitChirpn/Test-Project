# Backend API Setup Guide

## Overview
This guide covers the complete backend API setup for the idea2mvp application, including MongoDB integration, JWT authentication, and all necessary routes.

## Architecture

### Backend Structure
```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication (login, register, profile)
│   ├── userController.js    # User management
│   ├── blogController.js    # Blog management
│   ├── portfolioController.js # Portfolio management
│   ├── serviceController.js # Service management
│   ├── purchaseController.js # Purchase management
│   ├── onboardingController.js # User onboarding
│   ├── progressController.js # User progress tracking
│   └── contactController.js # Contact submissions
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── validation.js       # Request validation schemas
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── users.js            # User management routes
│   ├── blogs.js            # Blog routes
│   ├── portfolio.js        # Portfolio routes
│   ├── services.js         # Service routes
│   ├── purchases.js        # Purchase routes
│   ├── onboarding.js       # Onboarding routes
│   ├── progress.js         # Progress tracking routes
│   └── contact.js          # Contact routes
├── .env                    # Environment variables
├── package.json            # Dependencies
└── server.js              # Main server file
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://mvp:mvp@idea2mvp.htev3lk.mongodb.net/?retryWrites=true&w=majority&appName=idea2mvp
MONGODB_DATABASE=idea2mvp

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:8081

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 3. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `PUT /change-password` - Change password (protected)

### Users (`/api/users`) - Admin Only
- `GET /` - Get all users (with pagination)
- `GET /stats` - Get user statistics
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (soft delete)

### Blogs (`/api/blogs`)
- `GET /` - Get all blogs (public)
- `GET /:id` - Get blog by ID (public)
- `POST /` - Create blog (admin only)
- `PUT /:id` - Update blog (admin only)
- `DELETE /:id` - Delete blog (admin only)
- `PUT /:id/view` - Increment view count (public)

### Portfolio (`/api/portfolio`)
- `GET /` - Get all portfolio items (public)
- `GET /:id` - Get portfolio by ID (public)
- `GET /slug/:slug` - Get portfolio by slug (public)
- `POST /` - Create portfolio item (admin only)
- `PUT /:id` - Update portfolio item (admin only)
- `DELETE /:id` - Delete portfolio item (admin only)

### Services (`/api/services`)
- `GET /` - Get all services (public)
- `GET /:id` - Get service by ID (public)
- `POST /` - Create service (admin only)
- `PUT /:id` - Update service (admin only)
- `DELETE /:id` - Delete service (admin only)

### Purchases (`/api/purchases`) - Protected
- `GET /` - Get all purchases (admin only)
- `GET /:id` - Get purchase by ID (admin only)
- `GET /user/:userId` - Get user purchases
- `POST /` - Create purchase (admin only)
- `PUT /:id` - Update purchase (admin only)
- `DELETE /:id` - Delete purchase (admin only)

### Onboarding (`/api/onboarding`) - Protected
- `GET /` - Get all onboarding data (admin only)
- `GET /:userId` - Get user onboarding data
- `POST /` - Create onboarding data
- `PUT /:userId` - Update onboarding data
- `DELETE /:userId` - Delete onboarding data

### Progress (`/api/progress`) - Protected
- `GET /` - Get all user progress (admin only)
- `GET /:userId` - Get user progress
- `POST /` - Create user progress
- `PUT /:userId` - Update user progress
- `PUT /:userId/phase-substep` - Update current phase/substep
- `PUT /:userId/milestone` - Update milestone
- `DELETE /:userId` - Delete user progress

### Contact (`/api/contact`)
- `POST /submissions` - Create contact submission (public)
- `GET /submissions` - Get all submissions (admin only)
- `GET /submissions/stats` - Get contact stats (admin only)
- `GET /submissions/:id` - Get submission by ID (admin only)
- `PUT /submissions/:id` - Update submission (admin only)
- `DELETE /submissions/:id` - Delete submission (admin only)

## Authentication

### JWT Token Structure
```json
{
  "userId": "user_id",
  "email": "user@example.com",
  "role": "user|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Protected Routes
All protected routes require the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### Admin Routes
Admin-only routes require the user to have `role: "admin"` in their JWT token.

## Database Collections

### Users
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  role: "user" | "admin",
  isActive: Boolean,
  emailVerified: Boolean,
  hasCompletedOnboarding: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### User Onboarding
```javascript
{
  _id: ObjectId,
  userId: String,
  userType: String,
  projectName: String,
  projectDescription: String,
  industry: String,
  timeline: String,
  budget: Number,
  services: [String],
  primaryGoal: String,
  contactPreference: String,
  isComplete: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### User Progress
```javascript
{
  _id: ObjectId,
  userId: String,
  overall: Number,
  phases: {
    discovery: Number,
    design: Number,
    development: Number,
    testing: Number,
    launch: Number,
    support: Number
  },
  milestonesCompleted: Number,
  totalMilestones: Number,
  currentStatus: {
    currentPhase: String,
    currentSubstep: String,
    phaseProgress: Number,
    substepProgress: Number,
    updatedAt: Date,
    updatedBy: String,
    notes: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

### 1. JWT Authentication
- Secure token-based authentication
- Configurable expiration time
- Role-based access control

### 2. Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable limits

### 3. CORS Protection
- Configurable allowed origins
- Credentials support

### 4. Input Validation
- Joi schema validation
- Sanitized inputs
- Error handling

### 5. Security Headers
- Helmet.js for security headers
- Content Security Policy
- XSS protection

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Frontend Integration

### Environment Variables
Create `.env` file in the frontend root:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_MONGODB_DATABASE=idea2mvp
```

### API Client
The frontend uses a centralized API client (`src/lib/api.ts`) that:
- Automatically includes JWT tokens
- Handles error responses
- Provides typed responses

## Deployment

### Production Environment
1. Update environment variables
2. Set `NODE_ENV=production`
3. Use a strong JWT secret
4. Configure proper CORS origins
5. Set up SSL/TLS
6. Use a process manager (PM2)

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_very_strong_secret_key
CORS_ORIGIN=https://yourdomain.com
```

## Monitoring & Logging

### Logs
- Morgan for HTTP request logging
- Console logging for errors
- Structured logging format

### Health Monitoring
- Health check endpoint at `/health`
- Database connection monitoring
- Error tracking

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check connection string
   - Verify network access
   - Check credentials

2. **JWT Token Invalid**
   - Check token expiration
   - Verify JWT secret
   - Check token format

3. **CORS Errors**
   - Verify allowed origins
   - Check credentials setting
   - Test with different browsers

4. **Rate Limiting**
   - Check rate limit configuration
   - Monitor request frequency
   - Adjust limits if needed

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and stack traces.

## Next Steps

1. **Add File Upload Support**
   - Implement multer for file handling
   - Add image processing
   - Set up cloud storage

2. **Add Email Service**
   - Contact form notifications
   - User registration emails
   - Password reset functionality

3. **Add Caching**
   - Redis for session storage
   - API response caching
   - Database query optimization

4. **Add Monitoring**
   - Application performance monitoring
   - Error tracking (Sentry)
   - Uptime monitoring

5. **Add Testing**
   - Unit tests for controllers
   - Integration tests for API
   - End-to-end testing

This backend API provides a solid foundation for the idea2mvp application with MongoDB integration, JWT authentication, and comprehensive CRUD operations for all data models.