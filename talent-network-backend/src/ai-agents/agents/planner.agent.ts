import { Injectable } from '@nestjs/common';
import { generateText } from '../llm/google-llm';
import { PLANNER_SYSTEM_PROMPT } from '../prompts/planner.prompt';
import { AiGraphState, ToolCallPlan } from '../types/ai-state';
import { AdminTool } from '../tools/admin.tool';
import { ChildrenTool } from '../tools/children.tool';
import { GamificationTool } from '../tools/gamification.tool';
import { PaymentsTool } from '../tools/payments.tool';
import { ReportsTool } from '../tools/reports.tool';
import { SponsorshipTool } from '../tools/sponsorship.tool';

@Injectable()
export class PlannerAgent {
  constructor(
    private readonly childrenTool: ChildrenTool,
    private readonly sponsorshipTool: SponsorshipTool,
    private readonly reportsTool: ReportsTool,
    private readonly paymentsTool: PaymentsTool,
    private readonly adminTool: AdminTool,
    private readonly gamificationTool: GamificationTool,
  ) {}

  async run(state: AiGraphState): Promise<AiGraphState> {
    const toolCalls = this.buildHeuristicPlan(state);
    const plan = toolCalls.map((call) => call.tool);
    const summary = await this.tryModelSummary(state, plan);

    return {
      ...state,
      plan,
      toolCalls,
      steps: [...state.steps, { agent: 'planner', summary }],
    };
  }

  private buildHeuristicPlan(state: AiGraphState): ToolCallPlan[] {
    const normalized = state.query.toLowerCase();
    const toolCalls: ToolCallPlan[] = [];
    const role = state.role?.toUpperCase() || 'UNKNOWN';

    if (role === 'ADMIN') {
      toolCalls.push({ tool: 'get_platform_admin_metrics', args: {} });
      toolCalls.push({ tool: 'get_funding_summary', args: {} });
      toolCalls.push({
        tool: 'get_user_directory',
        args: { page: 1, limit: 50, role: 'NGO' },
      });
      toolCalls.push({ tool: 'get_children_needing_support', args: { limit: 25 } });
    }

    if (role === 'NGO') {
      toolCalls.push({ tool: 'get_children_needing_support', args: { limit: 15 } });
      if (normalized.includes('report') || normalized.includes('progress')) {
        toolCalls.push({
          tool: 'get_child_profile',
          args: { childId: '00000000-0000-0000-0000-000000000000' },
          reason: 'placeholder-child-id',
        });
      }
    }

    if (role === 'SPONSOR') {
      toolCalls.push({ tool: 'get_sponsor_plans', args: { userId: state.userId } });
      toolCalls.push({ tool: 'get_impact_profile', args: { userId: state.userId } });
      toolCalls.push({ tool: 'get_children_needing_support', args: { limit: 10 } });
      if (normalized.includes('leaderboard') || normalized.includes('compare')) {
        toolCalls.push({ tool: 'get_sponsor_leaderboard', args: { limit: 10 } });
        toolCalls.push({ tool: 'get_sponsor_of_week', args: {} });
      }
    }

    if (role === 'VOLUNTEER') {
      toolCalls.push({
        tool: 'get_pending_reports_for_region',
        args: { userId: state.userId },
      });
      toolCalls.push({ tool: 'get_impact_profile', args: { userId: state.userId } });
    }

    if (toolCalls.length === 0) {
      if (
        normalized.includes('child') ||
        normalized.includes('fund') ||
        normalized.includes('support')
      ) {
        toolCalls.push({ tool: 'get_children_needing_support', args: { limit: 20 } });
      }
      if (
        normalized.includes('platform') ||
        normalized.includes('admin') ||
        normalized.includes('system')
      ) {
        toolCalls.push({ tool: 'get_platform_admin_metrics', args: {} });
        toolCalls.push({ tool: 'get_funding_summary', args: {} });
      }
      if (normalized.includes('impact') || normalized.includes('sponsor')) {
        toolCalls.push({ tool: 'get_sponsor_leaderboard', args: { limit: 10 } });
      }
    }

    const availableTools = new Set(this.getToolNames());
    return toolCalls
      .filter((call) => availableTools.has(call.tool))
      .filter((call) => !this.isPlaceholderCall(call));
  }

  private isPlaceholderCall(call: ToolCallPlan) {
    return (
      call.reason === 'placeholder-child-id' &&
      call.args?.childId === '00000000-0000-0000-0000-000000000000'
    );
  }

  private getToolNames() {
    return [
      ...this.childrenTool.getTools(),
      ...this.sponsorshipTool.getTools(),
      ...this.reportsTool.getTools(),
      ...this.paymentsTool.getTools(),
      ...this.adminTool.getTools(),
      ...this.gamificationTool.getTools(),
    ].map((tool) => tool.name);
  }

  private getToolDescriptions() {
    return [
      ...this.childrenTool.getTools(),
      ...this.sponsorshipTool.getTools(),
      ...this.reportsTool.getTools(),
      ...this.paymentsTool.getTools(),
      ...this.adminTool.getTools(),
      ...this.gamificationTool.getTools(),
    ].map((tool) => `${tool.name}: ${tool.description}`);
  }

  private async tryModelSummary(state: AiGraphState, plan: string[]) {
    const fallback = `Selected ${plan.join(', ') || 'no tools'} for the ${state.role} query.`;
    try {
      const prompt = `${PLANNER_SYSTEM_PROMPT}\n\nRole: ${state.role}\nUser ID: ${state.userId}\nQuery: ${state.query}\nTools:\n${this.getToolDescriptions().join('\n')}\nPlan: ${plan.join(', ')}`;
      const response = await generateText(prompt);
      return response || fallback;
    } catch {
      return fallback;
    }
  }
}
