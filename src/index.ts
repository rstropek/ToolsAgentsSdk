import chalk from "chalk";
import { createTriageAgent } from "./agents/triage.js";
import { processTurn } from "./core/processTurn.js";
import { createEmptyState } from "./core/state.js";
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
	const agent = createTriageAgent();
	attachToolLogging(agent);
	const state = createEmptyState(agent.name);

	if (prompt !== undefined) {
		const result = await processTurn(state, agent, prompt);
		console.log(result.reply);
		printTraceUrl(result.traceUrl);
		return;
	}

	console.log(chalk.cyan("Sensor Chatbot — Function Calling Workshop"));
	await runRepl(state, () => agent);
}

main().catch((err: unknown) => {
	const message = err instanceof Error ? err.message : String(err);
	console.error(chalk.red(message));
	process.exit(1);
});
