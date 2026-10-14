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

/** The most recently retained item, or null; a path a person asks for starts here. */
export function newestRetained(state: RetainedState): RetainedItem | null {
  return retainedItems(state).at(-1) ?? null;
}

/** The words for a retained item, shared by the tray and the search bar. */
export interface RetainedWords {
  /** The name shown: the symbol when one is pinned, else the file or directory name; the scan root is "Scan root". */
  name: string;
  /** Where it stands: the file's path, or the directory's, or "Directory" for the scan root. */
  context: string;
  /** A sentence fragment for a label: "directory a/b", "run in a/b/main.ts" or "a/b/main.ts". */
  description: string;
  /** The pinned symbol, when the item is one symbol of a file. */
  symbol: string | null;
  /** The file's id or the directory's path. */
  path: string;
}

/** The words for an item; `nameOf` gives a file's name from its id. */
export function describeRetained(item: RetainedItem, nameOf: (nodeId: string) => string | undefined): RetainedWords {
  const directory = item.kind === "directory";
  const path = directory ? item.directory : item.pin.nodeId;
  const name = directory ? path.split("/").pop() || "Scan root" : nameOf(item.pin.nodeId) ?? item.pin.nodeId;
  const symbol = !directory && item.pin.symbol !== "*"
    ? item.pin.symbol === "__internals__" ? "Internals" : item.pin.symbol : null;
  const description = directory ? `directory ${path || "Scan root"}` : symbol ? `${symbol} in ${path}` : path;
  return { name: symbol ?? name, context: path || "Directory", description, symbol, path };
}
