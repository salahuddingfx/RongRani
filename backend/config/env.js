/**
 * Centralized Environment Variable Management
 * Provides validation and default values for environment variables.
 */
require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Email Config
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  SMTP_HOST: process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || process.env.BREVO_SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER || process.env.BREVO_SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS || process.env.BREVO_SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL || 'info.rongrani@gmail.com',
  FROM_NAME: process.env.FROM_NAME || 'RongRani',
  
  // Admin Config
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || 'info.rongrani@gmail.com',
  
  // External Services
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  STEADFAST_API_KEY: process.env.STEADFAST_API_KEY,
  STEADFAST_API_SECRET: process.env.STEADFAST_API_SECRET,
  
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
};

// Simple validation
const requiredEnvs = ['MONGO_URI'];
if (env.NODE_ENV === 'production') {
  requiredEnvs.push('JWT_SECRET', 'SMTP_PASS');
}

requiredEnvs.forEach((key) => {
  if (!env[key]) {
    console.warn(`⚠️ Warning: Environment variable ${key} is missing!`);
  }
});

module.exports = env;
