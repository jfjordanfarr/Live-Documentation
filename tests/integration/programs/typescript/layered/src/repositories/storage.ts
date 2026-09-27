import { Widget } from "../models/widget";

export interface MetricRecord {
	widget: Widget;
	score: number;
}

export class StorageClient {
	read(widgetId: number): MetricRecord[] {
		const widget: Widget = { id: widgetId, label: `widget-${widgetId}` };
		return [
			{ widget, score: 10 },
			{ widget, score: 15 }
		];
	}
}
