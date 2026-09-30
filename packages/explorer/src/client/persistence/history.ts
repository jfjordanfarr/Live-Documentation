/**
 * Browser history for the Explorer. Every write to the address bar goes through {@link commitUrl}.
 *
 * A move from one place to another, another view, another file, another folder opened or a path between two files,
 * becomes an entry that Back returns to. A change within a place, pins, an expanded card, pan and zoom, rewrites the
 * current entry, so Back never walks through pin toggles. Which kind a write is comes from the parsed address, not
 * from the raw one, because the Membrane Map packs its pins and its folders into one compressed parameter.
 */

/** What a write does to the history: a new entry, a rewrite of the current one, or nothing. */
export type HistoryEntry = "push" | "replace" | "none";

/** Everything {@link entryFor} weighs. */
export interface HistoryWrite {
  /** The place the address names now, and the place the new address names, as comparable keys. */
  fromPlace: string;
  toPlace: string;
  sameUrl: boolean;
  /** Whether the person has touched the page yet; writes made while the page starts up never add an entry. */
  armed: boolean;
  /** Whether the page is restoring an entry that Back or Forward returned to. */
  restoring: boolean;
  /** Whether a new entry was made earlier in the same task: one action that writes twice is one step back. */
  joining: boolean;
}

/** Decides what one write to the address bar does to the history. */
export function entryFor(write: HistoryWrite): HistoryEntry {
  if (write.sameUrl) {
    return "none";
  }
  const move = write.fromPlace !== write.toPlace;
  if (!move || !write.armed || write.restoring || write.joining) {
    return "replace";
  }
  return "push";
}

let placeOf: (search: string) => string = (search) => search;
let armed = false;
let restoring = false;
let joining = false;
/** The position of the current entry among this page's entries, and the furthest one Forward can reach. */
let position = 0;
let furthest = 0;
const listeners = new Set<() => void>();

interface EntryState {
  liveDocsPosition: number;
}

function positionOf(state: unknown): number {
  const value = (state as Partial<EntryState> | null)?.liveDocsPosition;
  return typeof value === "number" ? value : 0;
}

/** Joins every write for the rest of this task to the entry just made or restored. */
function joinRestOfTask(): void {
  joining = true;
  setTimeout(() => {
    joining = false;
  }, 0);
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Starts the history for this page: how to read a place from an address, and what to do when Back or Forward lands on
 * an entry. Returns a function that stops listening.
 */
export function startHistory(options: { placeOf: (search: string) => string; restore: () => void }): () => void {
  placeOf = options.placeOf;
  position = positionOf(window.history.state);
  furthest = position;
  window.history.replaceState({ ...(window.history.state as object | null), liveDocsPosition: position }, "");
  const arm = (): void => {
    armed = true;
  };
  const onPop = (event: PopStateEvent): void => {
    position = positionOf(event.state);
    joinRestOfTask();
    restoring = true;
    try {
      options.restore();
    } finally {
      restoring = false;
    }
    notify();
  };
  const inputs = ["pointerdown", "keydown", "wheel"] as const;
  for (const type of inputs) {
    window.addEventListener(type, arm, { capture: true, passive: true });
  }
  window.addEventListener("popstate", onPop);
  return () => {
    for (const type of inputs) {
      window.removeEventListener(type, arm, { capture: true });
    }
    window.removeEventListener("popstate", onPop);
  };
}

/** Writes an address: a new entry when it names another place, a rewrite of the current entry when it does not. */
export function commitUrl(url: string): void {
  const next = new URL(url, window.location.href);
  const entry = entryFor({
    fromPlace: placeOf(window.location.search),
    toPlace: placeOf(next.search),
    sameUrl: next.pathname === window.location.pathname && next.search === window.location.search,
    armed,
    restoring,
    joining
  });
  if (entry === "none") {
    return;
  }
  if (entry === "push") {
    position += 1;
    furthest = position;
    joinRestOfTask();
    window.history.pushState({ liveDocsPosition: position } satisfies EntryState, "", url);
    notify();
    return;
  }
  window.history.replaceState({ liveDocsPosition: position } satisfies EntryState, "", url);
}

/** Whether Back would return to an earlier place on this page. */
export function canGoBack(): boolean {
  return position > 0;
}

/** Whether Forward would return to a place this page left by Back. */
export function canGoForward(): boolean {
  return position < furthest;
}

/** Calls `listener` whenever the current entry changes. */
export function onHistoryChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
