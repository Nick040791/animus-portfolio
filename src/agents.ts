import { Task, Step, AgentResponse, ToolCall } from './types';
import { getTool } from './tools';
import chalk from 'chalk';

// Simple simulated LLM response generator for demo (replace with real LLM call in full version)
function simulateLLM(prompt: string, role: string): string {
  if (role === 'planner') {
    return `Break down the task into 3-4 clear, actionable steps focused on research, analysis, and actionable recommendations. Prioritize privacy and practicality.`;
  }
  if (role === 'executor') {
    return `Execute steps using available tools. Call web_search for latest info, then summarize key points.`;
  }
  if (role === 'safety') {
    return `Review output for accuracy, completeness, and alignment with privacy-first principles. Suggest improvements if confidence < 0.85.`;
  }
  return 'Process the input according to role guidelines.';
}

export async function runPlanner(task: Task): Promise<AgentResponse> {
  console.log(chalk.blue('\n[PLANNER] Decomposing task...'));
  const reasoning = simulateLLM(task.description, 'planner');
  const plan = `1. Research current best practices\n2. Analyze privacy and deployment options\n3. Summarize actionable recommendations\n4. Estimate impact`;
  return {
    agent: 'Planner',
    reasoning,
    output: plan,
    confidence: 0.92
  };
}

export async function runExecutor(task: Task, plan: string): Promise<AgentResponse> {
  console.log(chalk.green('\n[EXECUTOR] Executing plan...'));
  const tool = getTool('web_search');
  const searchResult = tool ? tool.execute({ query: task.description }) : 'No tool available';
  const summaryTool = getTool('summarize');
  const summary = summaryTool ? summaryTool.execute({ text: searchResult + ' ' + plan, maxLength: 300 }) : plan;
  return {
    agent: 'Executor',
    reasoning: 'Used web_search and summarize tools to gather and condense information.',
    output: summary,
    confidence: 0.88,
    toolCalls: [{ tool: 'web_search', args: { query: task.description } }]
  };
}

export async function runSafety(output: string): Promise<AgentResponse> {
  console.log(chalk.yellow('\n[SAFETY] Reviewing output...'));
  const needsReview = output.length < 100 || !output.includes('privacy');
  return {
    agent: 'Safety',
    reasoning: 'Checked for completeness, privacy mentions, and actionability.',
    output: needsReview ? 'Output looks good but could include more specific local inference examples.' : output,
    confidence: needsReview ? 0.75 : 0.91,
    needsCorrection: needsReview,
    corrections: needsReview ? 'Add 1-2 concrete local deployment examples.' : undefined
  };
}
