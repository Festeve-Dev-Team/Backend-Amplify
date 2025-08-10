import * as Joi from 'joi';

export const baseConfigValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('production'),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  ALLOWED_ORIGINS: Joi.string().default('*'),
  
  // Cross-service base URLs
  PRODUCTS_BASE_URL: Joi.string().optional(),
  EVENTS_BASE_URL: Joi.string().optional(),
  AUTH_BASE_URL: Joi.string().optional(),
  USERS_BASE_URL: Joi.string().optional(),
  
  // Optional third-party auth
  AUTH0_DOMAIN: Joi.string().optional(),
  AUTH0_CLIENT_ID: Joi.string().optional(),
  AUTH0_CLIENT_SECRET: Joi.string().optional(),
  
  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().optional(),
});


