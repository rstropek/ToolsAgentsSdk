# Sensor Chatbot — OpenAI Agents SDK Workshop

A small TypeScript console chatbot built with the
[OpenAI Agents SDK](https://openai.github.io/openai-agents-js/) used as a
hands-on workshop. Each increment introduces one new SDK concept so the
mechanics stay isolated and easy to discuss.

The domain is intentionally trivial — a few fake temperature sensors with
deterministic hourly readings — so attention stays on *how the agent
works*, not on the data.

Each increment lives on its own branch (`increment1` … `increment5`) and
builds on the previous one. Check out any branch to see the state of the
code at that learning step.

## Prerequisites

- Node.js 20+
- An OpenAI API key (`OPENAI_API_KEY`)

## Install

```bash
npm install
cp .env.example .env   # then edit and set OPENAI_API_KEY
```

## Run

```bash
npm run dev                              # interactive REPL
npm run dev -- --prompt "List sensors"   # single-shot
npm run check                            # format, typecheck, lint
```

## Increments — what each one teaches

### Increment 0 — Project skeleton (`main`)

The starting point: toolchain only. Useful as a reference for *what the
SDK does **not** require* — no build step, no framework, just a
TypeScript file you can `tsx`.

### Increment 1 — Your first agent and your first tool (`increment1`)

The core loop of the SDK: define an `Agent`, give it a `tool`, `run` it,
observe the result. Along the way:

- **Function tools** as Zod-validated TypeScript functions — the SDK
  turns them into the JSON schema the model sees.
- **Tool-call lifecycle events** (`agent_tool_start` / `agent_tool_end`)
  and why subscribing to them is the easiest way to *see* what the agent
  is doing.
- **Conversation state**: who owns it? The SDK lets you keep history
  locally *or* delegate to OpenAI via `previousResponseId` /
  Conversations API. We keep it local on purpose so the trade-off is
  visible and inspectable (`/state` slash command).

### Increment 2 — Parallel tool calls (`increment2`)

A second tool turns a single-tool toy into something that demonstrates
how modern models batch work. Key takeaway: *you don't ask for parallel
tool calls — the model decides*. Watching the tool log light up with
several `→` lines before any `←` lines is the whole lesson.

### Increment 3 — Multi-agent handoffs and Code Interpreter (`increment3`)

Introduces a specialist `Stats` agent and the **handoff** primitive:
control of the conversation moves from one agent to another, and the SDK
tracks who is "active" via `result.lastAgent`. Compare this with the
tool-call pattern from Increment 1 — both let one agent invoke another
agent's capabilities, but the *semantics* differ.

This increment also brings in **Code Interpreter** as a hosted tool, so
the Stats agent runs real Python instead of guessing at arithmetic. Good
moment to discuss when to trust an LLM with math vs. when to give it a
sandbox.

### Increment 4 — Shell access, and what changes when the agent has it (`increment4`)

The agent gets a single, very general tool: *execute a shell command*.
Function tools from earlier increments still exist, but a parallel CLI
exposes the same capabilities to the shell. The interesting question is
behavioural: prompted to "use the fewest shell calls possible", the
agent starts composing pipelines (`for … done`, `jq`, `python3 -c …`)
instead of making N tool calls. Lesson: tool *granularity* shapes agent
*style* far more than the prompt does.

### Increment 5 — MCP servers, and tool vs. handoff revisited (`increment5`)

The final piece: a `Library` agent backed by the
[`@modelcontextprotocol/server-filesystem`](https://github.com/modelcontextprotocol/servers)
MCP server (sandboxed to `./library/`) that can persist and recall
sensor snapshots.

Two concepts come together here:

- **MCP integration** from the client side — connecting an `MCPServerStdio`,
  letting the SDK discover its tools, handling startup/shutdown.
- **Sub-agent as a tool** (`agent.asTool({...})`) instead of as a
  handoff. Same two agents, very different control flow: a tool call
  returns a focused result and control stays with the caller; a handoff
  transfers the conversation. Picking the right one is a design choice
  worth its own discussion.
