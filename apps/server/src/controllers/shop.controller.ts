import { Request, Response } from 'express';
import { monetizationService } from '../services/monetization.service';
import { storeService } from '../services/store.service';
import { familyService } from '../services/family.service';

export const shopController = {
  async getWallet(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const wallet = await monetizationService.getWallet(userId);
      res.json(wallet);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async recharge(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { amount, coins } = req.body;
      const result = await monetizationService.recharge(userId, amount, coins);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async spin(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { stake } = req.body;
      const result = await monetizationService.spin(userId, stake);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async exchange(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { diamonds, coins } = req.body;
      const result = await monetizationService.exchangeDiamonds(userId, diamonds, coins);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getStoreItems(req: Request, res: Response) {
    try {
      const { category } = req.query;
      const items = await storeService.getItems(category as string);
      res.json(items);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async buyItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { itemId } = req.body;
      const result = await storeService.buyItem(userId, itemId);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};

export const familyController = {
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { name, description, image } = req.body;
      const result = await familyService.createFamily(userId, name, description, image);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async join(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { familyId } = req.body;
      const result = await familyService.joinFamily(userId, familyId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getInfo(req: Request, res: Response) {
    try {
      const { familyId } = req.params;
      const info = await familyService.getFamilyInfo(familyId);
      res.json(info);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
