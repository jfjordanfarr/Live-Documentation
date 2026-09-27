import { Widget } from "./types";

export function formatWidget(widget: Widget): string {
  return `${widget.id}:${widget.value}`;
}
