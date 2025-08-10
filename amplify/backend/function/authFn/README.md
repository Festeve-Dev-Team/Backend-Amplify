# Authentication Service (authFn)

## Overview
Core authentication service handling user registration, login, JWT token management, and referral processing.

## Required Environment Variables

### Core Configuration
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - JWT token expiration time (default: 24h)
- `LOG_LEVEL` - Logging level (default: info)

### Inter-Service Communication
- `USERS_SERVICE_URL` - URL for users service communication
- `REFERRAL_SERVICE_URL` - URL for referral service communication
- `REQUEST_TIMEOUT_MS` - HTTP client timeout (default: 8000)
- `RETRY_COUNT` - HTTP client retry count (default: 3)

### Security & CORS
- `ALLOWED_ORIGINS` - CORS allowed origins (default: *)

## API Endpoints

### Public Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation

### Protected Endpoints
- `GET /auth/profile` - Get current user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/change-password` - Change password

## Dependencies

### Database Models
- Uses User model via HTTP client (usersFn service)

### External Services
- **usersFn**: User CRUD operations
- **referralFn**: Referral processing during registration

## Sample .env Configuration

```bash
# Core
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
JWT_SECRET=super-secret-key-here
JWT_EXPIRES_IN=24h
LOG_LEVEL=info

# CORS
ALLOWED_ORIGINS=https://app.festeve.com,https://admin.festeve.com

# Inter-service communication
USERS_SERVICE_URL=https://api.festeve.com/users
REFERRAL_SERVICE_URL=https://api.festeve.com/referral
REQUEST_TIMEOUT_MS=8000
RETRY_COUNT=3
```

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB running locally or Atlas connection
- Environment variables configured

### Setup
```bash
cd amplify/backend/function/authFn/src
npm install
```

### Testing with Amplify Mock
```bash
# Create test event
cat > event.json << EOF
{
  "httpMethod": "POST",
  "path": "/auth/login",
  "body": "{\"email\":\"test@example.com\",\"password\":\"password123\"}",
  "headers": {
    "Content-Type": "application/json"
  }
}
EOF

# Run local test
amplify mock function authFn --event event.json
```

### Build
```bash
npm run build
```

## Production Deployment

### Pre-deployment Checklist
- [ ] All required environment variables configured
- [ ] JWT_SECRET is secure (32+ characters)
- [ ] MONGODB_URI points to production database
- [ ] CORS origins are properly configured
- [ ] Service URLs point to production endpoints

### Deploy
```bash
amplify push
```

### Post-deployment Verification
- [ ] Authentication endpoints respond correctly
- [ ] JWT tokens are generated and validated
- [ ] User registration creates records in usersFn
- [ ] Referral processing works with referralFn
- [ ] CORS headers are present and correct

## Error Handling
- Network timeouts are retried up to RETRY_COUNT times
- Service unavailability gracefully handled
- Invalid credentials return appropriate HTTP status codes
- All errors are logged with correlation IDs

## Security Notes
- JWT tokens include user ID and role claims
- Passwords are hashed using bcrypt
- Rate limiting applied via ThrottlerGuard
- Input validation via class-validator DTOs
- Authorization via JWT + Role guards
