import { StorageClient, MetricRecord } from "../repositories/storage";

const client = new StorageClient();

export function loadWidgetMetrics(widgetId: number): number[] {
	const records: MetricRecord[] = client.read(widgetId);
	return records.map(entry => entry.score);
}
