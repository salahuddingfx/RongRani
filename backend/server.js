require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const mongoose = require('mongoose');
const seedAdminUser = require('./utils/seedAdmin');

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    // Seed admin user from .env
    await seedAdminUser();
  })
  .catch(err => console.error('MongoDB connection error:', err));

const server = http.createServer(app);
const socketOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
  'http://localhost:5181',
  'http://localhost:5182',
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: socketOrigins,
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.emit('socket:connected', { id: socket.id });

  socket.on('chat:message', (payload) => {
    io.emit('chat:message', {
      ...payload,
      at: new Date().toISOString(),
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});