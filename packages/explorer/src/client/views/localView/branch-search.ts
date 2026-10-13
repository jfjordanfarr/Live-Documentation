/**
 * The continuing search. The first picture is painted from the starts the
 * order step tries before paint; after it, the search keeps trying seeded
 * starts one at a time in the page's idle moments, from the seed after the
 * last one tried, and the picture moves to a start only when its price plus
 * the churn it would cost against the shown picture is below the shown
 * picture's own price. The search stops after a run of starts none of which
 * betters the best picture found, churn aside, or at a cap, and begins again
 * whenever the picture is drawn anew (the owner's plan and stopping rule,
 * 2026-10-07). A better picture refused for its churn still counts as found,
 * so the search is not cut short by the refusal; the owner's suspicion that
 * the search approaches the best picture whatever the churn cost rests on
 * this (2026-10-07). The starts are a fixed sequence, so the picture after
 * any number of them is the same on every machine; only the moments they
 * arrive differ.
 *
 * The search prices a start without the page: each card's rows are measured
 * once, at the widths the columns give, and a pin's place for any order of
 * the rows is arithmetic from them, so a start costs the order step and the
 * placement and nothing of the page's layout. An adopted picture is measured
 * on the page before it is shown.
 *
 * Pure-function module: no DOM, no clock.
 *
 * @module branch-search
 */

/** The seeds the search runs through and when it gives up. */
export interface SearchSettings {
  /** The first seed to try: the one after the last the first paint tried. */
  from: number;
  /** The last seed to try. */
  to: number;
  /** How many starts in a row may fail to better the best picture found, churn aside, before the search settles. */
  patience: number;
}

/** Where the search stands. */
export interface SearchState {
  settings: SearchSettings;
  /** The next seed to try. */
  next: number;
  /** Seeds tried since the search began. */
  tried: number;
  /** Seeds tried since a start last bettered the best price found, or since the beginning. */
  sinceBetter: number;
  /** Pictures adopted so far. */
  adopted: number;
  /** The shown picture's own price, churn aside: what a start must beat with its churn counted. */
  shown: number;
  /** The best price found so far, churn aside, adopted or not: the shown picture's own until a start betters it. */
  best: number;
  /** The last start's price with its churn, or null before any. */
  priced: number | null;
  status: "running" | "settled" | "capped";
}

/** A search about to try its first seed; already capped when there is none to try. */
export function beginSearch(settings: SearchSettings, shown: number): SearchState {
  const state: SearchState = { settings, next: settings.from, tried: 0, sinceBetter: 0, adopted: 0, shown, best: shown, priced: null, status: "running" };
  return settings.to < settings.from || settings.patience < 1 ? { ...state, status: settings.patience < 1 ? "settled" : "capped" } : state;
}

/**
 * The next seed tried: the start is adopted when its price with its churn is
 * strictly below the shown picture's own, and the shown price becomes the
 * start's own. The start betters the best found when its price without
 * churn is strictly below it, adopted or not; else the run without a better
 * start grows, and the search settles when it reaches the patience. Past
 * the last seed the search is capped. `base` is the start's price without
 * churn, `priced` with it.
 */
export function judgeStart(state: SearchState, priced: number, base: number): { state: SearchState; adopt: boolean } {
  if (state.status !== "running") return { state, adopt: false };
  const adopt = priced < state.shown;
  const better = base < state.best;
  const next = state.next + 1;
  const sinceBetter = better ? 0 : state.sinceBetter + 1;
  const status: SearchState["status"] = sinceBetter >= state.settings.patience ? "settled" : next > state.settings.to ? "capped" : "running";
  return {
    adopt,
    state: {
      ...state, next, tried: state.tried + 1, sinceBetter, adopted: state.adopted + (adopt ? 1 : 0),
      shown: adopt ? base : state.shown, best: better ? base : state.best, priced, status
    }
  };
}

/**
 * An alignment trial shares the picture's price and adoption count, but does
 * not consume an ordering seed or its patience. A settled ordering search
 * still permits pending alignment trials; each new incumbent supplies its
 * own finite neighborhood of joins.
 */
export function judgeAlignment(state: SearchState, priced: number, base: number): { state: SearchState; adopt: boolean } {
  const adopt = priced < state.shown;
  return { adopt, state: { ...state, priced, shown: adopt ? base : state.shown, best: Math.min(state.best, base), adopted: state.adopted + (adopt ? 1 : 0) } };
}

