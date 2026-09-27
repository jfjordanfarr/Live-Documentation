import { Widget, WidgetState } from "./types";

export function createWidget(seed: number): Widget {
  return {
    id: `widget-${seed}`,
    state: WidgetState.Active,
    value: seed * 2
  };
}
