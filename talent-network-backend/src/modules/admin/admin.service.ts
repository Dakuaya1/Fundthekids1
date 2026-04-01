import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getSystemMetrics() {
    const totalUsers = await this.prisma.user.count();
    const activeSponsorships = await this.prisma.sponsorshipPlan.count({
      where: { status: 'ACTIVE' },
    });

    // Sum all completed payments
    const payments = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });

    // Top NGOs by onboarded active children
    const activeChildrenByNgo = await this.prisma.child.groupBy({
      by: ['ngoId'],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    return {
      totalUsers,
      activeSponsorships,
      totalFundsRaisedUsd: payments._sum.amount || 0,
      activeChildrenByNgo,
    };
  }

  async getUsers(page: number = 1, limit: number = 20, role?: string) {
    const offset = (page - 1) * limit;

    const whereClause = role ? { role: role as any } : {};

    let users;

    try {
      users = await this.prisma.user.findMany({
        where: whereClause,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          // Do not fetch passwordHash
          ngo: { select: { verifiedStatus: true, name: true, region: true } },
          sponsor: { select: { impactScore: true, leaderboardRank: true } },
          guardian: {
            select: {
              fullName: true,
              region: true,
              organizationName: true,
              isAvailable: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.warn(
        'Falling back to admin user list without guardian details because guardian tables are unavailable.',
      );
      this.logger.debug(String(error));

      users = await this.prisma.user.findMany({
        where: whereClause,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          ngo: { select: { verifiedStatus: true, name: true, region: true } },
          sponsor: { select: { impactScore: true, leaderboardRank: true } },
        },
      });
    }

    const total = await this.prisma.user.count({ where: whereClause });

    return {
      data: users,
      meta: {
        total,
        page: Number(page),
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(userId: string, action: 'VERIFY_NGO' | 'BAN_USER') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ngo: true },
    });
    if (!user) throw new NotFoundException('User not found');

    if (action === 'VERIFY_NGO') {
      if (user.role !== 'NGO' || !user.ngo) {
        throw new Error('User is not an NGO');
      }
      return this.prisma.nGO.update({
        where: { id: user.ngo.id },
        data: { verifiedStatus: true },
      });
    }

    if (action === 'BAN_USER') {
      // In a real system, you might set a disabled flag. For now we will just log it or handle dynamically
      return { message: 'User banned feature placeholder.' };
    }
  }
}
