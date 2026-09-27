import { loadWidgetMetrics } from "./dataService";
import { Widget } from "../models/widget";
import { formatReport } from "../utils/format";

export function generateReport(widget: Widget): string {
	const metrics = loadWidgetMetrics(widget.id);
	return formatReport(widget, metrics);
}
