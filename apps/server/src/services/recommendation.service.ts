import { prisma } from '../utils/db';
import { logger } from '../utils/logger';

export const recommendationService = {
  /**
   * Generates a "Trending Score" for rooms based on participants and activity.
   * This is a simplified version of a collaborative filtering / ML ranking model.
   */
  async getTrendingRooms(limit: number = 10) {
    try {
      const rooms = await prisma.room.findMany({
        where: { status: 'ACTIVE' },
        include: {
          _count: {
            select: { participants: true, messages: true }
          },
          host: { select: { name: true } } // Removed reputationScore since it's mock
        }
      });

      // Algorithm: Score = (Participants * 2) + (Messages * 0.5) + (HostReputation * 1.5)
      // Decay factor based on creation time could be added here.
      const scoredRooms = rooms.map((room: any) => {
        const participantScore = room._count.participants * 2;
        const engagementScore = room._count.messages * 0.5;
        // Host reputation defaults to 1.0 if not explicit in DB schema
        const hostReputation = (room.host as any)?.reputationScore || 1.0;
        
        const totalScore = (participantScore + engagementScore) * hostReputation;

        return {
          ...room,
          trendingScore: totalScore
        };
      });

      // Sort by trending score descending
      return scoredRooms.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, limit);

    } catch (error) {
      logger.error(`Error calculating recommendations: ${error}`);
      return [];
    }
  },

  /**
   * Personalized recommendations based on user's past room history categories.
   */
  async getPersonalizedRooms(userId: string) {
    logger.info(`Fetching personalized AI recommendations for user ${userId}`);
    // Future Implementation:
    // 1. Query user's past joined rooms and extract dominant topics/tags.
    // 2. Vector search (e.g., Pinecone/pgvector) for active rooms matching those interest vectors.
    // 3. Return ranked list.
    return await this.getTrendingRooms(5); // Fallback to trending
  }
};
