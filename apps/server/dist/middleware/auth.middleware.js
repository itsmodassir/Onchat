"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../utils/db");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        // Check if user is banned
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { isBanned: true, bannedUntil: true },
        });
        if (user?.isBanned) {
            // Auto-lift temp ban if expired
            if (user.bannedUntil && user.bannedUntil < new Date()) {
                await db_1.prisma.user.update({
                    where: { id: decoded.userId },
                    data: { isBanned: false, bannedUntil: null },
                });
            }
            else {
                return res.status(403).json({
                    error: 'Your account has been banned.',
                    bannedUntil: user.bannedUntil,
                });
            }
        }
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
