import { describe, it, expect } from 'vitest';
import { orchestrateTask } from '../src/orchestrator';
import { getTool } from '../src/tools';

// Basic tests for the Animus portfolio demo

describe('Tools', () => {
  it('should return a tool by name', () => {
    const tool = getTool('web_search');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('web_search');
  });

  it('should return undefined for unknown tool', () => {
    const tool = getTool('nonexistent_tool');
    expect(tool).toBeUndefined();
  });

  it('web_search tool should return a string result', () => {
    const tool = getTool('web_search');
    const result = tool?.execute({ query: 'test query' });
    expect(typeof result).toBe('string');
    expect(result).toContain('Mock search results');
  });
});

describe('Orchestrator', () => {
  it('should process a valid task and return a string output', async () => {
    const result = await orchestrateTask('Test task for local AI best practices');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle empty task gracefully with error message', async () => {
    const result = await orchestrateTask('');
    expect(result).toContain('Error processing task');
  });

  it('should handle very short task with self-correction logic', async () => {
    const result = await orchestrateTask('AI');
    expect(typeof result).toBe('string');
  });
});

// Note: Full agent mocking can be added for more isolated tests.
// These integration-style tests verify the happy path and error paths work.
