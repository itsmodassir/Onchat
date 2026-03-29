import { prisma } from '../utils/db';

export const familyService = {
  async createFamily(userId: string, name: string, description?: string, image?: string) {
    return await prisma.$transaction(async (tx: any) => {
      const family = await tx.family.create({
        data: {
          name,
          description,
          image,
          creatorId: userId,
        },
      });

      // Add creator as member
      await tx.user.update({
        where: { id: userId },
        data: { familyId: family.id },
      });

      return family;
    });
  },

  async joinFamily(userId: string, familyId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { familyId } as any,
    });
  },

  async leaveFamily(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { familyId: null } as any,
    });
  },

  async getFamilyInfo(familyId: string) {
    return await (prisma as any).family.findUnique({
      where: { id: familyId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            avatar: true,
            level: true,
          },
        },
        rooms: {
          include: {
            room: true,
          },
        },
        tasks: true,
      },
    });
  },

  async checkIn(userId: string, taskId: string) {
    // Basic check-in logic
    const task = await (prisma as any).familyTask.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('Task not found');

    return await prisma.$transaction(async (tx: any) => {
       await tx.familyTask.update({
         where: { id: taskId },
         data: { completed: true },
       });

       return await tx.family.update({
         where: { id: task.familyId },
         data: { exp: { increment: task.rewardExp } },
       });
    });
  },
};
