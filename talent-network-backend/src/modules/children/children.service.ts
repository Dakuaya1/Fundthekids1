import { ChildStatus } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ChildrenService {
  constructor(
    private prisma: PrismaService,
    private aiEngineService: AiEngineService,
  ) {}

  async create(data: any) {
    return this.prisma.child.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.child.findMany({
      where: { isActive: true, status: ChildStatus.VERIFIED },
      include: { ngo: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.child.findUnique({
      where: { id },
      include: { ngo: true, reports: { orderBy: { date: 'desc' } } },
    });
  }

  async addReport(
    childId: string,
    uploaderId: string,
    createReportDto: CreateReportDto,
  ) {
    const uploader = await this.prisma.user.findUnique({
      where: { id: uploaderId },
      include: { ngo: true },
    });
    if (!uploader || (!uploader.ngo && uploader.role !== 'GUARDIAN')) {
      throw new NotFoundException('Authorized profile not found');
    }

    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });
    if (!child) throw new NotFoundException('Child not found');

    // Fetch last 5 reports for context
    const recentReports = await this.prisma.progressReport.findMany({
      where: { childId },
      orderBy: { date: 'desc' },
      take: 5,
    });

    const rawReports = recentReports.map((r) => r.description);
    rawReports.push(createReportDto.content);

    const autoSummary = await this.aiEngineService.generateProgressSummary(
      childId,
      rawReports,
    );

    // Create the individual progress report
    const report = await this.prisma.progressReport.create({
      data: {
        childId,
        uploadedById: uploaderId,
        description: createReportDto.content,
        mediaUrl: createReportDto.mediaUri,
        aiSummary: autoSummary,
      },
    });

    return report;
  }
}
