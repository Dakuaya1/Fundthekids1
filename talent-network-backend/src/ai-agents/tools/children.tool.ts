import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChildrenService } from '../../modules/children/children.service';

@Injectable()
export class ChildrenTool {
  readonly getChildrenNeedingSupportTool: DynamicStructuredTool;
  readonly getChildProfileTool: DynamicStructuredTool;

  constructor(private readonly childrenService: ChildrenService) {}

  async listActiveChildren() {
    return this.childrenService.findAll();
  }

  async getChildById(id: string) {
    return this.childrenService.findOne(id);
  }

  getTools() {
    return [
      this.getChildrenNeedingSupportTool ??
        (this as any).initGetChildrenNeedingSupportTool?.(),
      this.getChildProfileTool ?? (this as any).initGetChildProfileTool?.(),
    ].filter(Boolean);
  }

  private initGetChildrenNeedingSupportTool() {
    const tool = new DynamicStructuredTool({
      name: 'get_children_needing_support',
      description:
        'Retrieve active children, their NGO context, and a limited list for funding-gap analysis or sponsor recommendations.',
      schema: z.object({
        limit: z.number().int().positive().max(100).optional(),
      }),
      func: async ({ limit }) => {
        const children = await this.listActiveChildren();
        const sliced = limit ? children.slice(0, limit) : children;
        return JSON.stringify(sliced);
      },
    });
    Object.defineProperty(this, 'getChildrenNeedingSupportTool', {
      value: tool,
      configurable: true,
      writable: false,
    });
    return tool;
  }

  private initGetChildProfileTool() {
    const tool = new DynamicStructuredTool({
      name: 'get_child_profile',
      description:
        'Retrieve the full profile and reports for a specific child by id when deeper review is needed.',
      schema: z.object({
        childId: z.string().uuid(),
      }),
      func: async ({ childId }) => JSON.stringify(await this.getChildById(childId)),
    });
    Object.defineProperty(this, 'getChildProfileTool', {
      value: tool,
      configurable: true,
      writable: false,
    });
    return tool;
  }
}
