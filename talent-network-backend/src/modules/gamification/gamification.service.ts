import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Role } from '@prisma/client';

export interface IGamificationEngine {
  awardPoints(userId: string, points: number, reason: string): Promise<void>;
  evaluateBadges(userId: string): Promise<string[]>; // Returns unlocked badge IDs
  getLeaderboard(limit?: number): Promise<any>;
}

@Injectable()
export class GamificationService implements IGamificationEngine {
  constructor(private prisma: PrismaService) { }

  async awardPoints(
    userId: string,
    points: number,
    reason: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    // Log the activity
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: `Awarded ${points} points: ${reason}`,
      },
    });

    // Increment explicit role score
    if (user.role === Role.SPONSOR) {
      await this.prisma.sponsor.update({
        where: { userId },
        data: {
          impactScore: { increment: points },
          weeklyImpactScore: { increment: points },
        },
      });
    } else if (user.role === Role.VOLUNTEER) {
      await this.prisma.volunteer.update({
        where: { userId },
        data: { impactScore: { increment: points } },
      });
    }

    // Evaluate badges after point increment
    await this.evaluateBadges(userId);
  }

  async evaluateBadges(userId: string): Promise<string[]> {
    // Find existing badges
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });
    const currentBadgeNames = userBadges.map((ub) => ub.badge.name);

    // Find the user's role profile impact score to determine new badges
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { sponsor: true, volunteer: true },
    });

    if (!user) return [];

    const score = user.sponsor?.impactScore || user.volunteer?.impactScore || 0;
    const awardedIds: string[] = [];

    // Simple badge evaluation logic (can be expanded)
    const checkAndAward = async (
      name: string,
      criteria: string,
      threshold: number,
    ) => {
      if (score >= threshold && !currentBadgeNames.includes(name)) {
        // Upsert the badge definition first to ensure it exists
        const badge = await this.prisma.badge.upsert({
          where: { id: name }, // Assuming name is unique enough for this mock
          update: {},
          create: { id: name, name, criteria },
        });

        await this.prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        awardedIds.push(badge.id);
      }
    };

    if (user.role === Role.SPONSOR) {
      await checkAndAward(
        'First Pledge',
        'Make your first sponsorship pledge',
        50,
      );
      await checkAndAward('Bronze Patron', 'Reach 500 Impact Score', 500);
      await checkAndAward('Silver Patron', 'Reach 2000 Impact Score', 2000);
    }

    return awardedIds;
  }

  async getLeaderboard(limit: number = 10): Promise<any> {
    return this.prisma.sponsor.findMany({
      orderBy: { impactScore: 'desc' },
      take: limit,
      include: { user: { select: { email: true } } },
    });
  }

  async getProfile(userId: string) {
    console.log(`[getProfile] START for user: ${userId}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      console.log(`[getProfile] Prisma fetched user: ${user ? user.email : 'NOT FOUND'}`);

      if (!user) return null;

      const sponsor = await this.prisma.sponsor.findUnique({ where: { userId } });
      const volunteer = await this.prisma.volunteer.findUnique({ where: { userId } });
      const userBadges = await this.prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
      });

      const responseInfo = {
        impactScore: sponsor?.impactScore || volunteer?.impactScore || 0,
        badges: userBadges.map((ub) => ({
          id: ub.badge.id,
          name: ub.badge.name,
          criteria: ub.badge.criteria,
        })),
      };

      console.log(`[getProfile] Preparing to return profile info successfully`);
      return responseInfo;
    } catch (e) {
      console.error(`[getProfile] ERROR:`, e);
      throw e;
    }
  }

  async getSponsorOfWeek(): Promise<any> {
    const topSponsor = await this.prisma.sponsor.findFirst({
      orderBy: { weeklyImpactScore: 'desc' },
      include: { user: { select: { email: true } } },
    });

    if (!topSponsor || topSponsor.weeklyImpactScore === 0) return null;
    return topSponsor;
  }
}
