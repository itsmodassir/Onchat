"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reseller_controller_1 = require("../controllers/reseller.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/transfer', auth_middleware_1.authMiddleware, reseller_controller_1.resellerController.transferCoins);
router.get('/stats', auth_middleware_1.authMiddleware, reseller_controller_1.resellerController.getStats);
exports.default = router;
