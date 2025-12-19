/**
 * Observable state container for Local Map visualization.
 *
 * Design principles:
 * - Pure data container with no DOM or side effects
 * - Subscriptions enable reactive UI updates
 * - Typed state prevents runtime shape errors
 * - Can be unit tested without jsdom
 *
 * @module state
 */

/**
 * Represents a pinned symbol in the visualization.
 * Pins define the path being traced through the dependency graph.
 */
export interface SymbolPin {
  /** Node ID where this symbol resides */
  nodeId: string;
  /** Symbol name (e.g., "buildLocalSubgraph") */
  symbol: string;
  /** Which hop in the chain this pin represents (0 = origin) */
  hopIndex: number;
}

/**
 * Represents a hovered symbol (temporary highlight, not pinned).
 */
export interface HoveredSymbol {
  nodeId: string;
  symbol: string;
}

/**
 * Represents a computed path between two nodes.
 * Used for FROM-TO pathfinding mode.
 */
export interface PathResult {
  /** Ordered list of node IDs from origin to destination */
  nodeIds: string[];
  /** The symbol at the origin (FROM) */
  fromSymbol?: string;
  /** The symbol at the destination (TO) */
  toSymbol?: string;
  /** Whether path was found in reverse direction (and should be swapped) */
  isReversed: boolean;
}

/**
 * The complete state shape for Local Map visualization.
 */
export interface LocalMapState {
  /** Ordered array of pinned symbols forming the traced path */
  pinnedPath: SymbolPin[];
  /** Currently hovered symbol (null if nothing hovered) */
  hoveredSymbol: HoveredSymbol | null;
  /** ID of the focused node (center of current view) */
  focusedNodeId: string | null;
  /** Number of hops to display (controls column count) */
  maxHops: number;
  /** Whether symbol collapse mode is active */
  collapseUnrelated: boolean;
  /** 
   * Active pathfinding result (null when in exploration mode).
   * When set, renders a linear path instead of full subgraphs.
   */
  activePath: PathResult | null;
}

/**
 * Creates a fresh initial state with sensible defaults.
 */
export function createInitialState(): LocalMapState {
  return {
    pinnedPath: [],
    hoveredSymbol: null,
    focusedNodeId: null,
    maxHops: 3,
    collapseUnrelated: true,
    activePath: null
  };
}

/**
 * Subscriber callback type for state changes.
 */
export type StateSubscriber<T> = (state: T, prevState: T) => void;

/**
 * Observable state store with type-safe subscriptions.
 *
 * @example
 * ```typescript
 * const store = createStateStore(createInitialState());
 * const unsubscribe = store.subscribe((state, prev) => {
 *   if (state.pinnedPath !== prev.pinnedPath) {
 *     console.log("Pinned path changed:", state.pinnedPath);
 *   }
 * });
 * store.update(s => ({ ...s, focusedNodeId: "some-node" }));
 * unsubscribe();
 * ```
 */
export interface StateStore<T> {
  /** Get current state (immutable snapshot) */
  getState(): T;
  /** Update state via reducer function */
  update(reducer: (current: T) => T): void;
  /** Subscribe to state changes; returns unsubscribe function */
  subscribe(subscriber: StateSubscriber<T>): () => void;
}

/**
 * Creates a new observable state store.
 *
 * @param initialState - The starting state
 * @returns A StateStore instance
 */
export function createStateStore<T>(initialState: T): StateStore<T> {
  let state = initialState;
  const subscribers = new Set<StateSubscriber<T>>();

  return {
    getState(): T {
      return state;
    },

    update(reducer: (current: T) => T): void {
      const prevState = state;
      state = reducer(state);
      // Only notify if state actually changed (reference equality)
      if (state !== prevState) {
        subscribers.forEach(sub => sub(state, prevState));
      }
    },

    subscribe(subscriber: StateSubscriber<T>): () => void {
      subscribers.add(subscriber);
      return () => {
        subscribers.delete(subscriber);
      };
    }
  };
}

// ============================================================================
// State Actions (Pure Functions)
// ============================================================================

/**
 * Adds a pin to the path. If the pin already exists at that hopIndex, replaces it.
 * Pins at higher hopIndexes are removed (truncates the path).
 */
export function addPin(state: LocalMapState, pin: SymbolPin): LocalMapState {
  // Truncate path at this hop index and add the new pin
  const truncatedPath = state.pinnedPath.filter(p => p.hopIndex < pin.hopIndex);
  return {
    ...state,
    pinnedPath: [...truncatedPath, pin]
  };
}

