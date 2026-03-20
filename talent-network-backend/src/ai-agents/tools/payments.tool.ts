import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { AdminService } from '../../modules/admin/admin.service';

@Injectable()
export class PaymentsTool {
  readonly getFundingSummaryTool: DynamicStructuredTool;

  constructor(private readonly adminService: AdminService) {}

  async getSystemFundsRaised() {
    const metrics = await this.adminService.getSystemMetrics();
    return {
      totalFundsRaisedUsd: metrics.totalFundsRaisedUsd,
      activeSponsorships: metrics.activeSponsorships,
    };
  }

  getTools() {
    return [
      this.getFundingSummaryTool ?? (this as any).initGetFundingSummaryTool?.(),
    ].filter(Boolean);
  }

  private initGetFundingSummaryTool() {
    const tool = new DynamicStructuredTool({
      name: 'get_funding_summary',
      description:
        'Retrieve funding totals and active sponsorship counts for platform-level analytics.',
      schema: z.object({}).strict(),
      func: async () => JSON.stringify(await this.getSystemFundsRaised()),
    });
    Object.defineProperty(this, 'getFundingSummaryTool', {
      value: tool,
      configurable: true,
      writable: false,
    });
    return tool;
  }
}
