import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdminTool } from '../tools/admin.tool';
import { ChildrenTool } from '../tools/children.tool';
import { GamificationTool } from '../tools/gamification.tool';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AdminReportScheduler {
  private readonly logger = new Logger(AdminReportScheduler.name);

  constructor(
    private readonly childrenTool: ChildrenTool,
    private readonly adminTool: AdminTool,
    private readonly gamificationTool: GamificationTool,
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async generateAdminReport() {
    const [children, metrics, sponsors, users] = await Promise.all([
      this.childrenTool.listActiveChildren(),
      this.adminTool.getSystemMetrics(),
      this.gamificationTool.getLeaderboard(20),
      this.adminTool.getUsers(1, 100),
    ]);

    const childrenNeedingFunding = (children || [])
      .filter((child: any) => !child.plans?.length)
      .slice(0, 10)
      .map((child: any) => ({
        id: child.id,
        name: child.name,
        talentCategory: child.talentCategory,
      }));

    const pendingVerifications = (users.data || [])
      .filter((user: any) => user.role === 'NGO' && user.ngo?.verifiedStatus === false)
      .map((user: any) => ({
        id: user.id,
        email: user.email,
        ngo: user.ngo?.name || 'Unknown NGO',
      }));

    const suspiciousActivity = pendingVerifications.slice(0, 10);
    const inactiveSponsors = (sponsors || [])
      .filter((sponsor: any) => (sponsor.impactScore || 0) < 100)
      .map((sponsor: any) => ({
        id: sponsor.id,
        email: sponsor.user?.email,
        impactScore: sponsor.impactScore,
      }));

    const generatedReport = {
      generatedAt: new Date().toISOString(),
      childrenNeedingFunding,
      pendingVerifications,
      suspiciousActivity,
      inactiveSponsors,
      metrics,
    };

    await this.prisma.adminAiReport.create({
      data: {
        report: generatedReport,
      },
    });

    this.logger.log(JSON.stringify(generatedReport));
  }
}
