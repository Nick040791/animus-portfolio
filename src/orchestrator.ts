import { Task, AgentResponse } from './types';
import { runPlanner, runExecutor, runSafety } from './agents';
import chalk from 'chalk';

export async function orchestrateTask(taskDescription: string): Promise<string> {
  try {
    if (!taskDescription || taskDescription.trim().length === 0) {
      throw new Error('Task description cannot be empty.');
    }

    const task: Task = {
      id: Date.now().toString(36),
      description: taskDescription.trim()
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

    let finalOutput = executorResp.output;

    if (safetyResp.needsCorrection && safetyResp.corrections) {
      console.log(chalk.yellow(`\nApplying corrections: ${safetyResp.corrections}`));
      finalOutput = executorResp.output + '\n\nAdditional note: ' + safetyResp.corrections;
      console.log(chalk.green.bold('\n=== FINAL OUTPUT (after self-correction) ==='));
    } else {
      console.log(chalk.green.bold('\n=== FINAL OUTPUT ==='));
    }

    console.log(finalOutput);
    return finalOutput;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red.bold(`\n[ORCHESTRATOR ERROR] ${errorMessage}`));
    console.log(chalk.yellow('Falling back to basic response due to error.'));
    return `Error processing task: ${errorMessage}. Please try a different task or check system configuration.`;
  }
}
