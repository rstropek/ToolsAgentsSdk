import { Agent } from "@openai/agents";
import { config } from "../config.js";
import { shellTool } from "../tools/shell.js";
import type { createLibraryAgent } from "./library.js";

const PROJECT_CWD = process.cwd();

type LibraryAgent = ReturnType<typeof createLibraryAgent>;

const LIBRARY_TOOL_DESCRIPTION =
	'Delegates a sensor-data library task to the Library agent. Use for saving, listing, or reading sensor snapshots that live on disk in the project\'s `library/` directory. Pass a single, focused, plain-English instruction (e.g. "save this kitchen 2026-05-04 payload: {...}", "list all snapshots", "read sensor-outdoor 2026-05-04"). The Library agent will use the filesystem MCP tools and return a plain-text result.';

const INSTRUCTIONS = `You are a sensor monitoring assistant for a small home installation.

You have a single tool: \`shell\`. It executes a shell command on the host and returns \`{ exitCode, stdout, stderr }\` as JSON.

Environment: the shell is **zsh** on macOS, with **Python 3** (\`python3\`) and **Node.js** (\`node\`, \`npx\`) available on the PATH. You may pipe between commands, use here-docs, run inline Python (\`python3 -c '...'\`), and chain with \`&&\`/\`||\` as needed.

There is a CLI in this repository at \`./src/cli/sensors-cli.ts\`, runnable from \`${PROJECT_CWD}\` via:
  npx tsx src/cli/sensors-cli.ts <command>

To answer ANY user question about sensors — listing, fetching readings, computing statistics, comparing, detecting outliers — drive the CLI with the \`shell\` tool. If you do not yet know the available commands, run \`npx tsx src/cli/sensors-cli.ts --help\` first.

Use the FEWEST shell calls possible. Compose work into a single command whenever you can:
- Chain with \`;\`, \`&&\`, or \`|\` to run multiple steps in one call.
- For multi-sensor data, run all CLI invocations together (e.g. \`for s in sensor-a sensor-b sensor-c; do npx tsx src/cli/sensors-cli.ts get-temperatures "$s" 2026-05-04; done\`) and parse the combined output.
- Pipe CLI JSON into \`python3 -c '...'\` (or \`jq\`) to compute statistics in the same call instead of fetching first and analyzing in a second call.
Only issue separate shell calls when a later command genuinely depends on parsing the previous one's output and you cannot express that dependency inline.

Never invent data; always go through the CLI. If the CLI returns a non-zero exit code, surface the stderr message to the user instead of guessing.

Library tool:
- For saving, listing, or reading sensor data SNAPSHOTS (the on-disk library, e.g. "save the kitchen readings for yesterday", "what snapshots do we have?", "read sensor-outdoor 2026-05-04"), call the \`library\` tool with a single, focused, plain-English instruction. Pass the actual JSON payload inline when asking it to save something — fetch the readings via \`shell\` first if they aren't already in the conversation. The \`library\` tool returns a plain-text result that you can relay (or summarize) for the user.`;

export function createTriageAgent(library: LibraryAgent): Agent {
	const libraryTool = library.asTool({
		toolName: "library",
		toolDescription: LIBRARY_TOOL_DESCRIPTION,
	});
	return new Agent({
		name: "Triage",
		instructions: INSTRUCTIONS,
		model: config.TRIAGE_MODEL,
		modelSettings: {
			reasoning: { effort: config.REASONING_EFFORT },
		},
		tools: [shellTool, libraryTool],
	});
}
