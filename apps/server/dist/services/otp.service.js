"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpService = void 0;
const db_1 = require("../utils/db");
const email_service_1 = require("./email.service");
const logger_1 = require("../utils/logger");
const OTP_EXPIRY_MINUTES = 10;
exports.otpService = {
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },
    async sendOtp(email, purpose) {
        // Check if user exists for LOGIN or RESET_PASSWORD
        if (purpose === 'LOGIN' || purpose === 'RESET_PASSWORD') {
            const user = await db_1.prisma.user.findUnique({ where: { email } });
            if (!user)
                throw new Error('User with this email does not exist.');
        }
        if (purpose === 'SIGNUP') {
            const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
            if (existingUser)
                throw new Error('Email is already registered. Please login.');
        }
        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
        // Delete existing valid OTPs for this email and purpose
        await db_1.prisma.otp.deleteMany({
            where: { email, purpose }
        });
        const otp = await db_1.prisma.otp.create({
            data: {
                email,
                code,
                purpose,
                expiresAt
            }
        });
        // Run email delivery and await it to catch infrastructure errors
        try {
            await email_service_1.emailService.sendOtpEmail(email, code, purpose);
        }
        catch (err) {
            logger_1.logger.error(`[OTP_DELIVERY_FAILURE] Protocol error for ${email}: ${err.message}`);
            throw new Error(`Email delivery failed: ${err.message}`);
        }
        return otp;
    },
    async verifyOtp(email, code, purpose) {
        const otp = await db_1.prisma.otp.findFirst({
            where: {
                email,
                code,
                purpose,
            },
            orderBy: { createdAt: 'desc' }
        });
        if (!otp) {
            return { valid: false, message: 'Invalid OTP code.' };
        }
        if (otp.expiresAt < new Date()) {
            return { valid: false, message: 'OTP has expired.' };
        }
        // Optional: burn the OTP after successful verification
        await db_1.prisma.otp.delete({ where: { id: otp.id } });
        return { valid: true };
    }
};
