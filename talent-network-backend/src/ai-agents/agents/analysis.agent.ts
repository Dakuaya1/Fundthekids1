import { Injectable } from '@nestjs/common';
import { generateText } from '../llm/google-llm';
import { ANALYSIS_SYSTEM_PROMPT } from '../prompts/analysis.prompt';
import { AiGraphState, AnalysisFinding } from '../types/ai-state';

@Injectable()
export class AnalysisAgent {
  constructor() {}

  async run(state: AiGraphState): Promise<AiGraphState> {
    const findings = this.buildFindings(state.toolResults);
    const summary = await this.tryModelSummary(state, findings);

    return {
      ...state,
      analysis: findings,
      steps: [...state.steps, { agent: 'analysis', summary }],
    };
  }

  private buildFindings(toolResults: Record<string, unknown>): AnalysisFinding[] {
    const findings: AnalysisFinding[] = [];
    const children = Array.isArray(toolResults['get_children_needing_support'])
      ? (toolResults['get_children_needing_support'] as any[])
      : [];
    const leaderboard = Array.isArray(toolResults['get_sponsor_leaderboard'])
      ? (toolResults['get_sponsor_leaderboard'] as any[])
      : [];
    const metrics = (toolResults['get_platform_admin_metrics'] || {}) as Record<string, any>;
    const payments = (toolResults['get_funding_summary'] || {}) as Record<
      string,
      any
    >;
    const usersPayload = (toolResults['get_user_directory'] || {}) as Record<string, any>;
    const sponsorPlans = Array.isArray(toolResults['get_sponsor_plans'])
      ? (toolResults['get_sponsor_plans'] as any[])
      : [];
    const impactProfile = (toolResults['get_impact_profile'] || null) as Record<
      string,
      any
    > | null;
    const pendingReports = Array.isArray(toolResults['get_pending_reports_for_region'])
      ? (toolResults['get_pending_reports_for_region'] as any[])
      : [];
    const users = Array.isArray(usersPayload.data) ? usersPayload.data : [];

    const unsupportedChildren = children.filter((child) => !child.plans?.length);
    if (unsupportedChildren.length > 0) {
      findings.push({
        category: 'childrenNeedingFunding',
        summary: `${unsupportedChildren.length} active children do not expose existing sponsorship plans in the retrieved payload and should be reviewed for funding outreach.`,
        evidence: unsupportedChildren
          .slice(0, 5)
          .map((child) => `${child.name} (${child.talentCategory})`),
      });
    }

    const unverifiedNgos = users.filter(
      (user) => user.role === 'NGO' && user.ngo?.verifiedStatus === false,
    );
    if (unverifiedNgos.length > 0) {
      findings.push({
        category: 'suspiciousActivity',
        summary: `${unverifiedNgos.length} NGO accounts remain unverified and should be reviewed.`,
        evidence: unverifiedNgos
          .slice(0, 5)
          .map((user) => `${user.email} (${user.ngo?.name || 'Unknown NGO'})`),
      });
    }

    if (leaderboard.length > 0) {
      const lowActivity = leaderboard.filter((entry) => (entry.impactScore || 0) < 100);
      findings.push({
        category: 'inactiveSponsors',
        summary: `${lowActivity.length} sponsors in the leaderboard have impact scores below 100, indicating possible inactivity.`,
        evidence: lowActivity
          .slice(0, 5)
          .map((entry) => `${entry.user?.email || entry.id}: ${entry.impactScore} pts`),
      });
    }

    if (sponsorPlans.length > 0) {
      findings.push({
        category: 'sponsorPortfolio',
        summary: `Authenticated sponsor currently has ${sponsorPlans.length} sponsorship plans available for impact review.`,
        evidence: sponsorPlans
          .slice(0, 5)
          .map((plan) => `${plan.child?.name || plan.id}: ${plan.amount} USD ${plan.type}`),
      });
    }

    if (impactProfile) {
      findings.push({
        category: 'impactProfile',
        summary: `Authenticated user has an impact score of ${impactProfile.impactScore || 0} and ${impactProfile.badges?.length || 0} badges.`,
        evidence: (impactProfile.badges || [])
          .slice(0, 5)
          .map((badge: any) => badge.name),
      });
    }

    if (pendingReports.length > 0) {
      const pendingCount = pendingReports.reduce(
        (count, child: any) => count + (child.reports?.length || 0),
        0,
      );
      findings.push({
        category: 'pendingVerifications',
        summary: `Volunteer region currently has ${pendingCount} pending reports requiring verification attention.`,
        evidence: pendingReports
          .slice(0, 5)
          .map((child: any) => `${child.name}: ${child.reports?.length || 0} pending reports`),
      });
    }

    if (metrics.activeSponsorships !== undefined || payments.totalFundsRaisedUsd !== undefined) {
      findings.push({
        category: 'platformHealth',
        summary: `Platform currently shows ${metrics.activeSponsorships || 0} active sponsorships and ${payments.totalFundsRaisedUsd || 0} USD raised.`,
        evidence: [
          `active sponsorships: ${metrics.activeSponsorships || 0}`,
          `funds raised: ${payments.totalFundsRaisedUsd || 0} USD`,
        ],
      });
    }

    if (findings.length === 0) {
      findings.push({
        category: 'overview',
        summary: 'Retrieved data did not expose a strong anomaly; the query can be answered with a general platform overview.',
        evidence: ['No urgent issues found in the selected tool outputs.'],
      });
    }

    return findings;
  }

  private async tryModelSummary(state: AiGraphState, findings: AnalysisFinding[]) {
    const fallback = `Produced ${findings.length} grounded findings for the ${state.role} context.`;
    try {
      const prompt = `${ANALYSIS_SYSTEM_PROMPT}\n\nRole: ${state.role}\nUser ID: ${state.userId}\nQuery: ${state.query}\nFindings: ${JSON.stringify(findings)}`;
      const response = await generateText(prompt);
      return response || fallback;
    } catch {
      return fallback;
    }
  }
}
