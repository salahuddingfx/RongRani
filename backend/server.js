const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const seedAdminUser = require('./utils/seedAdmin');

// 1. Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error('💥 UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// 2. Connect to Database
connectDB().then(async () => {
  // Seed admin user from .env
  await seedAdminUser().catch(err => logger.error('Admin seeding failed:', err));
});

// 3. Create HTTP Server
const server = http.createServer(app);

// 4. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        env.FRONTEND_URL,
        'http://localhost:5173',
        'https://rongrani.vercel.app'
      ];

      if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
        callback(null, true);
      } else {
        logger.warn('🚫 Socket blocked origin:', { origin });
        callback(null, false);
      }
    },
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  logger.info(`🔌 Socket connected: ${socket.id}`);

  socket.on('chat:message', (payload) => {
    io.emit('chat:message', {
      ...payload,
      at: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    logger.info(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// 5. Start Server
const PORT = env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// 6. Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
  logger.error('💥 UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});