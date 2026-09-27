import { createWidget } from "./models";
import { formatWidget } from "./util";

export function main(seed: number): string {
	const widget = createWidget(seed);
	return formatWidget(widget);
}
