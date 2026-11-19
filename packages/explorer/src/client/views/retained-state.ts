import type { DiscoveryTarget } from "../types";
import { under } from "./localView/directory-state";
import { addPin, EMPTY_PIN_SET, isSymbolPinned, removePin, type PinEntry, type PinSet } from "./pin-state";

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
export function clearRetainedDirectory(state: RetainedState, directory: string, pathOf: (item: RetainedItem) => string = item => item.kind === "directory" ? item.directory : item.pin.nodeId): RetainedState {
  const parent = pathOf({ kind: "directory", directory });
  return reconcileRetained({
    ...state,
    pins: { entries: state.pins.entries.filter(pin => !under(pathOf({ kind: "pin", pin }), parent)) },
    openDirectories: new Set([...state.openDirectories].filter(path => !under(pathOf({ kind: "directory", directory: path }), parent)))
  });
}

/**
 * How far "the others" go (the owner's approval of 2026-11-19 of one gesture at two strengths, chosen in the menu of the
 * thing kept): `fold` closes what is merely open elsewhere and keeps every pin; `unpin` does the same and releases every
 * other pin too.
 */
export type OthersStrength = "fold" | "unpin";

/** What, beside the retained selections, decides what goes and what stays. */
export interface OthersContext {
  /** The 3D map's one discovery, which folds away like an opened directory unless it is the thing kept. */
  discovery?: DiscoveryTarget | null;
  /** The directories the 3D map's Connections layout has popped open, its own memory, which wrap again on a fold. */
  popped?: ReadonlySet<string>;
  /** The map's subject, which stands in the picture by itself without a pin. */
  subject?: string | null;
  /** A file's displayed path, for which directories hold it; its id by default. */
  pathOf?: (nodeId: string) => string;
}

/** The selections after the others go, and what went, counted for the words the page says. */
export interface OthersReleased {
  state: RetainedState;
  discovery: DiscoveryTarget | null;
  popped: ReadonlySet<string>;
  /** Pins released. */
  pins: number;
  /** Opened directories closed and popped directories wrapped again. */
  directories: number;
  /** Whether the discovery went. */
  discoveryReleased: boolean;
}

/**
 * "Fold others away" and "Unpin others" (the owner's ask of 2026-11-19, "release everything _except_ what I'm interacting
 * with now"): in one step, everything open elsewhere goes, and at the `unpin` strength every other pin too, as an
 * editor's Close Others keeps the tab whose menu it was chosen from. What is kept stays as it is where that keeps it in
 * the picture:
 * - a file (`kept` is its whole-file pin, symbol `*`) keeps every pin it holds, whole or narrowed to its symbols;
 * - a symbol keeps exactly its own pin, the file's other symbols released, or, its file pinned whole, that whole pin,
 *   which already holds it;
 * - a directory stays open, or popped;
 * - the discovery stays when it is the thing's own.
 * A file that holds no pin and is neither the subject nor the discovery is drawn only because something else shows it.
 * At the `unpin` strength that something goes, so the file is pinned instead, as the file or the symbol named, and
 * becomes the one pin. At the `fold` strength no pin changes, so the opened or popped directories that hold the file
 * stay open, since it may be drawn only inside them. A pinned file needs no directory: a pin is drawn wherever it stands,
 * and so is whatever any remaining pin shows. A pin whose file does not stand at a moment of the history shown is
 * released like any other. Nothing to release returns the input unchanged, with zero counts.
 */
export function releaseOthers(state: RetainedState, kept: RetainedItem, strength: OthersStrength, context: OthersContext = {}): OthersReleased {
  const discovery = context.discovery ?? null;
  const popped = context.popped ?? new Set<string>();
  const ownDiscovery = !!discovery && (kept.kind === "directory"
    ? discovery.kind === "directory" && discovery.directory === kept.directory
    : discovery.kind === "file" && discovery.nodeId === kept.pin.nodeId);
  const standsAlone = kept.kind === "pin" && (context.subject === kept.pin.nodeId || ownDiscovery);

  let pins = state.pins;
  if (strength === "unpin") {
    if (kept.kind === "directory") pins = EMPTY_PIN_SET;
    else {
      const { nodeId, symbol } = kept.pin;
      const own = state.pins.entries.filter(pin => pin.nodeId === nodeId
        && (symbol === "*" || pin.symbol === symbol || pin.symbol === "*"));
      pins = own.length > 0 || standsAlone ? { entries: own } : addPin(EMPTY_PIN_SET, nodeId, symbol);
    }
  }
  const holdsPin = kept.kind === "pin" && pins.entries.some(pin => pin.nodeId === kept.pin.nodeId);
  const path = kept.kind === "pin" ? (context.pathOf ?? (id => id))(kept.pin.nodeId) : null;
  const needs = (directory: string): boolean => kept.kind === "directory" ? directory === kept.directory
    : !holdsPin && !standsAlone && under(path!, directory);
  const openDirectories = new Set([...state.openDirectories].filter(needs));
  const nextPopped = new Set([...popped].filter(needs));

  const pinsReleased = state.pins.entries.filter(pin => !isSymbolPinned(pins, pin.nodeId, pin.symbol)).length;
  const directories = state.openDirectories.size - openDirectories.size + popped.size - nextPopped.size;
  const discoveryGone = !!discovery && !ownDiscovery;
  if (pinsReleased === 0 && directories === 0 && !discoveryGone) {
    return { state, discovery, popped, pins: 0, directories: 0, discoveryReleased: false };
  }
  return {
    state: reconcileRetained({ ...state, pins, openDirectories }),
    discovery: ownDiscovery ? discovery : null,
    popped: nextPopped,
    pins: pinsReleased,
    directories,
    discoveryReleased: discoveryGone
  };
}

/** The plain words that say once what went: "Unpinned 4 others, folded 2 directories away". */
export function othersReleasedWords(released: Pick<OthersReleased, "pins" | "directories" | "discoveryReleased">): string {
  const plural = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`;
  const folded = [
    ...released.directories > 0 ? [plural(released.directories, "directory", "directories")] : [],
    ...released.discoveryReleased ? ["the discovery"] : []
  ].join(" and ");
  const unpinned = released.pins > 0 ? `Unpinned ${plural(released.pins, "other", "others")}` : "";
  if (!folded) return unpinned;
  return unpinned ? `${unpinned}, folded ${folded} away` : `Folded ${folded} away`;
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
export function describeRetained(item: RetainedItem, nameOf: (nodeId: string) => string | undefined, pathOf: (nodeId: string) => string = id => id): RetainedWords {
  const directory = item.kind === "directory";
  const path = directory ? item.directory : pathOf(item.pin.nodeId);
  const name = directory ? path.split("/").pop() || "Scan root" : nameOf(item.pin.nodeId) ?? item.pin.nodeId;
  const symbol = !directory && item.pin.symbol !== "*"
    ? item.pin.symbol === "__internals__" ? "Internals" : item.pin.symbol : null;
  const description = directory ? `directory ${path || "Scan root"}` : symbol ? `${symbol} in ${path}` : path;
  return { name: symbol ?? name, context: path || "Directory", description, symbol, path };
}
