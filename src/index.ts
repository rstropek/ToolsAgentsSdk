import chalk from "chalk";
import { createLibraryAgent } from "./agents/library.js";
import { createTriageAgent } from "./agents/triage.js";
import { processTurn } from "./core/processTurn.js";
import { createEmptyState } from "./core/state.js";
import { createLibraryFsMcpServer } from "./mcp/filesystem.js";
import { attachToolLogging, printTraceUrl } from "./ui/render.js";
import { runRepl } from "./ui/repl.js";

function parsePromptArg(argv: ReadonlyArray<string>): string | undefined {
	const idx = argv.indexOf("--prompt");
	if (idx === -1) return undefined;
	const value = argv[idx + 1];
	if (value === undefined || value.length === 0) {
		throw new Error("--prompt requires a non-empty string argument.");
	}
	return value;
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const prompt = parsePromptArg(args);

	const libraryFs = createLibraryFsMcpServer();
	console.error(chalk.dim("Starting filesystem MCP server…"));
	await libraryFs.connect();
	console.error(chalk.dim("Filesystem MCP server ready."));

	try {
		const library = createLibraryAgent(libraryFs);
		const triage = createTriageAgent(library);
		// Tool logging on both: Triage logs the `shell` and `library` calls,
		// Library logs the filesystem MCP calls it makes inside its own runs.
		attachToolLogging(triage);
		attachToolLogging(library);

		const state = createEmptyState(triage.name);

		if (prompt !== undefined) {
			const result = await processTurn(state, triage, prompt);
			console.log(result.reply);
			printTraceUrl(result.traceUrl);
			return;
		}

		console.log(chalk.cyan("Sensor Chatbot — Function Calling Workshop"));
		await runRepl(state, () => triage);
	} finally {
		console.error(chalk.dim("Stopping filesystem MCP server…"));
		await libraryFs.close();
	}
}

main().catch((err: unknown) => {
	const message = err instanceof Error ? err.message : String(err);
	console.error(chalk.red(message));
	process.exit(1);
});
