import type { Agent } from "@openai/agents";
import chalk from "chalk";

const PREVIEW_LIMIT = 200;

function preview(value: string): string {
	const collapsed = value.replace(/\s+/g, " ").trim();
	return collapsed.length > PREVIEW_LIMIT
		? `${collapsed.slice(0, PREVIEW_LIMIT)}…`
		: collapsed;
}

export function attachToolLogging(agent: Agent): void {
	agent.on("agent_tool_start", (_ctx, tool, details) => {
		const call = details.toolCall;
		const args =
			"arguments" in call && typeof call.arguments === "string"
				? call.arguments
				: "";
		console.error(chalk.yellow(`→ tool ${tool.name}(${preview(args)})`));
	});
	agent.on("agent_tool_end", (_ctx, tool, result) => {
		console.error(chalk.yellow(`← tool ${tool.name} ${preview(result)}`));
	});
}

export function printAssistant(text: string, agentName: string): void {
	console.log(chalk.cyan(`[${agentName}]`));
	console.log(text);
	console.log("");
}

export function printTraceUrl(url: string | undefined): void {
	if (!url) return;
	console.error(chalk.dim(url));
}
