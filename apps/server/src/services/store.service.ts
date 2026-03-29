import { prisma } from '../utils/db';

export const storeService = {
  async getItems(category?: string) {
    return await (prisma as any).storeItem.findMany({
      where: category ? { category } : {},
    });
  },

  async buyItem(userId: string, itemId: string) {
    return await prisma.$transaction(async (tx: any) => {
      const item = await tx.storeItem.findUnique({ where: { id: itemId } });
      if (!item) throw new Error('Item not found');

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      // Check balance
      if (item.currency === 'COIN' && user.coins < item.price) {
        throw new Error('Insufficient coins');
      }
      if (item.currency === 'CRYSTAL' && user.crystals < item.price) {
        throw new Error('Insufficient crystals');
      }

      // Deduct balance
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: item.currency === 'COIN' ? { decrement: item.price } : undefined,
          crystals: item.currency === 'CRYSTAL' ? { decrement: item.price } : undefined,
        },
      });

      // Create asset
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + item.duration);

      return await tx.userAsset.create({
        data: {
          userId,
          itemId,
          expiresAt,
        },
      });
    });
  },

  async equipAsset(userId: string, assetId: string) {
    return await prisma.$transaction(async (tx: any) => {
      const asset = await tx.userAsset.findUnique({ 
        where: { id: assetId },
        include: { item: true }
      });
      
      if (!asset || asset.userId !== userId) throw new Error('Asset not found');

      // Unequip others in same category
      await tx.userAsset.updateMany({
        where: { 
          userId, 
          item: { category: asset.item.category },
          isEquipped: true 
        },
        data: { isEquipped: false },
      });

      // Equip this one
      return await tx.userAsset.update({
        where: { id: assetId },
        data: { isEquipped: true },
      });
    });
  },
};
