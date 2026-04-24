const helmet = require('helmet');
const cors = require('cors');
const env = require('../config/env');

/**
 * Security Middleware Configuration
 */
const securityMiddleware = (app) => {
  // 1. Basic Security Headers
  app.use(helmet());

  // 2. CORS Configuration
  const allowedOrigins = [
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://rongrani.vercel.app',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some(ao => origin.startsWith(ao));
        const isVercel = origin.includes('vercel.app') && origin.includes('rongrani');

        if (isAllowed || isVercel) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Preflight support
  app.options('*', cors());
};

module.exports = securityMiddleware;
