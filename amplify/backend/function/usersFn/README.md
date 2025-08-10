# Users Service (usersFn)

## Overview
Authoritative user management service handling user profiles, preferences, wallet balances, and referral tracking. This is the primary service for all user-related data operations.

## Required Environment Variables

### Core Configuration
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token verification
- `LOG_LEVEL` - Logging level (default: info)
- `DB_NAME` - Database name (default: festeve)

### Security & CORS
- `ALLOWED_ORIGINS` - CORS allowed origins

## API Endpoints

### Public Endpoints (for inter-service communication)
- `POST /users/query` - Find users by query (for other services)
- `POST /users` - Create new user (for authFn)

### User Endpoints
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `GET /users/preferences` - Get user preferences
- `PUT /users/preferences` - Update user preferences
- `GET /users/addresses` - Get user addresses
- `POST /users/addresses` - Add new address
- `PUT /users/addresses/:id` - Update address
- `DELETE /users/addresses/:id` - Delete address

### Admin Endpoints
- `GET /admin/users` - Get all users (paginated, filtered)
- `GET /admin/users/:id` - Get specific user details
- `PUT /admin/users/:id/status` - Update user status (active/inactive/banned)
- `GET /admin/users/stats` - User statistics and analytics

### Inter-Service Endpoints
- `GET /users/:id` - Get user by ID (for other services)
- `PATCH /users/:id` - Update user data (for other services)
- `PATCH /users/:id/wallet` - Update wallet balances (for walletFn)
- `PATCH /users/:id/referral-stats` - Update referral statistics (for referralFn)

## User Data Model

### Core User Fields
- Personal information (name, email, phone)
- Authentication data (password hash, verification status)
- Profile data (avatar, preferences, settings)
- Address book (multiple delivery addresses)
- Wallet balances (reward wallet, coin wallet)
- Referral data (referral code, referral stats)
- Metadata (creation date, last login, status)

## Database Models

### Direct MongoDB Access
- User model with comprehensive schema
- Address subdocuments
- Preference configurations
- Wallet balance tracking

## Sample .env Configuration

```bash
# Core
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=festeve
JWT_SECRET=super-secret-key-here
LOG_LEVEL=info

# CORS
ALLOWED_ORIGINS=https://app.festeve.com,https://admin.festeve.com

# HTTP Configuration
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
cd amplify/backend/function/usersFn/src
npm install
```

### Testing with Amplify Mock
```bash
# Create test event for user profile
cat > event.json << EOF
{
  "httpMethod": "GET",
  "path": "/users/profile",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJ..."
  }
}
EOF

# Run local test
amplify mock function usersFn --event event.json
```

### Build
```bash
npm run build
```

## Production Deployment

### Pre-deployment Checklist
- [ ] MongoDB URI configured and tested
- [ ] JWT secret matches other services
- [ ] Database indexes created for user queries
- [ ] CORS origins properly configured
- [ ] User model validation rules tested

### Deploy
```bash
amplify push
```

### Post-deployment Verification
- [ ] User profile endpoints work correctly
- [ ] Inter-service communication endpoints respond
- [ ] Admin endpoints require proper authorization
- [ ] Database queries are performant
- [ ] User data privacy is maintained

## Service Architecture

### Authoritative Data Source
This service is the authoritative source for:
- User profiles and personal information
- User preferences and settings
- User addresses and delivery information
- Wallet balances and transaction history
- Referral codes and referral statistics

### Inter-Service Communication
Other services communicate with usersFn for:
- **authFn**: User creation, authentication data
- **walletFn**: Wallet balance updates
- **referralFn**: Referral statistic updates
- **ordersFn**: User information for orders

## Performance Considerations

### Database Optimization
- Indexed fields: email, referralCode, userId
- Compound indexes for common query patterns
- Connection pooling for high concurrency
- Query result caching for frequently accessed data

### API Performance
- Pagination for large result sets
- Field selection to minimize data transfer
- Response compression enabled
- Connection keep-alive for inter-service calls

## Security Notes

### Data Protection
- Personal data access requires authentication
- User can only access their own data
- Admin access requires admin role verification
- Sensitive fields excluded from public responses

### Inter-Service Security
- Service-to-service authentication via JWT
- Rate limiting on public endpoints
- Input validation on all endpoints
- SQL injection protection via Mongoose

### Privacy Compliance
- User data minimization principles
- Secure password storage (bcrypt)
- Option to delete user accounts
- Data export capabilities for user requests

## Monitoring & Logging
- Structured logging with correlation IDs
- Performance metrics collection
- Error rate monitoring
- Database connection health checks
- User activity audit trails
