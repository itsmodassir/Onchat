"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const razorpay_controller_1 = require("../controllers/razorpay.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/razorpay/order', auth_middleware_1.authMiddleware, razorpay_controller_1.razorpayController.createOrder);
router.post('/razorpay/verify', auth_middleware_1.authMiddleware, razorpay_controller_1.razorpayController.verifyPayment);
exports.default = router;
