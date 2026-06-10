import { Tool } from './types';

export const tools: Tool[] = [
  {
    name: 'web_search',
    description: 'Search the web for information (mock in this demo)',
    schema: { query: 'string' },
    execute: (args) => {
      const query = args.query || 'general AI best practices';
      return `Mock search results for "${query}": Key findings include privacy-first local inference, hierarchical agents for reliability, and measurable ROI for SMB deployments. Sources: industry reports 2025-2026.`;
    }
  },
  {
    name: 'summarize',
    description: 'Summarize provided text',
    schema: { text: 'string', maxLength: 'number' },
    execute: (args) => {
      const text = args.text || '';
      const max = args.maxLength || 200;
      return text.length > max ? text.substring(0, max) + '...' : text;
    }
  },
  {
    name: 'calculate_impact',
    description: 'Estimate time/ROI impact (demo)',
    schema: { task: 'string', baselineHours: 'number' },
    execute: (args) => {
      const baseline = args.baselineHours || 4;
      const savings = Math.floor(baseline * 0.7);
      return `Estimated time savings: ${savings} hours (${Math.round((savings / baseline) * 100)}% reduction). ROI positive for most SMB use cases.`;
    }
  }
];

export function getTool(name: string): Tool | undefined {
  return tools.find(t => t.name === name);
}
