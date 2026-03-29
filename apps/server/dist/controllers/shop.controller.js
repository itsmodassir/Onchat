"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.familyController = exports.shopController = void 0;
const monetization_service_1 = require("../services/monetization.service");
const store_service_1 = require("../services/store.service");
const family_service_1 = require("../services/family.service");
exports.shopController = {
    async getWallet(req, res) {
        try {
            const userId = req.user.id;
            const wallet = await monetization_service_1.monetizationService.getWallet(userId);
            res.json(wallet);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async recharge(req, res) {
        try {
            const userId = req.user.id;
            const { amount, coins } = req.body;
            const result = await monetization_service_1.monetizationService.recharge(userId, amount, coins);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async spin(req, res) {
        try {
            const userId = req.user.id;
            const { stake } = req.body;
            const result = await monetization_service_1.monetizationService.spin(userId, stake);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async exchange(req, res) {
        try {
            const userId = req.user.id;
            const { diamonds, coins } = req.body;
            const result = await monetization_service_1.monetizationService.exchangeDiamonds(userId, diamonds, coins);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getStoreItems(req, res) {
        try {
            const { category } = req.query;
            const items = await store_service_1.storeService.getItems(category);
            res.json(items);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async buyItem(req, res) {
        try {
            const userId = req.user.id;
            const { itemId } = req.body;
            const result = await store_service_1.storeService.buyItem(userId, itemId);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
exports.familyController = {
    async create(req, res) {
        try {
            const userId = req.user.id;
            const { name, description, image } = req.body;
            const result = await family_service_1.familyService.createFamily(userId, name, description, image);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async join(req, res) {
        try {
            const userId = req.user.id;
            const { familyId } = req.body;
            const result = await family_service_1.familyService.joinFamily(userId, familyId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getInfo(req, res) {
        try {
            const { familyId } = req.params;
            const info = await family_service_1.familyService.getFamilyInfo(familyId);
            res.json(info);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
