import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChildrenTool } from './children.tool';
import { VolunteerService } from '../../modules/volunteer/volunteer.service';

@Injectable()
export class ReportsTool {
  readonly getChildReportsTool: DynamicStructuredTool;
  readonly getPendingReportsForRegionTool: DynamicStructuredTool;

  constructor(
    private readonly childrenTool: ChildrenTool,
    private readonly volunteerService: VolunteerService,
  ) {}

  async getChildReports(childId: string) {
    const child = await this.childrenTool.getChildById(childId);
    return child?.reports ?? [];
  }

  async getRegionalPendingReports(userId: string) {
    return this.volunteerService.getRegionChildren(userId);
  }

  getTools() {
    return [
      this.getChildReportsTool ?? (this as any).initGetChildReportsTool?.(),
      this.getPendingReportsForRegionTool ??
        (this as any).initGetPendingReportsForRegionTool?.(),
    ].filter(Boolean);
  }

  private initGetChildReportsTool() {
    const tool = new DynamicStructuredTool({
      name: 'get_child_reports',
      description:
        'Retrieve progress reports for a specific child to support NGO insights or volunteer credibility review.',
      schema: z.object({
        childId: z.string().uuid(),
      }),
      func: async ({ childId }) => JSON.stringify(await this.getChildReports(childId)),
    });
    Object.defineProperty(this, 'getChildReportsTool', {
      value: tool,
      configurable: true,
      writable: false,
    });
    return tool;
  }

  private initGetPendingReportsForRegionTool() {
    const tool = new DynamicStructuredTool({
      name: 'get_pending_reports_for_region',
      description:
        'Retrieve children with pending reports in the authenticated volunteer region for verification assistance.',
      schema: z.object({
        userId: z.string().uuid(),
      }),
      func: async ({ userId }) =>
        JSON.stringify(await this.getRegionalPendingReports(userId)),
    });
    Object.defineProperty(this, 'getPendingReportsForRegionTool', {
      value: tool,
      configurable: true,
      writable: false,
    });
    return tool;
  }
}
