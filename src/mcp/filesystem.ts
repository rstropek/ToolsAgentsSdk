import { resolve } from "node:path";
import { MCPServerStdio } from "@openai/agents";

export const LIBRARY_DIR = resolve(process.cwd(), "library");

export function createLibraryFsMcpServer(): MCPServerStdio {
	return new MCPServerStdio({
		name: "library-fs",
		command: "npx",
		args: ["-y", "@modelcontextprotocol/server-filesystem", LIBRARY_DIR],
		cacheToolsList: true,
		clientSessionTimeoutSeconds: 60,
	});
}
