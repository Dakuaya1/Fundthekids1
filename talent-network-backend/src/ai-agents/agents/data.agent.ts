import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { AdminTool } from '../tools/admin.tool';
import { ChildrenTool } from '../tools/children.tool';
import { GamificationTool } from '../tools/gamification.tool';
import { PaymentsTool } from '../tools/payments.tool';
import { ReportsTool } from '../tools/reports.tool';
import { SponsorshipTool } from '../tools/sponsorship.tool';
import { AiGraphState, ToolCallPlan } from '../types/ai-state';

@Injectable()
export class DataAgent {
  private readonly toolRegistry: Map<string, DynamicStructuredTool>;

  constructor(
    private readonly childrenTool: ChildrenTool,
    private readonly sponsorshipTool: SponsorshipTool,
    private readonly reportsTool: ReportsTool,
    private readonly paymentsTool: PaymentsTool,
    private readonly adminTool: AdminTool,
    private readonly gamificationTool: GamificationTool,
  ) {
    this.toolRegistry = new Map(
      [
        ...this.childrenTool.getTools(),
        ...this.sponsorshipTool.getTools(),
        ...this.reportsTool.getTools(),
        ...this.paymentsTool.getTools(),
        ...this.adminTool.getTools(),
        ...this.gamificationTool.getTools(),
      ].map((tool) => [tool.name, tool]),
    );
  }

  async run(state: AiGraphState): Promise<AiGraphState> {
    const toolResults: Record<string, unknown> = {};

    for (const call of state.toolCalls) {
      toolResults[call.tool] = await this.executeCall(call);
    }

    const summary = `Executed ${Object.keys(toolResults).length} read-only tool calls.`;

    return {
      ...state,
      toolResults,
      steps: [...state.steps, { agent: 'data', summary }],
    };
  }

  private async executeCall(call: ToolCallPlan) {
    const tool = this.toolRegistry.get(call.tool);
    if (!tool) {
      return null;
    }

    const raw = await tool.invoke(call.args || {});
    if (typeof raw !== 'string') {
      return raw;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
}
