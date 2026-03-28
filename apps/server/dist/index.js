import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import { chatService } from './services/chat.service';
import paymentRoutes from './routes/payment.routes';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
dotenv.config();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = new Redis(REDIS_URL);
const subClient = pubClient.duplicate();
const app = express();
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
app.use('/api', limiter); // Apply rate limiting to all /api routes
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', paymentRoutes);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Socket.io connection logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    chatService.handleSocket(io, socket);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
export { app, io };
