"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const otp_service_1 = require("../services/otp.service");
exports.authController = {
    async sendOtp(req, res) {
        try {
            const { email, purpose } = req.body; // purpose should be SIGNUP, LOGIN, RESET_PASSWORD
            if (!email || !purpose)
                throw new Error('Email and purpose are required.');
            await otp_service_1.otpService.sendOtp(email, purpose);
            res.json({ message: 'OTP sent successfully.' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async signup(req, res) {
        try {
            const { name, email, password, otp } = req.body;
            if (!otp)
                throw new Error('OTP is required for signup.');
            const user = await auth_service_1.authService.signup(name, email, password, otp);
            res.status(201).json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async login(req, res) {
        try {
            const { email, password, otp } = req.body;
            const result = await auth_service_1.authService.login(email, password, otp);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    },
    async resetPassword(req, res) {
        try {
            const { email, otp, newPassword } = req.body;
            if (!email || !otp || !newPassword)
                throw new Error('Email, OTP, and new password are required.');
            const result = await auth_service_1.authService.resetPassword(email, otp, newPassword);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async updateProfile(req, res) {
        try {
            const { name, avatar } = req.body;
            const user = await auth_service_1.authService.updateProfile(req.user.userId, { name, avatar });
            res.json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async savePushToken(req, res) {
        try {
            const { token } = req.body;
            if (!token)
                throw new Error('Token is required');
            await auth_service_1.authService.savePushToken(req.user.userId, token);
            res.json({ success: true, message: 'Push token registered successfully' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async setupAdmin(req, res) {
        try {
            const { email, password, name } = req.body;
            const hashedPassword = await require('bcryptjs').hash(password, 10);
            const shortId = Math.random().toString(36).substring(2, 10).toUpperCase();
            const user = await require('../utils/db').prisma.user.upsert({
                where: { email },
                update: { password: hashedPassword, isAdmin: true },
                create: { email, name, password: hashedPassword, isAdmin: true, shortId }
            });
            res.json({ message: 'Admin setup successful', email: user.email });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async me(req, res) {
        try {
            const user = await auth_service_1.authService.me(req.user.userId);
            res.json(user);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    },
};
