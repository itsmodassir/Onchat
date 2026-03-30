"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public/Authenticated Profile viewing
router.get('/profile/:query', auth_middleware_1.authMiddleware, user_controller_1.userController.getProfile);
// User search
router.get('/search', auth_middleware_1.authMiddleware, user_controller_1.userController.searchUsers);
// Profile updates
router.patch('/bio', auth_middleware_1.authMiddleware, user_controller_1.userController.updateBio);
// Social Discovery
router.get('/top-creators', auth_middleware_1.authMiddleware, user_controller_1.userController.getTopCreators);
exports.default = router;
