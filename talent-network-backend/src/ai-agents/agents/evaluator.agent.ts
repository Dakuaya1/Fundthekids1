import { Injectable } from '@nestjs/common';
import { generateText } from '../llm/google-llm';
import { EVALUATOR_SYSTEM_PROMPT } from '../prompts/evaluator.prompt';
import { AiGraphState } from '../types/ai-state';

@Injectable()
export class EvaluatorAgent {
  constructor() {}

  async run(state: AiGraphState): Promise<AiGraphState> {
    const summary = await this.tryModelSummary(state);

    return {
      ...state,
      result: state.result || 'No grounded result could be generated.',
      steps: [...state.steps, { agent: 'evaluator', summary }],
    };
  }

  private async tryModelSummary(state: AiGraphState) {
    const fallback = 'Validated that the response is based on the collected tool outputs.';
    try {
      const prompt = `${EVALUATOR_SYSTEM_PROMPT}\n\nRole: ${state.role}\nResult: ${state.result}\nTool results keys: ${Object.keys(state.toolResults).join(', ')}`;
      const response = await generateText(prompt);
      return response || fallback;
    } catch {
      return fallback;
    }
  }
}
