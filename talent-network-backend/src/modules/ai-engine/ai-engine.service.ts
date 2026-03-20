import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface IAIEngine {
  generateProgressSummary(
    childId: string,
    rawReports: string[],
  ): Promise<string>;
  analyzeSentiment(text: string): Promise<number>; // Score from 0 to 1
}

@Injectable()
export class AiEngineService implements IAIEngine {
  constructor(private prisma: PrismaService) {}

  async generateProgressSummary(
    childId: string,
    rawReports: string[],
  ): Promise<string> {
    // In a real environment, you would inject an OpenAI/Anthropic client here.
    // For this demo, we use a sophisticated semantic mock to simulate AI summarization.

    const combinedText = rawReports.join(' ');

    let summaryContext = 'making steady progress';
    if (
      combinedText.toLowerCase().includes('excellent') ||
      combinedText.toLowerCase().includes('great')
    ) {
      summaryContext = 'excelling rapidly and showing remarkable dedication';
    } else if (
      combinedText.toLowerCase().includes('struggle') ||
      combinedText.toLowerCase().includes('help')
    ) {
      summaryContext =
        'facing some current challenges but working hard to overcome them';
    }

    const aiSummary = `AI Generated Insight: Based on the latest updates, the student is ${summaryContext}. Continued support is highly recommended to maintain this trajectory.`;

    return aiSummary;
  }

  async analyzeSentiment(text: string): Promise<number> {
    // Semantic mock for sentiment analysis
    if (
      text.toLowerCase().includes('excellent') ||
      text.toLowerCase().includes('happy')
    )
      return 0.9;
    if (
      text.toLowerCase().includes('sad') ||
      text.toLowerCase().includes('struggle')
    )
      return 0.3;
    return 0.6; // Neutral
  }
}
