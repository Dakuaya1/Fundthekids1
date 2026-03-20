import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { SponsorshipService } from '../../modules/sponsorship/sponsorship.service';

@Injectable()
export class SponsorshipTool {
  readonly getSponsorPlansTool: DynamicStructuredTool;

  constructor(private readonly sponsorshipService: SponsorshipService) {}

  async getSponsorPlans(userId: string) {
    return this.sponsorshipService.getMyPlans(userId);
  }

  getTools() {
    return [
      this.getSponsorPlansTool ?? (this as any).initGetSponsorPlansTool?.(),
    ].filter(Boolean);
  }

  private initGetSponsorPlansTool() {
    const tool = new DynamicStructuredTool({
      name: 'get_sponsor_plans',
      description:
        'Retrieve the authenticated sponsor plan portfolio to summarize impact or identify uncovered children.',
      schema: z.object({
        userId: z.string().uuid(),
      }),
      func: async ({ userId }) => JSON.stringify(await this.getSponsorPlans(userId)),
    });
    Object.defineProperty(this, 'getSponsorPlansTool', {
      value: tool,
      configurable: true,
      writable: false,
    });
    return tool;
  }
}
