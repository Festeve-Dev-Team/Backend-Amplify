"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseConfigValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.baseConfigValidationSchema = Joi.object({
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
