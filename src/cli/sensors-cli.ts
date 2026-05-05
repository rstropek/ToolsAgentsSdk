import { generateTemperatures, SENSORS } from "../domain/sensors.js";

const USAGE = `Usage:
  npx tsx src/cli/sensors-cli.ts list-sensors
  npx tsx src/cli/sensors-cli.ts get-temperatures <sensorId> <date>

Commands:
  list-sensors                       Print the installed sensors as JSON.
  get-temperatures <sensorId> <date> Print 24 hourly readings for one
                                     sensor on one date (YYYY-MM-DD) as JSON.
  --help, help                       Show this message.

Examples:
  npx tsx src/cli/sensors-cli.ts list-sensors
  npx tsx src/cli/sensors-cli.ts get-temperatures sensor-kitchen 2026-05-04
`;

function fail(message: string): never {
	console.error(message);
	process.exit(1);
}

function main(argv: ReadonlyArray<string>): void {
	const [command, ...rest] = argv;

	if (
		command === undefined ||
		command === "--help" ||
		command === "-h" ||
		command === "help"
	) {
		console.log(USAGE);
		return;
	}

	if (command === "list-sensors") {
		console.log(JSON.stringify(SENSORS));
		return;
	}

	if (command === "get-temperatures") {
		const [sensorId, date] = rest;
		if (!sensorId || !date) {
			fail(
				"Error: get-temperatures requires <sensorId> and <date> (YYYY-MM-DD).",
			);
		}
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			fail(`Error: invalid date "${date}". Expected YYYY-MM-DD.`);
		}
		const known = SENSORS.some((s) => s.id === sensorId);
		if (!known) {
			fail(
				`Error: unknown sensorId "${sensorId}". Run \`list-sensors\` to see valid IDs.`,
			);
		}
		const readings = generateTemperatures(sensorId, date);
		console.log(JSON.stringify({ sensorId, date, readings }));
		return;
	}

	fail(`Error: unknown command "${command}".\n\n${USAGE}`);
}

main(process.argv.slice(2));
