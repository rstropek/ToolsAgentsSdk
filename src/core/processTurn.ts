import {
	type Agent,
	type AgentInputItem,
	getCurrentTrace,
	run,
	withTrace,
} from "@openai/agents";
import { config } from "../config.js";
import type { ConversationState } from "./state.js";

export interface TurnResult {
	reply: string;
	traceUrl?: string;
}

export async function processTurn(
	state: ConversationState,
	agent: Agent,
	userMessage: string,
): Promise<TurnResult> {
	// Manual history threading is a deliberate workshop choice so attendees
	// can see exactly what gets sent to the model on each turn. In production
	// you would typically pass `{ previousResponseId }` or `{ conversationId }`
	// to `run()` and let OpenAI persist the conversation server-side.
	const userItem: AgentInputItem = {
		role: "user",
		content: userMessage,
	};
	const input: AgentInputItem[] = [...state.history, userItem];

	const execute = async (): Promise<{ reply: string; traceId?: string }> => {
		const result = await run(agent, input);
		state.history = [...result.history];
		if (result.lastAgent) {
			state.activeAgent = result.lastAgent.name;
		}
		const reply = result.finalOutput ?? "";
		const trace = getCurrentTrace();
		const traceId = trace?.traceId;
		return traceId ? { reply, traceId } : { reply };
	};

	if (!config.TRACE_ENABLED) {
		const { reply } = await execute();
		return { reply };
	}

	const { reply, traceId } = await withTrace("Sensor Chatbot Turn", execute);
	return traceId
		? {
				reply,
				traceUrl: `https://platform.openai.com/traces/trace?trace_id=${traceId}`,
			}
		: { reply };
}
