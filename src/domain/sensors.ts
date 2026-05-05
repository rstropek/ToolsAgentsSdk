export interface Sensor {
	id: string;
	location: string;
}

export const SENSORS: ReadonlyArray<Sensor> = [
	{ id: "sensor-living-room", location: "Living Room" },
	{ id: "sensor-kitchen", location: "Kitchen" },
	{ id: "sensor-outdoor", location: "Outdoor" },
];

export interface TemperatureReading {
	hour: number;
	celsius: number;
}

function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function seedFromString(seed: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < seed.length; i++) {
		hash ^= seed.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

function round2(value: number): number {
	return Math.round(value * 100) / 100;
}

export function generateTemperatures(
	sensorId: string,
	date: string,
): ReadonlyArray<TemperatureReading> {
	const rand = mulberry32(seedFromString(`${sensorId}|${date}`));
	const outlierHour = Math.floor(rand() * 24);
	const readings: TemperatureReading[] = [];
	for (let hour = 0; hour < 24; hour++) {
		const value = hour === outlierHour ? 30 + rand() * 10 : 24 + rand() * 2;
		readings.push({ hour, celsius: round2(value) });
	}
	return readings;
}
