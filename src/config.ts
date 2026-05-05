import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
	TRIAGE_MODEL: z.string().default("gpt-5.4"),
	STATS_MODEL: z.string().default("gpt-5.4"),
	REASONING_EFFORT: z
		.enum(["minimal", "low", "medium", "high"])
		.default("high"),
	LOG_LEVEL: z.enum(["info", "debug"]).default("info"),
	TRACE_ENABLED: z
		.string()
		.default("true")
		.transform((v) => v.toLowerCase() === "true"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
	const issues = parsed.error.issues
		.map((i) => `  - ${i.path.join(".")}: ${i.message}`)
		.join("\n");
	throw new Error(
		`Invalid environment configuration:\n${issues}\n\nCopy .env.example to .env and fill in the required values.`,
	);
}

export const config = Object.freeze(parsed.data);
export type Config = typeof config;
