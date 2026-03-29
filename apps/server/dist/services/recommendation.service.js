"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationService = void 0;
const db_1 = require("../utils/db");
exports.recommendationService = {
    async getUserRecommendations(userId) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: { interests: true },
        });
        if (!user)
            return [];
        const userInterests = user.interests || [];
        // Find rooms that match user interests or are popular
        const rooms = await db_1.prisma.room.findMany({
            where: {
                status: 'ACTIVE',
            },
            include: {
                _count: {
                    select: { participants: true }
                },
                host: {
                    select: { level: true }
                }
            },
            take: 20
        });
        // Scoring algorithm
        const scoredRooms = rooms.map((room) => {
            let score = 0;
            // Interest match (+10 for category, +5 for tags)
            if (userInterests.includes(room.category))
                score += 10;
            const tags = (room.tags || '').split(',').map((i) => i.trim());
            const matchingTags = tags.filter((tag) => userInterests.includes(tag));
            score += matchingTags.length * 5;
            // Popularity match (+1 per participant)
            score += (room._count?.participants || 0);
            // Host reputation (+2 per host level)
            score += (room.host?.level || 1) * 2;
            return { ...room, recommendationScore: score };
        });
        // Sort by score and return top 10
        return scoredRooms
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, 10);
    },
};
