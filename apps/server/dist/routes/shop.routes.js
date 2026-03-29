"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shop_controller_1 = require("../controllers/shop.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Wallet & Store
router.get('/wallet', shop_controller_1.shopController.getWallet);
router.post('/recharge', shop_controller_1.shopController.recharge);
router.post('/exchange', shop_controller_1.shopController.exchange);
router.get('/store', shop_controller_1.shopController.getStoreItems);
router.post('/store/buy', shop_controller_1.shopController.buyItem);
router.post('/spin', shop_controller_1.shopController.spin);
// Family
router.post('/family', shop_controller_1.familyController.create);
router.post('/family/join', shop_controller_1.familyController.join);
router.get('/family/:familyId', shop_controller_1.familyController.getInfo);
exports.default = router;
