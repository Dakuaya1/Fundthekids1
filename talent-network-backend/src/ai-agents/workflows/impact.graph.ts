import { Injectable } from '@nestjs/common';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { AnalysisAgent } from '../agents/analysis.agent';
import { DataAgent } from '../agents/data.agent';
import { EvaluatorAgent } from '../agents/evaluator.agent';
import { NarrativeAgent } from '../agents/narrative.agent';
import { PlannerAgent } from '../agents/planner.agent';
import { AiGraphState } from '../types/ai-state';

const ImpactGraphAnnotation = Annotation.Root({
  query: Annotation<string>,
  userId: Annotation<string>,
  role: Annotation<string>,
  plan: Annotation<string[]>({
    reducer: (_, right) => right,
    default: () => [],
  }),
  toolCalls: Annotation<any[]>({
    reducer: (_, right) => right,
    default: () => [],
  }),
  toolResults: Annotation<Record<string, unknown>>({
    reducer: (_, right) => right,
    default: () => ({}),
  }),
  analysis: Annotation<any[]>({
    reducer: (_, right) => right,
    default: () => [],
  }),
  steps: Annotation<any[]>({
    reducer: (_, right) => right,
    default: () => [],
  }),
  result: Annotation<string>({
    reducer: (_, right) => right,
    default: () => '',
  }),
});

@Injectable()
export class ImpactGraphWorkflow {
  constructor(
    private readonly plannerAgent: PlannerAgent,
    private readonly dataAgent: DataAgent,
    private readonly analysisAgent: AnalysisAgent,
    private readonly narrativeAgent: NarrativeAgent,
    private readonly evaluatorAgent: EvaluatorAgent,
  ) {}

  async run(query: string, userId: string, role: string): Promise<AiGraphState> {
    const graph = new StateGraph(ImpactGraphAnnotation)
      .addNode('planner', async (state: AiGraphState) =>
        this.plannerAgent.run(state),
      )
      .addNode('data', async (state: AiGraphState) => this.dataAgent.run(state))
      .addNode('analysisNode', async (state: AiGraphState) =>
        this.analysisAgent.run(state),
      )
      .addNode('narrative', async (state: AiGraphState) =>
        this.narrativeAgent.run(state),
      )
      .addNode('evaluator', async (state: AiGraphState) =>
        this.evaluatorAgent.run(state),
      )
      .addEdge(START, 'planner')
      .addEdge('planner', 'data')
      .addEdge('data', 'analysisNode')
      .addEdge('analysisNode', 'narrative')
      .addEdge('narrative', 'evaluator')
      .addEdge('evaluator', END)
      .compile();

    return graph.invoke({
      query,
      userId,
      role,
      plan: [],
      toolCalls: [],
      toolResults: {},
      analysis: [],
      steps: [],
      result: '',
    });
  }
}
