import { Injectable } from '@nestjs/common';
import { AiResponseDto } from './dto/ai-response.dto';
import { ImpactGraphWorkflow } from './workflows/impact.graph';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class AiService {
  constructor(
    private readonly impactGraphWorkflow: ImpactGraphWorkflow,
    private readonly prisma: PrismaService,
  ) {}

  async query(prompt: string, userId: string, role: string): Promise<AiResponseDto> {
    const state = await this.impactGraphWorkflow.run(prompt, userId, role);

    return {
      steps: state.steps,
      result: state.result,
    };
  }

  async getLatestAdminReport() {
    return this.prisma.adminAiReport.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }
}
