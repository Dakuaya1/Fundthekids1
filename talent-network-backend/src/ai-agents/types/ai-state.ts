import { AiStep } from '../dto/ai-response.dto';

export interface ToolCallPlan {
  tool: string;
  args?: Record<string, unknown>;
  reason?: string;
}

export interface AnalysisFinding {
  category: string;
  summary: string;
  evidence: string[];
}

export interface AiGraphState {
  query: string;
  userId: string;
  role: string;
  plan: string[];
  toolCalls: ToolCallPlan[];
  toolResults: Record<string, unknown>;
  analysis: AnalysisFinding[];
  steps: AiStep[];
  result: string;
}
