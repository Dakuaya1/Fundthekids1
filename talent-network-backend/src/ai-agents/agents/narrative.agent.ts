import { Injectable } from '@nestjs/common';
import { generateText } from '../llm/google-llm';
import { NARRATIVE_SYSTEM_PROMPT } from '../prompts/narrative.prompt';
import { AiGraphState } from '../types/ai-state';

@Injectable()
export class NarrativeAgent {
  constructor() {}

  async run(state: AiGraphState): Promise<AiGraphState> {
    const result = await this.tryModelNarrative(state);

    return {
      ...state,
      result,
      steps: [
        ...state.steps,
        {
          agent: 'narrative',
          summary: 'Converted structured findings into a grounded response.',
        },
      ],
    };
  }

  private buildNarrative(state: AiGraphState) {
    const roleContext = `Role context: ${state.role}.`;
    return [roleContext]
      .concat(
        state.analysis
      .map((finding) => {
        const evidence = finding.evidence.length
          ? ` Evidence: ${finding.evidence.join('; ')}.`
          : '';
        return `${finding.summary}${evidence}`;
      }),
      )
      .join('\n\n');
  }

  private async tryModelNarrative(state: AiGraphState) {
    try {
      const prompt = `${NARRATIVE_SYSTEM_PROMPT}\n\nRole: ${state.role}\nUser ID: ${state.userId}\nQuery: ${state.query}\nFindings: ${JSON.stringify(state.analysis)}`;
      const response = await generateText(prompt);
      return response || this.buildNarrative(state);
    } catch {
      return this.buildNarrative(state);
    }
  }
}
