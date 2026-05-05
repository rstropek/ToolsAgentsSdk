import { exec } from "node:child_process";
import { promisify } from "node:util";
import { tool } from "@openai/agents";
import { z } from "zod";

const execAsync = promisify(exec);

const TIMEOUT_MS = 60_000;
const MAX_OUTPUT = 200_000;

function clip(text: string): string {
	return text.length > MAX_OUTPUT
		? `${text.slice(0, MAX_OUTPUT)}\n…[truncated, ${text.length - MAX_OUTPUT} more chars]`
		: text;
}

export const shellTool = tool({
	name: "shell",
	description:
		"Executes a shell command on the host and returns its stdout, stderr, and exit code as JSON. Use this to run the local sensors CLI (`npx tsx src/cli/sensors-cli.ts ...`) or any other command needed to answer the user. Commands run with the host process's working directory and full permissions; do not run destructive commands.",
	parameters: z.object({ command: z.string().min(1) }).strict(),
	execute: async ({ command }) => {
		try {
			const { stdout, stderr } = await execAsync(command, {
				timeout: TIMEOUT_MS,
				maxBuffer: 10 * 1024 * 1024,
				shell: "/bin/zsh",
			});
			return JSON.stringify({
				exitCode: 0,
				stdout: clip(stdout),
				stderr: clip(stderr),
			});
		} catch (err) {
			const e = err as NodeJS.ErrnoException & {
				stdout?: string;
				stderr?: string;
				code?: number | string;
				killed?: boolean;
			};
			return JSON.stringify({
				exitCode: typeof e.code === "number" ? e.code : 1,
				killed: e.killed ?? false,
				stdout: clip(e.stdout ?? ""),
				stderr: clip(e.stderr ?? e.message ?? ""),
			});
		}
	},
});