/** Alternate available trial kinds; exhausted seed patience cannot hide pending alignment choices. */
export function nextTrialKind(state: SearchState, alignmentPending: boolean, preferAlignment: boolean): "seed" | "alignment" | null {
  if (alignmentPending && (preferAlignment || state.status !== "running")) return "alignment";
  if (state.status === "running") return "seed";
  return null;
}

/** One row of a card as measured once: its identity and the height of its grid track. */
export interface RowMeasure {
  key: string;
  height: number;
}

/** A resolved endpoint moves with its named row, or stays at a card offset for a hub or card-level fallback. */
export interface ResolvedPin {
  row: string | null;
  offset: number;
}

/** The exact request the runtime resolved; an absent and an empty symbol both ask for its default anchor. */
export const endpointKey = (direction: "inbound" | "outbound", symbol: string | undefined): string => `${direction}\0${symbol ?? ""}`;

/** A visible grid child's border box and vertical margins, in unscaled coordinates. */
export interface RowChildBox {
  top: number;
  bottom: number;
  marginTop: number;
  marginBottom: number;
}

/** The row's layout extent: negative label margins protrude beyond a track and must not make the track taller. */
export function rowBounds(children: readonly RowChildBox[]): { top: number; bottom: number } | null {
  if (!children.length) return null;
  return {
    top: Math.min(...children.map(child => child.top - child.marginTop)),
    bottom: Math.max(...children.map(child => child.bottom + child.marginBottom))
  };
}

/** A card's rows as measured once, in the order they stood; a pin's place for any order follows from them. */
export interface CardRows {
  /** From the card's top to the first row's top. */
  header: number;
  /** Between one row's bottom and the next row's top. */
  gap: number;
  rows: RowMeasure[];
  /** The key of the Internals row, which stands last whatever the order; null when the card has none. */
  internals: string | null;
  /** The actual runtime resolution of every endpoint requested by the placement, including hidden or absent anchors. */
  endpoints: ReadonlyMap<string, ResolvedPin | null>;
}

/**
 * The rows in the order the order step names them, as the renderer stands
 * them: a named row per mention of its name, then the rows not named, each
 * name's rows together in the order the names first stood, Internals last;
 * with no order named, the rows as they stand.
 */
export function orderedRows(card: CardRows, order: readonly string[] | undefined): RowMeasure[] {
  // No order named leaves the rows as they stand, as the renderer does.
  if (!order) return [...card.rows];
  const byName = new Map<string, RowMeasure[]>();
  for (const row of card.rows) {
    const name = row.key.slice(0, row.key.indexOf("\0"));
    (byName.get(name) ?? byName.set(name, []).get(name)!).push(row);
  }
  const ordered: RowMeasure[] = [];
  for (const name of order ?? []) {
    const row = byName.get(name)?.shift();
    if (row) ordered.push(row);
  }
  for (const rows of byName.values()) ordered.push(...rows);
  if (card.internals) {
    const at = ordered.findIndex(row => row.key === card.internals);
    if (at >= 0) ordered.push(...ordered.splice(at, 1));
  }
  return ordered;
}

/**
 * Where a pin stands from its card's top when the rows stand in `order`:
 * the header, the rows above it with the gaps between, and the pin's place
 * in its resolved row. Hubs and card-level fallbacks retain their measured
 * card offset; an explicitly unmeasurable endpoint remains null. Resolution
 * is captured from the runtime, preserving exact names, normalized aliases
 * and duplicate rows without guessing again here.
 */
export function pinFor(card: CardRows, order: readonly string[] | undefined, direction: "inbound" | "outbound", symbol: string | undefined): number | null {
  const key = endpointKey(direction, symbol);
  if (!card.endpoints.has(key)) throw new Error(`The cached card has no resolved ${direction} endpoint for ${JSON.stringify(symbol ?? "*")}.`);
  const pin = card.endpoints.get(key);
  if (!pin) return null;
  if (pin.row === null) return Math.round(pin.offset + 1e-3);
  let top = card.header;
  for (const row of orderedRows(card, order)) {
    if (row.key === pin.row) return Math.round(top + pin.offset + 1e-3);
    top += row.height + card.gap;
  }
  throw new Error(`The cached endpoint ${JSON.stringify(symbol ?? "*")} resolves to missing row ${JSON.stringify(pin.row)}.`);
}
