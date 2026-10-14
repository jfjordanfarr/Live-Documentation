import { under } from "./localView/directory-state";
import { removePin, type PinEntry, type PinSet } from "./pin-state";

/** One deliberate selection, independent of the neighbors it brings into view. */
export type RetainedItem =
  | { kind: "directory"; directory: string }
  | { kind: "pin"; pin: PinEntry };

/** Retention and its oldest-first presentation order, shared by both Local Map representations. */
export interface RetainedState {
  pins: PinSet;
  openDirectories: ReadonlySet<string>;
  retentionOrder?: readonly string[];
}

/** Stable identity; a directory and a file with similar names cannot collide. */
export function retainedKey(item: RetainedItem): string {
  return item.kind === "directory"
    ? JSON.stringify(["directory", item.directory])
    : JSON.stringify(["pin", item.pin.nodeId, item.pin.symbol]);
}

/** Keep surviving selections in order and append newly retained items. Old links have a deterministic fallback. */
export function retainedItems(state: RetainedState): RetainedItem[] {
  const items: RetainedItem[] = [
    ...state.pins.entries.map(pin => ({ kind: "pin" as const, pin })),
    ...[...state.openDirectories].map(directory => ({ kind: "directory" as const, directory }))
  ];
  const remaining = new Map(items.map(item => [retainedKey(item), item]));
  const ordered: RetainedItem[] = [];

  for (const key of state.retentionOrder ?? []) {
    const item = remaining.get(key);
    if (item) {
      ordered.push(item);
      remaining.delete(key);
    }
  }

  return [...ordered, ...remaining.values()];
}

/** Normalize presentation metadata without changing what is retained. */
export function reconcileRetained(state: RetainedState): RetainedState {
  return { ...state, retentionOrder: retainedItems(state).map(retainedKey) };
}

/** Release precisely this selection. Other selections, including opened descendants, survive. */
export function releaseRetained(state: RetainedState, item: RetainedItem): RetainedState {
  if (item.kind === "pin") {
    return reconcileRetained({
      ...state,
      pins: removePin(state.pins, item.pin.nodeId, item.pin.symbol)
    });
  }

  const openDirectories = new Set(state.openDirectories);
  openDirectories.delete(item.directory);
  return reconcileRetained({ ...state, openDirectories });
}

/** Explicit bulk operation: release this directory and every deliberate selection within it. */
export function clearRetainedDirectory(state: RetainedState, directory: string): RetainedState {
  return reconcileRetained({
    ...state,
    pins: { entries: state.pins.entries.filter(pin => !under(pin.nodeId, directory)) },
    openDirectories: new Set([...state.openDirectories].filter(path => !under(path, directory)))
  });
}

/** Keep an independent inspected file; replace it only when its own pin or explicit direct selection is released. */
export function subjectAfterRelease(previous: PinSet, next: PinSet, current: string | null, releaseCurrent = false): string | null {
  const lostPin = previous.entries.some(pin => pin.nodeId === current)
    && !next.entries.some(pin => pin.nodeId === current);
  return releaseCurrent || lostPin ? next.entries.at(-1)?.nodeId ?? null : current;
}
