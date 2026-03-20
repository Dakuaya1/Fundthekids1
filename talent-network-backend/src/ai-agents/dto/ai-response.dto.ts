export interface AiStep {
  agent: string;
  summary: string;
}

export interface AiResponseDto {
  steps: AiStep[];
  result: string;
}
