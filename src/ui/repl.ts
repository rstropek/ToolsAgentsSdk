import { createInterface } from "node:readline/promises";
import type { Agent } from "@openai/agents";
import chalk from "chalk";
import { processTurn } from "../core/processTurn.js";
import type { ConversationState } from "../core/state.js";
import { printAssistant, printTraceUrl } from "./render.js";

export async function runRepl(
	state: ConversationState,
	getActiveAgent: () => Agent,
): Promise<void> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
	});

	const handleSigint = (): void => {
		console.log("");
		rl.close();
	};
	process.on("SIGINT", handleSigint);

	console.log(chalk.dim("Type /help for commands, /exit to quit."));

	try {
		while (true) {
			const promptLabel = `${chalk.cyan(`[${state.activeAgent}]`)} › `;
			let line: string;
			try {
				line = await rl.question(promptLabel);
			} catch {
				break;
			}
			const input = line.trim();
			if (input.length === 0) continue;
			if (input === "/exit" || input === "/quit") break;
			if (input === "/help") {
				console.log(chalk.dim("/exit   quit the REPL"));
				console.log(chalk.dim("/help   show this help"));
				console.log(chalk.dim("/state  print the current conversation state"));
				continue;
			}
			if (input === "/state") {
				console.log(chalk.dim(`active agent: ${state.activeAgent}`));
				console.log(chalk.dim(`history items: ${state.history.length}`));
				console.log(JSON.stringify(state.history, null, 2));
				continue;
			}

			try {
				const result = await processTurn(state, getActiveAgent(), input);
				printAssistant(result.reply, state.activeAgent);
				printTraceUrl(result.traceUrl);
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				console.error(chalk.red(`Error: ${message}`));
			}
		}
	} finally {
		process.off("SIGINT", handleSigint);
		rl.close();
	}
}
