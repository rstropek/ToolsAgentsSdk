import { Agent } from "@openai/agents";
import { config } from "../config.js";
import { listSensorsTool } from "../tools/sensors.js";

const INSTRUCTIONS = `You are a sensor monitoring assistant for a small home installation.

You can list installed sensors via the \`list_sensors\` tool. When the user asks which sensors exist, which rooms are monitored, or anything similar, call \`list_sensors\` and answer based on its output.

When the user asks something you cannot answer with the available tools, briefly say so. Do not invent data.`;

export function createTriageAgent(): Agent {
	return new Agent({
		name: "Triage",
		instructions: INSTRUCTIONS,
		model: config.TRIAGE_MODEL,
		modelSettings: {
			reasoning: { effort: config.REASONING_EFFORT },
		},
		tools: [listSensorsTool],
	});
}
