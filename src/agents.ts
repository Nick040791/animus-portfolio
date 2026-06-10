import { Task, AgentResponse } from './types';
import { getTool } from './tools';
import chalk from 'chalk';

// Simple simulated LLM response generator for demo (replace with real LLM call in full version)
function simulateLLM(prompt: string, role: string): string {
  try {
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
  } catch (error) {
    console.error(chalk.red(`[simulateLLM Error] ${error}`));
    return 'Error generating response. Using fallback plan.';
  }
}

export async function runPlanner(task: Task): Promise<AgentResponse> {
  try {
    console.log(chalk.blue('\n[PLANNER] Decomposing task...'));
    const reasoning = simulateLLM(task.description, 'planner');
    const plan = `1. Research current best practices\n2. Analyze privacy and deployment options\n3. Summarize actionable recommendations\n4. Estimate impact`;
    return {
      agent: 'Planner',
      reasoning,
      output: plan,
      confidence: 0.92
    };
  } catch (error) {
    console.error(chalk.red(`[Planner Error] Failed to plan task: ${error}`));
    return {
      agent: 'Planner',
      reasoning: 'Error during planning. Using default plan.',
      output: '1. Research topic\n2. Summarize findings\n3. Provide recommendations',
      confidence: 0.5
    };
  }
}

export async function runExecutor(task: Task, plan: string): Promise<AgentResponse> {
  try {
    console.log(chalk.green('\n[EXECUTOR] Executing plan...'));
    const tool = getTool('web_search');
    let searchResult = 'No tool available';
    if (tool) {
      try {
        searchResult = await tool.execute({ query: task.description });
      } catch (toolError) {
        console.error(chalk.red(`[Tool Error] web_search failed: ${toolError}`));
        searchResult = 'Tool execution failed. Using fallback data.';
      }
    }
    const summaryTool = getTool('summarize');
    const summary = summaryTool
      ? await summaryTool.execute({ text: searchResult + ' ' + plan, maxLength: 300 })
      : plan;
    return {
      agent: 'Executor',
      reasoning: 'Used web_search and summarize tools to gather and condense information.',
      output: summary,
      confidence: 0.88
    };
  } catch (error) {
    console.error(chalk.red(`[Executor Error] ${error}`));
    return {
      agent: 'Executor',
      reasoning: 'Error during execution. Using fallback output.',
      output: 'Execution encountered an issue. Basic summary: ' + plan,
      confidence: 0.4
    };
  }
}

export async function runSafety(output: string): Promise<AgentResponse> {
  try {
    console.log(chalk.yellow('\n[SAFETY] Reviewing output...'));
    const needsReview = output.length < 100 || !output.toLowerCase().includes('privacy');
    return {
      agent: 'Safety',
      reasoning: 'Checked for completeness, privacy mentions, and actionability.',
      output: needsReview ? 'Output looks good but could include more specific local inference examples.' : output,
      confidence: needsReview ? 0.75 : 0.91,
      needsCorrection: needsReview,
      corrections: needsReview ? 'Add 1-2 concrete local deployment examples.' : undefined
    };
  } catch (error) {
    console.error(chalk.red(`[Safety Error] ${error}`));
    return {
      agent: 'Safety',
      reasoning: 'Error during safety review. Assuming output is acceptable.',
      output: output,
      confidence: 0.6
    };
  }
}
