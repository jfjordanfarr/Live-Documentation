import { Widget } from "../models/widget";

export function formatReport(widget: Widget, metrics: number[]): string {
	const total = metrics.reduce((acc, value) => acc + value, 0);
	return `${widget.label}:${total}`;
}
