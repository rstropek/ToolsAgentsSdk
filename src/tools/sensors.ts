import { tool } from "@openai/agents";
import { z } from "zod";
import { SENSORS } from "../domain/sensors.js";

export const listSensorsTool = tool({
	name: "list_sensors",
	description:
		"Returns the list of installed temperature sensors with their IDs and locations. Call this whenever the user asks which sensors exist or which locations are monitored.",
	parameters: z.object({}).strict(),
	execute: async () => JSON.stringify(SENSORS),
});