/**
 * Removes all pins from the given hopIndex onward.
 */
export function removePin(state: LocalMapState, fromHopIndex: number): LocalMapState {
  return {
    ...state,
    pinnedPath: state.pinnedPath.filter(p => p.hopIndex < fromHopIndex)
  };
}

/**
 * Clears the entire pinned path.
 */
export function clearPins(state: LocalMapState): LocalMapState {
  return {
    ...state,
    pinnedPath: []
  };
}

/**
 * Sets the active path result for path mode rendering.
 * Clears any existing pinned path since path mode takes precedence.
 */
export function setActivePath(state: LocalMapState, path: PathResult | null): LocalMapState {
  return {
    ...state,
    activePath: path,
    pinnedPath: path ? [] : state.pinnedPath // Clear pins when entering path mode
  };
}

/**
 * Clears the active path, returning to exploration mode.
 */
export function clearActivePath(state: LocalMapState): LocalMapState {
  return {
    ...state,
    activePath: null
  };
}

/**
 * Sets the hovered symbol (or clears it with null).
 */
export function setHoveredSymbol(
  state: LocalMapState,
  hovered: HoveredSymbol | null
): LocalMapState {
  // Early return if same hover state
  if (
    state.hoveredSymbol?.nodeId === hovered?.nodeId &&
    state.hoveredSymbol?.symbol === hovered?.symbol
  ) {
    return state;
  }
  return {
    ...state,
    hoveredSymbol: hovered
  };
}

/**
 * Sets the focused node ID (center of view).
 */
export function setFocusedNode(state: LocalMapState, nodeId: string | null): LocalMapState {
  if (state.focusedNodeId === nodeId) {
    return state;
  }
  return {
    ...state,
    focusedNodeId: nodeId
  };
}

/**
 * Updates the maximum hop count.
 */
export function setMaxHops(state: LocalMapState, maxHops: number): LocalMapState {
  const clamped = Math.max(1, Math.min(10, maxHops));
  if (state.maxHops === clamped) {
    return state;
  }
  return {
    ...state,
    maxHops: clamped
  };
}

/**
 * Toggles the collapse-unrelated mode.
 */
export function toggleCollapseUnrelated(state: LocalMapState): LocalMapState {
  return {
    ...state,
    collapseUnrelated: !state.collapseUnrelated
  };
}

// ============================================================================
// Derived State (Pure Queries)
// ============================================================================

/**
 * Returns the IDs of all nodes in the pinned path.
 */
export function getPinnedNodeIds(state: LocalMapState): Set<string> {
  return new Set(state.pinnedPath.map(p => p.nodeId));
}

/**
 * Returns the symbols pinned on a specific node.
 */
export function getPinnedSymbolsForNode(state: LocalMapState, nodeId: string): string[] {
  return state.pinnedPath
    .filter(p => p.nodeId === nodeId)
    .map(p => p.symbol);
}

/**
 * Checks if a specific symbol is pinned.
 */
export function isSymbolPinned(state: LocalMapState, nodeId: string, symbol: string): boolean {
  return state.pinnedPath.some(p => p.nodeId === nodeId && p.symbol === symbol);
}

/**
 * Returns the hop index for a pinned symbol, or -1 if not pinned.
 */
export function getHopIndexForSymbol(
  state: LocalMapState,
  nodeId: string,
  symbol: string
): number {
  const pin = state.pinnedPath.find(p => p.nodeId === nodeId && p.symbol === symbol);
  return pin?.hopIndex ?? -1;
}

/**
 * Returns true if the hovered symbol is part of the pinned path.
 */
export function isHoveredSymbolPinned(state: LocalMapState): boolean {
  if (!state.hoveredSymbol) return false;
  return isSymbolPinned(state, state.hoveredSymbol.nodeId, state.hoveredSymbol.symbol);
}

/**
 * Returns the number of columns needed based on pinned path length.
 * Formula: 3 base columns + 2 columns per additional hop
 */
export function getRequiredColumnCount(state: LocalMapState): number {
  const hopCount = state.pinnedPath.length;
  if (hopCount === 0) return 3; // Default 3-column view
  // Each hop after the first adds 2 columns (dependents of hop N, center of hop N+1)
  return 3 + Math.max(0, hopCount - 1) * 2;
}
