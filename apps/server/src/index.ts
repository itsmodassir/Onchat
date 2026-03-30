import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import socialRoutes from './routes/social.routes';
import shopRoutes from './routes/shop.routes';
import adminRoutes from './routes/admin.routes';
import { chatService } from './services/chat.service';
import paymentRoutes from './routes/payment.routes';
import gamificationRoutes from './routes/gamification.routes';
import moderationRoutes from './routes/moderation.routes';
import monetizationRoutes from './routes/monetization.routes';
import cpRoutes from './routes/cp.routes';
import agencyRoutes from './routes/agency.routes';
import luckRoutes from './routes/game.routes';
import resellerRoutes from './routes/reseller.routes';
import storageRoutes from './routes/storage.routes';
import path from 'path';

import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = new Redis(REDIS_URL);
const subClient = pubClient.duplicate();

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  adapter: createAdapter(pubClient, subClient)
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use('/api', limiter as any); // Apply rate limiting to all /api routes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/game', gamificationRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/cp', cpRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/luck', luckRoutes);
app.use('/api/reseller', resellerRoutes);
app.use('/api/storage', storageRoutes);

// Static Media Serving
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root route for visual confirmation
app.get('/', (req, res) => {
  res.send(`
    <div style="background: #0f172a; color: #818cf8; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif; text-align: center;">
      <h1 style="font-size: 3rem; margin-bottom: 0;">Onchat Backend is LIVE 🎙️</h1>
      <p style="color: #94a3b8; font-size: 1.2rem;">Startup-Grade Social Audio Engine</p>
      <div style="margin-top: 20px; padding: 15px 30px; border: 1px solid #334155; border-radius: 12px; background: #1e293b;">
        Server Status: <span style="color: #22c55e; font-weight: bold;">ONLINE</span>
      </div>
      <p style="margin-top: 40px; color: #475569; font-size: 0.9rem;">Connected to: Onchat Ecosystem</p>
    </div>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('SERVER_ERROR:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Socket.io connection logic
io.use((socket: any, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) return next(new Error('Authentication error: No token provided'));
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    socket.userId = decoded.userId || decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

chatService.init(io);
io.on('connection', (socket: any) => {
  console.log('User connected:', socket.id, 'User ID:', socket.userId);
  chatService.handleSocket(io, socket);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io };
