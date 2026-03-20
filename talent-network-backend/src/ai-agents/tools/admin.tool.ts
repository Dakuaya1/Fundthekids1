import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { AdminService } from '../../modules/admin/admin.service';

@Injectable()
export class AdminTool {
  readonly getPlatformAdminMetricsTool: DynamicStructuredTool;
  readonly getUserDirectoryTool: DynamicStructuredTool;

  constructor(private readonly adminService: AdminService) {}

  async getSystemMetrics() {
    return this.adminService.getSystemMetrics();
  }

  async getUsers(page = 1, limit = 50, role?: string) {
    return this.adminService.getUsers(page, limit, role);
  }

  getTools() {
    return [
      this.getPlatformAdminMetricsTool ??
        (this as any).initGetPlatformAdminMetricsTool?.(),
      this.getUserDirectoryTool ?? (this as any).initGetUserDirectoryTool?.(),
    ].filter(Boolean);
  }

  private initGetPlatformAdminMetricsTool() {
    const tool = new DynamicStructuredTool({
      name: 'get_platform_admin_metrics',
      description:
        'Retrieve admin-level platform metrics including total users, active sponsorships, and funds raised.',
      schema: z.object({}).strict(),
      func: async () => JSON.stringify(await this.getSystemMetrics()),
    });
    Object.defineProperty(this, 'getPlatformAdminMetricsTool', {
      value: tool,
      configurable: true,
      writable: false,
    });
    return tool;
  }

  private initGetUserDirectoryTool() {
    const tool = new DynamicStructuredTool({
      name: 'get_user_directory',
      description:
        'Retrieve a paginated user list with optional role filter for admin review, NGO verification checks, or sponsor inactivity review.',
      schema: z.object({
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().max(100).optional(),
        role: z.string().optional(),
      }),
      func: async ({ page, limit, role }) =>
        JSON.stringify(await this.getUsers(page, limit, role)),
    });
    Object.defineProperty(this, 'getUserDirectoryTool', {
      value: tool,
      configurable: true,
      writable: false,
    });
    return tool;
  }
}
