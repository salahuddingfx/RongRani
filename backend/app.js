const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:5180', 'http://localhost:5181', 'http://localhost:5182', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));

// Rate limiting - increased for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const aiRoutes = require('./routes/ai.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const categoryRoutes = require('./routes/category.routes');
const promotionRoutes = require('./routes/promotion.routes');
const couponRoutes = require('./routes/coupon.routes');

app.get('/', (req, res) => {
  res.json({ message: 'Chirkut ঘর Backend API' });
});

app.get('/api/health', (req, res) => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: {
      state: stateMap[mongoose.connection.readyState] || 'unknown',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/coupons', couponRoutes);

// Placeholder image route
app.get('/api/placeholder/:width/:height', async (req, res) => {
  try {
    const { width, height } = req.params;
    const sharp = require('sharp');

    // Create a simple colored rectangle as placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">
          ${width}×${height}
        </text>
      </svg>
    `;

    const buffer = await sharp(Buffer.from(svg)).png().toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Placeholder image error:', error);
    res.status(500).send('Error generating placeholder image');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;