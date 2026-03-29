"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../utils/logger");
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER || 'resend',
        pass: process.env.SMTP_PASS,
    },
});
exports.emailService = {
    async sendEmail(to, subject, html) {
        try {
            const info = await transporter.sendMail({
                from: `Onchat <${process.env.SMTP_FROM || 'noreply@onchat.fun'}>`,
                to,
                subject,
                html,
            });
            logger_1.logger.info(`Email sent to ${to}: ${info.messageId}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`SMTP_ERROR sending email to ${to}: ${JSON.stringify(error?.response || error?.message || error)}`);
            return false;
        }
    },
    async sendOtpEmail(to, code, purpose) {
        let subject = 'Your Onchat OTP Code';
        let message = `Your OTP code is <b>${code}</b>. It is valid for 10 minutes.`;
        if (purpose === 'SIGNUP') {
            subject = 'Welcome to Onchat - Verify your email';
            message = `Thank you for signing up! Your verification code is <b style="font-size: 24px;">${code}</b>.<br/>It expires in 10 minutes.`;
        }
        else if (purpose === 'LOGIN') {
            subject = 'Onchat Login OTP';
            message = `Your login code is <b style="font-size: 24px;">${code}</b>. Do not share this with anyone.`;
        }
        else if (purpose === 'RESET_PASSWORD') {
            subject = 'Onchat Password Reset';
            message = `You requested a password reset. Your OTP is <b style="font-size: 24px;">${code}</b>.`;
        }
        return await this.sendEmail(to, subject, message);
    }
};
