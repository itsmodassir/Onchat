import { prisma } from '../utils/db';

export const recommendationService = {
  async getUserRecommendations(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { interests: true },
    }) as any;

    if (!user) return [];

    const userInterests = user.interests || [];

    // Find rooms that match user interests or are popular
    const rooms = await prisma.room.findMany({
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
    }) as any[];

    // Scoring algorithm
    const scoredRooms = rooms.map((room: any) => {
      let score = 0;
      
      // Interest match (+10 for category, +5 for tags)
      if (userInterests.includes(room.category)) score += 10;
      
      const tags = (room.tags || '').split(',').map((i: string) => i.trim());
      const matchingTags = tags.filter((tag: string) => userInterests.includes(tag));
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

