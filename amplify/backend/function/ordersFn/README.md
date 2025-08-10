# Orders Service (ordersFn)

## Overview
Comprehensive order processing service handling order creation, payment integration, inventory management, and order lifecycle.

## Required Environment Variables

### Core Configuration
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token verification
- `LOG_LEVEL` - Logging level (default: info)

### Inter-Service Communication
- `PRODUCTS_SERVICE_URL` - URL for products service (inventory checks)
- `CART_SERVICE_URL` - URL for cart service (cart operations)
- `PAYMENT_RECORDS_SERVICE_URL` - URL for payment records service
- `WALLET_SERVICE_URL` - URL for wallet service (wallet payments)
- `REQUEST_TIMEOUT_MS` - HTTP client timeout (default: 8000)
- `RETRY_COUNT` - HTTP client retry count (default: 3)

### Security & CORS
- `ALLOWED_ORIGINS` - CORS allowed origins

## API Endpoints

### User Endpoints
- `POST /orders` - Create new order
- `GET /orders` - Get user's orders (paginated)
- `GET /orders/:id` - Get specific order details
- `PUT /orders/:id/cancel` - Cancel order (if cancellable)

### Admin Endpoints
- `GET /admin/orders` - Get all orders (paginated, filtered)
- `PUT /admin/orders/:id/status` - Update order status
- `GET /admin/orders/stats` - Order statistics and analytics

## Order Flow

1. **Order Creation**
   - Validate cart items via cartFn
   - Check product availability via productsFn
   - Calculate totals and apply offers
   - Reserve inventory
   - Create order record
   - Clear user cart

2. **Payment Processing**
   - Create payment record via paymentRecordsFn
   - Process wallet payments via walletFn
   - Handle payment confirmations

3. **Order Fulfillment**
   - Update order status (confirmed → processing → shipped → delivered)
   - Send notifications
   - Handle cancellations and refunds

## Dependencies

### Database Models
- Order model (direct MongoDB access)

### External Services
- **productsFn**: Product validation, inventory management
- **cartFn**: Cart operations and clearing
- **paymentRecordsFn**: Payment processing and tracking
- **walletFn**: Wallet balance operations

## Sample .env Configuration

```bash
# Core
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
JWT_SECRET=super-secret-key-here
LOG_LEVEL=info

# CORS
ALLOWED_ORIGINS=https://app.festeve.com,https://admin.festeve.com

# Inter-service communication
PRODUCTS_SERVICE_URL=https://api.festeve.com/products
CART_SERVICE_URL=https://api.festeve.com/cart
PAYMENT_RECORDS_SERVICE_URL=https://api.festeve.com/payment-records
WALLET_SERVICE_URL=https://api.festeve.com/wallet
REQUEST_TIMEOUT_MS=8000
RETRY_COUNT=3
```

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB running locally or Atlas connection
- All dependent services running or mocked

### Setup
```bash
cd amplify/backend/function/ordersFn/src
npm install
```

### Testing with Amplify Mock
```bash
# Create test event for order creation
cat > event.json << EOF
{
  "httpMethod": "POST",
  "path": "/orders",
  "body": "{\"cartId\":\"cart123\",\"paymentMethod\":\"wallet\",\"deliveryAddress\":{\"street\":\"123 Main St\",\"city\":\"Example City\"}}",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJ..."
  }
}
EOF

# Run local test
amplify mock function ordersFn --event event.json
```

### Build
```bash
npm run build
```

## Production Deployment

### Pre-deployment Checklist
- [ ] All required environment variables configured
- [ ] Service URLs point to production endpoints
- [ ] MongoDB connection tested
- [ ] Payment service integration verified
- [ ] Inventory management working with productsFn

### Deploy
```bash
amplify push
```

### Post-deployment Verification
- [ ] Order creation flow works end-to-end
- [ ] Inventory is properly reserved/released
- [ ] Payment processing integrates correctly
- [ ] Cart clearing works after order creation
- [ ] Order status updates work
- [ ] Admin endpoints require proper authorization

## Error Handling & Recovery

### Transactional Safety
- MongoDB transactions used for critical operations
- Inventory reservations are atomic
- Failed orders trigger cleanup procedures

### Service Failures
- Graceful degradation when services unavailable
- Retry logic for transient failures
- Compensation patterns for partial failures

### Common Error Scenarios
- Insufficient inventory → Order rejection with details
- Payment failures → Order cancellation and inventory release
- Service timeouts → Retry with exponential backoff

## Performance Considerations
- Order queries are indexed and paginated
- Product availability checks are batched
- MongoDB connection pooling configured
- HTTP client connection reuse enabled

## Security Notes
- User can only access their own orders
- Admin endpoints require admin role
- Order totals are recalculated server-side
- Payment amounts validated against cart totals
- Sensitive payment data handled via external service
