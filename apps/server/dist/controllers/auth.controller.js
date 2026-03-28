"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
exports.authController = {
    async signup(req, res) {
        try {
            const { name, email, password } = req.body;
            const user = await auth_service_1.authService.signup(name, email, password);
            res.status(201).json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.authService.login(email, password);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
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
