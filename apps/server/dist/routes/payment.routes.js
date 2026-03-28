"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/add-coins', auth_middleware_1.authMiddleware, payment_controller_1.paymentController.addCoins);
router.post('/send-gift', auth_middleware_1.authMiddleware, payment_controller_1.paymentController.sendGift);
exports.default = router;
