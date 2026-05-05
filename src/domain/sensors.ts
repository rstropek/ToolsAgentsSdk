export interface Sensor {
	id: string;
	location: string;
}

export const SENSORS: ReadonlyArray<Sensor> = [
	{ id: "sensor-living-room", location: "Living Room" },
	{ id: "sensor-kitchen", location: "Kitchen" },
	{ id: "sensor-outdoor", location: "Outdoor" },
];
