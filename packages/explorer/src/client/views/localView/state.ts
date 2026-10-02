/** Local rendering state; independent exploration pins live in the shared PinSet. */
export interface HoveredSymbol { nodeId: string; symbol: string }

/** A directed FROM/TO path, kept separate from the exploration branches. */
export interface PathResult {
  /** Ordered list of node IDs from origin to destination */
  nodeIds: string[];
  /** The symbol at the origin (FROM) */
  fromSymbol?: string;
  /** The symbol at the destination (TO) */
  toSymbol?: string;
}

/** The transient state owned by the Local Map renderer. */
export interface LocalMapState {
  hoveredSymbol: HoveredSymbol | null;
  activePath: PathResult | null;
}

/** Begin outside pathfinding, with no transient hover. */
export function createInitialState(): LocalMapState {
  return { hoveredSymbol: null, activePath: null };
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
 *   if (state.activePath !== prev.activePath) {
 *     console.log("Path changed:", state.activePath);
 *   }
 * });
 * store.update(s => ({ ...s, activePath: { nodeIds: ["provider", "consumer"] } }));
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


/** Enter or leave explicit pathfinding without changing shared exploration pins. */
export function setActivePath(state: LocalMapState, path: PathResult | null): LocalMapState {
  return { ...state, activePath: path };
}

/** Set the transient hover without rewriting equal state. */
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
