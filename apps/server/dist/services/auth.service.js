"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../utils/db");
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
exports.authService = {
    async signup(name, email, password) {
        logger_1.logger.info(`Signup attempt for email: ${email}`);
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        return user;
    },
    async login(email, password) {
        logger_1.logger.info(`Login attempt for email: ${email}`);
        const user = await db_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        return { user, token };
    },
    async me(userId) {
        return await db_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                rooms: true,
                transactions: true,
            },
        });
    },
};
