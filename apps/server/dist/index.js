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
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const room_routes_1 = __importDefault(require("./routes/room.routes"));
const chat_service_1 = require("./services/chat.service");
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = __importDefault(require("ioredis"));
dotenv_1.default.config();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = new ioredis_1.default(REDIS_URL);
const subClient = pubClient.duplicate();
const app = (0, express_1.default)();
exports.app = app;
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
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Socket.io connection logic
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
