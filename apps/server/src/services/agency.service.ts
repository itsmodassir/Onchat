import { prisma } from '../utils/db';

export const agencyService = {
  async getAgencyStats(userId: string) {
    const agency = await prisma.agency.findFirst({
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
      return await prisma.agencyMember.findFirst({
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

  async createAgency(userId: string, name: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    
    // Requirements (e.g., Level 10 or specific crystal mount)
    if (user.level < 5) throw new Error('Level 5 required to start an agency');

    return await prisma.agency.create({
      data: {
        name,
        ownerId: userId,
      }
    });
  },

  async joinAgency(userId: string, agencyId: string) {
    return await prisma.agencyMember.create({
      data: {
        agencyId,
        userId,
        role: 'HOST'
      }
    });
  }
};
