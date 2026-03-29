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
const id_1 = require("../utils/id");
const otp_service_1 = require("./otp.service");
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
exports.authService = {
    async signup(name, email, password, otp) {
        try {
            logger_1.logger.info(`Signup attempt for email: ${email}`);
            const verification = await otp_service_1.otpService.verifyOtp(email, otp, 'SIGNUP');
            if (!verification.valid) {
                throw new Error(verification.message || 'Invalid OTP');
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const shortId = (0, id_1.generateShortId)();
            const user = await db_1.prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    shortId,
                },
            });
            return user;
        }
        catch (error) {
            logger_1.logger.error('SIGNUP_SERVICE_ERROR:', error);
            throw error;
        }
    },
    async login(email, password, otp) {
        logger_1.logger.info(`Login attempt for email: ${email}`);
        const user = await db_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (otp) {
            const verification = await otp_service_1.otpService.verifyOtp(email, otp, 'LOGIN');
            if (!verification.valid) {
                throw new Error(verification.message || 'Invalid OTP');
            }
        }
        else if (password && user.password) {
            const isMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }
        }
        else {
            throw new Error('Password or OTP is required');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
        return { user, token };
    },
    async resetPassword(email, otp, newPassword) {
        const verification = await otp_service_1.otpService.verifyOtp(email, otp, 'RESET_PASSWORD');
        if (!verification.valid) {
            throw new Error(verification.message || 'Invalid OTP');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await db_1.prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        return { success: true, message: 'Password updated successfully' };
    },
    async savePushToken(userId, token) {
        return await db_1.prisma.user.update({
            where: { id: userId },
            data: { expoPushToken: token },
        });
    },
    async updateProfile(userId, data) {
        return await db_1.prisma.user.update({
            where: { id: userId },
            data,
        });
    },
    async me(userId) {
        return await db_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        rooms: true,
                        participants: true,
                    },
                },
                family: {
                    select: { id: true, name: true },
                },
                assets: {
                    where: { isEquipped: true },
                    include: { item: true },
                    take: 5,
                },
            },
        });
    },
};
