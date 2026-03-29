"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const room_routes_1 = __importDefault(require("./routes/room.routes"));
const social_routes_1 = __importDefault(require("./routes/social.routes"));
const shop_routes_1 = __importDefault(require("./routes/shop.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const chat_service_1 = require("./services/chat.service");
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const gamification_routes_1 = __importDefault(require("./routes/gamification.routes"));
const moderation_routes_1 = __importDefault(require("./routes/moderation.routes"));
const monetization_routes_1 = __importDefault(require("./routes/monetization.routes"));
const cp_routes_1 = __importDefault(require("./routes/cp.routes"));
const agency_routes_1 = __importDefault(require("./routes/agency.routes"));
const game_routes_1 = __importDefault(require("./routes/game.routes"));
const reseller_routes_1 = __importDefault(require("./routes/reseller.routes"));
const storage_routes_1 = __importDefault(require("./routes/storage.routes"));
const path_1 = __importDefault(require("path"));
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = new ioredis_1.default(REDIS_URL);
const subClient = pubClient.duplicate();
const app = (0, express_1.default)();
exports.app = app;
app.set('trust proxy', 1);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    adapter: (0, redis_adapter_1.createAdapter)(pubClient, subClient)
});
exports.io = io;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
});
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use('/api', limiter); // Apply rate limiting to all /api routes
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/rooms', room_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/social', social_routes_1.default);
app.use('/api/shop', shop_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/game', gamification_routes_1.default);
app.use('/api/moderation', moderation_routes_1.default);
app.use('/api/monetization', monetization_routes_1.default);
app.use('/api/cp', cp_routes_1.default);
app.use('/api/agency', agency_routes_1.default);
app.use('/api/luck', game_routes_1.default);
app.use('/api/reseller', reseller_routes_1.default);
app.use('/api/storage', storage_routes_1.default);
// Static Media Serving
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Root route for visual confirmation
app.get('/', (req, res) => {
    res.send(`
    <div style="background: #0f172a; color: #818cf8; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif; text-align: center;">
      <h1 style="font-size: 3rem; margin-bottom: 0;">Onchat Backend is LIVE 🎙️</h1>
      <p style="color: #94a3b8; font-size: 1.2rem;">Startup-Grade Social Audio Engine</p>
      <div style="margin-top: 20px; padding: 15px 30px; border: 1px solid #334155; border-radius: 12px; background: #1e293b;">
        Server Status: <span style="color: #22c55e; font-weight: bold;">ONLINE</span>
      </div>
      <p style="margin-top: 40px; color: #475569; font-size: 0.9rem;">Connected to: 13.126.135.253</p>
    </div>
  `);
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER_ERROR:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
// Socket.io connection logic
chat_service_1.chatService.init(io);
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    chat_service_1.chatService.handleSocket(io, socket);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
