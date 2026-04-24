const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const securityMiddleware = require('./middlewares/security.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');

const app = express();

// Trust proxy for Render/Vercel
app.set('trust proxy', 1);

/* -------------------- SECURITY & CORS -------------------- */
securityMiddleware(app);
app.use(mongoSanitize()); // Prevent NoSQL injection

/* -------------------- RATE LIMITING -------------------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

/* -------------------- CORE MIDDLEWARE -------------------- */
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* -------------------- ROUTES -------------------- */
app.get('/', (_req, res) => {
  res.json({ 
    message: 'RongRani Premium Backend API',
    version: '2.0.0',
    status: 'healthy'
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Load all routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/newsletter', require('./routes/newsletter.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/promotions', require('./routes/promotion.routes'));
app.use('/api/coupons', require('./routes/coupon.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/flash-sales', require('./routes/flashSale.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/images', require('./routes/image.routes'));
app.use('/api/keepalive', require('./routes/keepalive.routes'));
app.use('/share', require('./routes/share.routes'));
app.use('/', require('./routes/sitemap.routes'));

/* -------------------- PLACEHOLDER IMAGE -------------------- */
app.get('/api/placeholder/:width/:height', async (req, res, next) => {
  try {
    const { width, height } = req.params;
    const sharp = require('sharp');

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1e293b"/>
        <text x="50%" y="50%" font-size="16" fill="#94a3b8"
          font-family="Arial" text-anchor="middle" dy=".3em">
          ${width}×${height}
        </text>
      </svg>
    `;

    const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
    res.type('png').send(buffer);
  } catch (err) {
    next(err);
  }
});

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

/* -------------------- ERROR HANDLER -------------------- */
app.use(errorMiddleware);

module.exports = app;
