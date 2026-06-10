import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'readline';
import { orchestrateTask } from './orchestrator';

// Custom ASCII Banner for ANIMUS (portfolio version)
const banner = `
${chalk.cyan('╔════════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('A N I M U S')}                                           ${chalk.cyan('║')}
${chalk.cyan('║')}  Multi-Agent AI Orchestration Platform                    ${chalk.cyan('║')}
${chalk.cyan('║')}  Portfolio Edition • Privacy-First • Deterministic          ${chalk.cyan('║')}
${chalk.cyan('╚════════════════════════════════════════════════════════════╝')}
`;

function printBanner() {
  console.log(banner);
  console.log(chalk.gray('CLI demo for hierarchical agents, self-correction, and tool use.\n'));
}

const program = new Command();

program
  .name('animus')
  .description('Animus Portfolio CLI - Multi-agent orchestration demo')
  .version('0.1.0');

program
  .command('demo')
  .description('Run the built-in sample task through full agent pipeline')
  .action(async () => {
    try {
      printBanner();
      const sampleTask = 'Research and summarize best practices for local AI inference and multi-agent systems for small businesses in Kansas City.';
      await orchestrateTask(sampleTask);
      console.log(chalk.gray('\nDemo complete. Try "animus run <your task>" or interactive mode.'));
    } catch (error) {
      console.error(chalk.red(`Demo failed: ${error}`));
    }
  });

program
  .command('run <task...>')
  .description('Run orchestration on a custom task description')
  .action(async (taskParts: string[]) => {
    try {
      printBanner();
      const task = taskParts.join(' ');
      if (!task || task.trim().length === 0) {
        console.log(chalk.red('Please provide a non-empty task description.'));
        return;
      }
      await orchestrateTask(task);
    } catch (error) {
      console.error(chalk.red(`Run command failed: ${error}`));
    }
  });

program
  .command('interactive')
  .description('Start interactive mode for multiple tasks')
  .action(async () => {
    try {
      printBanner();
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      console.log(chalk.yellow('Interactive mode. Type your task or "exit" to quit.\n'));

      const ask = () => {
        rl.question(chalk.bold('Task> '), async (input) => {
          try {
            if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
              rl.close();
              console.log(chalk.gray('Goodbye!'));
              return;
            }
            if (input.trim()) {
              await orchestrateTask(input.trim());
            } else {
              console.log(chalk.yellow('Please enter a task description.'));
            }
          } catch (error) {
            console.error(chalk.red(`Error processing task: ${error}`));
          }
          ask();
        });
      };

      ask();
    } catch (error) {
      console.error(chalk.red(`Interactive mode failed to start: ${error}`));
    }
  });

// Default action if no command
if (process.argv.length === 2) {
  printBanner();
  console.log(chalk.gray('Usage: animus demo | animus run "your task" | animus interactive'));
  console.log(chalk.gray('Or: npx ts-node src/cli.ts demo'));
}

program.parse(process.argv);
