"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agencyService = void 0;
const db_1 = require("../utils/db");
exports.agencyService = {
    async getAgencyStats(userId) {
        const agency = await db_1.prisma.agency.findFirst({
            where: { ownerId: userId },
            include: {
                _count: { select: { members: true } },
                members: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true, shortId: true } }
                    }
                }
            }
        });
        if (!agency) {
            // Check if user is a member of another agency
            return await db_1.prisma.agencyMember.findFirst({
                where: { userId },
                include: {
                    agency: {
                        include: {
                            owner: { select: { name: true } }
                        }
                    }
                }
            });
        }
        return agency;
    },
    async createAgency(userId, name) {
        const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        // Requirements (e.g., Level 10 or specific crystal mount)
        if (user.level < 5)
            throw new Error('Level 5 required to start an agency');
        return await db_1.prisma.agency.create({
            data: {
                name,
                ownerId: userId,
            }
        });
    },
    async joinAgency(userId, agencyId) {
        return await db_1.prisma.agencyMember.create({
            data: {
                agencyId,
                userId,
                role: 'HOST'
            }
        });
    }
};
