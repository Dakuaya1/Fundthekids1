import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { GamificationService } from '../../modules/gamification/gamification.service';

@Injectable()
export class GamificationTool {
  readonly getSponsorLeaderboardTool: DynamicStructuredTool;
  readonly getSponsorOfWeekTool: DynamicStructuredTool;
  readonly getImpactProfileTool: DynamicStructuredTool;

  constructor(private readonly gamificationService: GamificationService) {}

  async getLeaderboard(limit?: number) {
    return this.gamificationService.getLeaderboard(limit);
  }

  async getSponsorOfWeek() {
    return this.gamificationService.getSponsorOfWeek();
  }

  async getImpactProfile(userId: string) {
    return this.gamificationService.getProfile(userId);
  }

  getTools() {
    return [
      this.getSponsorLeaderboardTool ??
        (this as any).initGetSponsorLeaderboardTool?.(),
      this.getSponsorOfWeekTool ?? (this as any).initGetSponsorOfWeekTool?.(),
      this.getImpactProfileTool ?? (this as any).initGetImpactProfileTool?.(),
    ].filter(Boolean);
  }

  private initGetSponsorLeaderboardTool() {
    const tool = new DynamicStructuredTool({
      name: 'get_sponsor_leaderboard',
      description:
        'Retrieve top sponsors by impact score for sponsor benchmarking and admin trend analysis.',
      schema: z.object({
        limit: z.number().int().positive().max(100).optional(),
      }),
      func: async ({ limit }) => JSON.stringify(await this.getLeaderboard(limit)),
    });
    Object.defineProperty(this, 'getSponsorLeaderboardTool', {
      value: tool,
      configurable: true,
      writable: false,
    });
    return tool;
  }

  private initGetSponsorOfWeekTool() {
    const tool = new DynamicStructuredTool({
      name: 'get_sponsor_of_week',
      description:
        'Retrieve the current sponsor of the week for sponsor impact summaries and recognition context.',
      schema: z.object({}).strict(),
      func: async () => JSON.stringify(await this.getSponsorOfWeek()),
    });
    Object.defineProperty(this, 'getSponsorOfWeekTool', {
      value: tool,
      configurable: true,
      writable: false,
    });
    return tool;
  }

  private initGetImpactProfileTool() {
    const tool = new DynamicStructuredTool({
      name: 'get_impact_profile',
      description:
        'Retrieve the authenticated user impact profile and badges for sponsor or volunteer role-aware responses.',
      schema: z.object({
        userId: z.string().uuid(),
      }),
      func: async ({ userId }) => JSON.stringify(await this.getImpactProfile(userId)),
    });
    Object.defineProperty(this, 'getImpactProfileTool', {
      value: tool,
      configurable: true,
      writable: false,
    });
    return tool;
  }
}
