"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.familyService = void 0;
const db_1 = require("../utils/db");
exports.familyService = {
    async createFamily(userId, name, description, image) {
        return await db_1.prisma.$transaction(async (tx) => {
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
    async joinFamily(userId, familyId) {
        return await db_1.prisma.user.update({
            where: { id: userId },
            data: { familyId },
        });
    },
    async leaveFamily(userId) {
        return await db_1.prisma.user.update({
            where: { id: userId },
            data: { familyId: null },
        });
    },
    async getFamilyInfo(familyId) {
        return await db_1.prisma.family.findUnique({
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
    async checkIn(userId, taskId) {
        // Basic check-in logic
        const task = await db_1.prisma.familyTask.findUnique({ where: { id: taskId } });
        if (!task)
            throw new Error('Task not found');
        return await db_1.prisma.$transaction(async (tx) => {
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
