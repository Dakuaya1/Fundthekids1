import { Injectable } from '@nestjs/common';
import { PrismaService } from './config/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) { }

  getHello(): string {
    return 'Welcome to the Talent Infrastructure Network API';
  }

  async getShowcaseData() {
    const recentChildren = await this.prisma.child.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { id: 'desc' },
      include: {
        ngo: {
          select: { name: true, region: true },
        },
      },
    });

    // 2. Get 3 active NGOs
    const ngos = await this.prisma.nGO.findMany({
      where: { verifiedStatus: true },
      take: 3,
      include: {
        _count: {
          select: { children: true },
        },
      },
    });

    // 3. Get top 3 field volunteers by impact score
    const topVolunteers = await this.prisma.volunteer.findMany({
      take: 3,
      orderBy: { impactScore: 'desc' },
      include: {
        user: { select: { email: true } },
      },
    });

    // 4. Get top 3 sponsors
    const topSponsors = await this.prisma.sponsor.findMany({
      take: 3,
      orderBy: { impactScore: 'desc' },
      include: {
        user: { select: { email: true } },
      },
    });

    return {
      children: recentChildren,
      ngos: ngos,
      volunteers: topVolunteers,
      sponsors: topSponsors,
    };
  }
}
