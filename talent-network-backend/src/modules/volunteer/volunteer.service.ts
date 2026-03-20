import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { ValidationStatus } from '@prisma/client';

@Injectable()
export class VolunteerService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
  ) {}

  async getRegionChildren(userId: string) {
    // Fetch the volunteer profile to get their assigned region
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { userId },
    });

    if (!volunteer) {
      throw new NotFoundException('Volunteer profile not found for this user');
    }

    // Fetch children belonging to NGOs operating in the volunteer's assigned region
    // including their pending progress reports
    return this.prisma.child.findMany({
      where: {
        ngo: {
          region: volunteer.assignedRegion,
        },
      },
      include: {
        ngo: { select: { name: true, region: true } },
        reports: {
          where: { validationStatus: 'PENDING' },
          orderBy: { date: 'desc' },
        },
      },
    });
  }

  async verifyReport(
    userId: string,
    reportId: string,
    status: ValidationStatus,
  ) {
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { userId },
    });

    if (!volunteer) {
      throw new NotFoundException('Volunteer profile not found');
    }

    const report = await this.prisma.progressReport.findUnique({
      where: { id: reportId },
      include: { child: { include: { ngo: true } } },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Ensure the volunteer's region matches the NGO's region making the report
    if (report.child.ngo.region !== volunteer.assignedRegion) {
      throw new UnauthorizedException(
        'You can only verify reports from your assigned region',
      );
    }

    const updatedReport = await this.prisma.progressReport.update({
      where: { id: reportId },
      data: { validationStatus: status },
    });

    // Award Impact Score to the active Volunteer for verifying the report (e.g. 10 points)
    await this.gamificationService.awardPoints(
      userId,
      10,
      `Verified Report ${reportId} as ${status}`,
    );

    return updatedReport;
  }
}
