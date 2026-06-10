# Animus Portfolio

**Sanitized, public-facing version of Animus** — a multi-agent AI orchestration platform.

> This is a cleaned portfolio edition. The full internal version includes production multi-tenant features, advanced agent squads, and proprietary workflows.

## Overview

Animus demonstrates reliable agentic systems with:
- **Hierarchical multi-agent teams** (Planner, Executor, Safety/Critic, Memory, etc.)
- **Strict self-correction and validation loops**
- **Tool-calling framework**
- **Beautiful CLI with custom ASCII art banners**
- **Designed for local inference** (Ollama, llama.cpp) and privacy-first deployments

This public version provides a working, self-contained demo of the core orchestration patterns using simulated agents. It is ideal for showcasing agent architecture, prompt engineering discipline, and clean TypeScript/Node CLI development.

## Features

- Polished terminal UX with colored output and ASCII banners
- Interactive demo mode that walks through a full agent workflow
- Extensible agent and tool interfaces
- Example of deterministic execution with review loops
- Documentation and examples ready for extension with real LLMs

## Quick Start

```bash
git clone https://github.com/Nick040791/animus-portfolio.git
cd animus-portfolio
npm install

# Run the interactive demo
npm run demo
```

### With Real LLM Backend (Optional)

1. Install and run Ollama: `ollama serve` and pull a model e.g. `ollama pull qwen2.5`
2. Update `src/config.ts` or environment with your endpoint
3. The architecture supports easy swapping of the LLM client.

## Architecture

```
User Task
   |
   v
Orchestrator
   |
   +--> Planner Agent (decomposes task, creates plan)
   |       |
   v       v
Executor Agent (selects & calls tools, performs steps)
   |
   v
Safety / Critic Agent (validates output, suggests corrections)
   |       ^
   |       | (loop if issues)
   +-------+
   |
   v
Final Output + Memory Update
```

**Key Principles**:
- Separation of concerns via specialized agents
- Explicit validation and self-correction
- Tool use with structured schemas
- Observable, deterministic flows for reliability

## Demo Walkthrough

The `npm run demo` command runs a sample task (e.g., "Research and summarize best practices for local AI deployment for SMBs") through the full pipeline, printing each agent's reasoning and actions with nice formatting.

You can also run custom tasks interactively.

## Project Structure

```
animus-portfolio/
├── src/
│   ├── cli.ts          # Entry point and command handling
│   ├── orchestrator.ts # Main coordination logic
│   ├── agents/         # Planner, Executor, Safety implementations
│   ├── tools/          # Example tool definitions and registry
│   └── types.ts        # Shared interfaces
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## Extending

- Add real LLM integration in `src/llm.ts` (OpenAI compatible or Ollama)
- Register new tools in the tool registry
- Create new specialized agents by extending the base Agent class
- Add memory/RAG layer for production use

## Full Version

The complete Animus platform (private) includes:
- Multi-tenant subscription hosting
- Advanced agent handoff protocols
- Production-grade execution hardening
- Integration with Kanga enterprise workflows
- Custom CLI banners and rich visuals

Contact for demos or collaboration on full deployments.

## License

MIT License

Copyright (c) 2026 Nicholas Beighley / KC Optimal Computing LLC

See LICENSE for details.
