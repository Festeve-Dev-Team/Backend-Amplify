import * as Joi from 'joi';

export const baseConfigValidationSchema = Joi.object({
  // Core environment
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('production'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  
  // Database
  MONGODB_URI: Joi.string().required(),
  DB_NAME: Joi.string().default('festeve'),
  
  // JWT & Authentication
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  
  // CORS & Security
  ALLOWED_ORIGINS: Joi.string().default('*'),
  
  // Cross-service communication URLs
  ADMIN_SETTINGS_SERVICE_URL: Joi.string().optional(),
  AUTH_SERVICE_URL: Joi.string().optional(),
  BANNERS_SERVICE_URL: Joi.string().optional(),
  BOOKINGS_SERVICE_URL: Joi.string().optional(),
  CART_SERVICE_URL: Joi.string().optional(),
  CATEGORIES_SERVICE_URL: Joi.string().optional(),
  DELIVERY_SERVICE_URL: Joi.string().optional(),
  EVENTS_SERVICE_URL: Joi.string().optional(),
  NEWSLETTER_SERVICE_URL: Joi.string().optional(),
  OFFERS_SERVICE_URL: Joi.string().optional(),
  ORDERS_SERVICE_URL: Joi.string().optional(),
  PAYMENT_RECORDS_SERVICE_URL: Joi.string().optional(),
  PRODUCTS_SERVICE_URL: Joi.string().optional(),
  PUROHITS_SERVICE_URL: Joi.string().optional(),
  REFERRAL_SERVICE_URL: Joi.string().optional(),
  TESTIMONIALS_SERVICE_URL: Joi.string().optional(),
  UPLOAD_SERVICE_URL: Joi.string().optional(),
  USERS_SERVICE_URL: Joi.string().optional(),
  VENDORS_SERVICE_URL: Joi.string().optional(),
  WALLET_SERVICE_URL: Joi.string().optional(),
  
  // HTTP Client Configuration
  REQUEST_TIMEOUT_MS: Joi.number().default(8000),
  RETRY_COUNT: Joi.number().default(3),
  
  // Third-party services
  AUTH0_DOMAIN: Joi.string().optional(),
  AUTH0_CLIENT_ID: Joi.string().optional(),
  AUTH0_CLIENT_SECRET: Joi.string().optional(),
  
  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().optional(),
  
  // AWS/Upload specific
  AWS_S3_BUCKET: Joi.string().optional(),
  AWS_REGION: Joi.string().optional(),
  
  // Notification services
  NOTIFY_PROVIDER: Joi.string().optional(),
  NOTIFY_API_KEY: Joi.string().optional(),
  NOTIFY_SENDER: Joi.string().optional(),
});
