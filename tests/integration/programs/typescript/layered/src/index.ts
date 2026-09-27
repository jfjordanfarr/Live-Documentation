import { Widget } from "./models/widget";
import { generateReport } from "./services/reportService";

export function run(seed: number): string {
	const widget: Widget = { id: seed, label: `widget-${seed}` };
	return generateReport(widget);
}
