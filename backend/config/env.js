/**
 * Centralized Environment Variable Management
 * Provides validation and default values for environment variables.
 */

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Email Config
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL,
  FROM_NAME: process.env.FROM_NAME,
  
  // Admin Config
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || 'info.rongrani@gmail.com',
  
  // External Services
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  STEADFAST_API_KEY: process.env.STEADFAST_API_KEY,
  STEADFAST_SECRET_KEY: process.env.STEADFAST_SECRET_KEY,
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
