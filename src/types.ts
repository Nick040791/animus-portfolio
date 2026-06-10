export interface Task {
  id: string;
  description: string;
  context?: string;
}

export interface Step {
  id: string;
  description: string;
  agent: string;
  status: 'pending' | 'in_progress' | 'completed' | 'needs_review';
  output?: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  tool: string;
  args: Record<string, any>;
  result?: string;
}

export interface AgentResponse {
  agent: string;
  reasoning: string;
  output: string;
  confidence: number; // 0-1
  needsCorrection?: boolean;
  corrections?: string;
}

export interface Tool {
  name: string;
  description: string;
  schema: Record<string, any>;
  execute: (args: Record<string, any>) => Promise<string> | string;
}
