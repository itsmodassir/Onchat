"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialService = void 0;
const db_1 = require("../utils/db");
exports.socialService = {
    async follow(followerId, followingId) {
        if (followerId === followingId) {
            throw new Error('You cannot follow yourself');
        }
        try {
            return await db_1.prisma.follow.create({
                data: {
                    followerId,
                    followingId,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new Error('Already following this user');
            }
            throw error;
        }
    },
    async unfollow(followerId, followingId) {
        try {
            return await db_1.prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    },
                },
            });
        }
        catch (error) {
            throw new Error('Follow record not found');
        }
    },
    async getFollowers(userId) {
        return await db_1.prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        level: true,
                    },
                },
            },
        });
    },
    async getFollowing(userId) {
        return await db_1.prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        level: true,
                    },
                },
            },
        });
    },
    async getFriends(userId) {
        // Friends are mutual follows
        const following = await db_1.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const followingIds = following.map((f) => f.followingId);
        const friends = await db_1.prisma.follow.findMany({
            where: {
                followerId: { in: followingIds },
                followingId: userId,
            },
            include: {
                follower: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        level: true,
                    },
                },
            },
        });
        return friends.map((f) => f.follower);
    },
};
