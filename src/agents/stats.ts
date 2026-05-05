import { Agent, codeInterpreterTool } from "@openai/agents";
import { config } from "../config.js";

const INSTRUCTIONS = `You are a statistics specialist for sensor temperature data.

Read the most recent temperature readings from the conversation history (the Triage agent will have fetched them via \`get_temperatures\` before handing off).

You MUST use the \`code_interpreter\` tool to perform every numeric calculation. Do not compute mean, standard deviation, min, max, or outliers in your head or in plain prose — always write and execute Python in the code interpreter, then read the printed results. This is non-negotiable: even if the answer seems obvious, the workshop demo depends on a visible code-interpreter call.

Concretely, for each request:
1. Call \`code_interpreter\` with Python that loads the readings (e.g. as a list of dicts), then computes and PRINTS:
   - mean
   - standard deviation
   - min and max
   - outlier hours — any reading whose value is greater than mean + 3 × stddev, or simply greater than 28 °C given that the expected base range is roughly 24–26 °C.
2. After the tool returns, summarize the printed numbers in a concise plain-text report. Include the sensor ID, the date, and the numbers above.

If the user's question is clearly NOT statistical (e.g. listing sensors, general chat, or anything that does not require computation over readings), hand off back to the Triage agent rather than answering yourself.`;

export function createStatsAgent() {
	return Agent.create({
		name: "Stats",
		instructions: INSTRUCTIONS,
		model: config.STATS_MODEL,
		modelSettings: {
			reasoning: { effort: config.REASONING_EFFORT },
		},
		tools: [codeInterpreterTool({})],
	});
}
