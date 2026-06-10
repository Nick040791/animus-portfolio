import { Task, AgentResponse } from './types';
import { runPlanner, runExecutor, runSafety } from './agents';
import chalk from 'chalk';

export async function orchestrateTask(taskDescription: string): Promise<string> {
  const task: Task = {
    id: Date.now().toString(36),
    description: taskDescription
  };

  console.log(chalk.bold.cyan(`\n=== ANIMUS ORCHESTRATION START ===`));
  console.log(chalk.gray(`Task: ${task.description}`));

  // Step 1: Planner
  const plannerResp = await runPlanner(task);
  console.log(chalk.white(`\nPlan:\n${plannerResp.output}`));

  // Step 2: Executor
  const executorResp = await runExecutor(task, plannerResp.output);
  console.log(chalk.white(`\nExecution Result:\n${executorResp.output}`));

  // Step 3: Safety Review
  const safetyResp = await runSafety(executorResp.output);
  console.log(chalk.white(`\nSafety Review: ${safetyResp.output}`));

  if (safetyResp.needsCorrection && safetyResp.corrections) {
    console.log(chalk.yellow(`\nApplying corrections: ${safetyResp.corrections}`));
    // Simple loop simulation
    const finalOutput = executorResp.output + '\n\nAdditional note: ' + safetyResp.corrections;
    console.log(chalk.green.bold('\n=== FINAL OUTPUT (after self-correction) ==='));
    console.log(finalOutput);
    return finalOutput;
  }

  console.log(chalk.green.bold('\n=== FINAL OUTPUT ==='));
  console.log(executorResp.output);
  return executorResp.output;
}
