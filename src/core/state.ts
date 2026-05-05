import type { AgentInputItem } from "@openai/agents";

// We track the full history locally for workshop visibility. The Agents SDK
// can also delegate this to OpenAI via `previousResponseId` (Responses API)
// or `conversationId` (Conversations API) on `run()` — see processTurn.ts.
export interface ConversationState {
	history: AgentInputItem[];
	activeAgent: string;
}

export function createEmptyState(activeAgent: string): ConversationState {
	return { history: [], activeAgent };
}
