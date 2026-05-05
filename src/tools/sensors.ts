import { tool } from "@openai/agents";
import { z } from "zod";
import { generateTemperatures, SENSORS } from "../domain/sensors.js";

export const listSensorsTool = tool({
	name: "list_sensors",
	description:
		"Returns the list of installed temperature sensors with their IDs and locations. Call this whenever the user asks which sensors exist or which locations are monitored.",
	parameters: z.object({}).strict(),
	execute: async () => JSON.stringify(SENSORS),
});

export const getTemperaturesTool = tool({
	name: "get_temperatures",
	description:
		"Returns 24 hourly temperature readings in Celsius for ONE sensor on ONE date. Call once per (sensor, date) pair you need. Multiple sensors require multiple tool calls; the model may issue them in parallel.",
	parameters: z
		.object({
			sensorId: z.string(),
			date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
		})
		.strict(),
	execute: async ({ sensorId, date }) => {
		const known = SENSORS.some((s) => s.id === sensorId);
		if (!known) {
			throw new Error(
				`Unknown sensorId "${sensorId}". Call list_sensors to discover valid IDs.`,
			);
		}
		const readings = generateTemperatures(sensorId, date);
		return JSON.stringify({ sensorId, date, readings });
	},
});
