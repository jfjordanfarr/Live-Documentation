import { describe, expect, it } from "vitest";
import {
  createInitialState,
  createStateStore,
  addPin,
  removePin,
  clearPins,
  setHoveredSymbol,
  setFocusedNode,
  setMaxHops,
  toggleCollapseUnrelated,
  getPinnedNodeIds,
  getPinnedSymbolsForNode,
  isSymbolPinned,
  getHopIndexForSymbol,
  isHoveredSymbolPinned,
  getRequiredColumnCount,
  type LocalMapState,
  type SymbolPin
} from "./state";

describe("LocalMapState", () => {
  describe("createInitialState", () => {
    it("returns a valid initial state with sensible defaults", () => {
      const state = createInitialState();

      expect(state.pinnedPath).toEqual([]);
      expect(state.hoveredSymbol).toBeNull();
      expect(state.focusedNodeId).toBeNull();
      expect(state.maxHops).toBe(3);
      expect(state.collapseUnrelated).toBe(true);
    });

    it("returns a fresh object each time (no shared references)", () => {
      const state1 = createInitialState();
      const state2 = createInitialState();

      expect(state1).not.toBe(state2);
      expect(state1.pinnedPath).not.toBe(state2.pinnedPath);
    });
  });

  describe("StateStore", () => {
    it("getState returns the current state", () => {
      const store = createStateStore(createInitialState());
      const state = store.getState();

      expect(state.pinnedPath).toEqual([]);
      expect(state.focusedNodeId).toBeNull();
    });

    it("update modifies state via reducer", () => {
      const store = createStateStore(createInitialState());

      store.update(s => ({ ...s, focusedNodeId: "node-123" }));

      expect(store.getState().focusedNodeId).toBe("node-123");
    });

    it("subscribe notifies on state changes", () => {
      const store = createStateStore(createInitialState());
      const notifications: Array<{ state: LocalMapState; prev: LocalMapState }> = [];

      store.subscribe((state, prev) => {
        notifications.push({ state, prev });
      });

      store.update(s => ({ ...s, focusedNodeId: "node-A" }));
      store.update(s => ({ ...s, focusedNodeId: "node-B" }));

      expect(notifications).toHaveLength(2);
      expect(notifications[0].state.focusedNodeId).toBe("node-A");
      expect(notifications[0].prev.focusedNodeId).toBeNull();
      expect(notifications[1].state.focusedNodeId).toBe("node-B");
      expect(notifications[1].prev.focusedNodeId).toBe("node-A");
    });

    it("does not notify when state reference is unchanged", () => {
      const store = createStateStore(createInitialState());
      let notificationCount = 0;

      store.subscribe(() => {
        notificationCount++;
      });

      // Return the same state object
      const originalState = store.getState();
      store.update(() => originalState);

      expect(notificationCount).toBe(0);
    });

    it("unsubscribe stops notifications", () => {
      const store = createStateStore(createInitialState());
      let notificationCount = 0;

      const unsubscribe = store.subscribe(() => {
        notificationCount++;
      });

      store.update(s => ({ ...s, focusedNodeId: "node-1" }));
      expect(notificationCount).toBe(1);

      unsubscribe();

      store.update(s => ({ ...s, focusedNodeId: "node-2" }));
      expect(notificationCount).toBe(1); // Still 1, no new notification
    });

    it("supports multiple subscribers", () => {
      const store = createStateStore(createInitialState());
      const sub1Calls: number[] = [];
      const sub2Calls: number[] = [];

      store.subscribe(() => sub1Calls.push(1));
      store.subscribe(() => sub2Calls.push(2));

      store.update(s => ({ ...s, maxHops: 5 }));

      expect(sub1Calls).toEqual([1]);
      expect(sub2Calls).toEqual([2]);
    });
  });

  describe("Pin Management", () => {
    const baseState = createInitialState();

    describe("addPin", () => {
      it("adds a pin to an empty path", () => {
        const pin: SymbolPin = { nodeId: "node-A", symbol: "functionA", hopIndex: 0 };
        const result = addPin(baseState, pin);

        expect(result.pinnedPath).toHaveLength(1);
        expect(result.pinnedPath[0]).toEqual(pin);
      });

      it("appends pins in hop order", () => {
        const pin0: SymbolPin = { nodeId: "node-A", symbol: "funcA", hopIndex: 0 };
        const pin1: SymbolPin = { nodeId: "node-B", symbol: "funcB", hopIndex: 1 };

        let state = addPin(baseState, pin0);
        state = addPin(state, pin1);

        expect(state.pinnedPath).toHaveLength(2);
        expect(state.pinnedPath[0].hopIndex).toBe(0);
        expect(state.pinnedPath[1].hopIndex).toBe(1);
      });

      it("truncates path when adding a pin at an earlier hop index", () => {
        const pin0: SymbolPin = { nodeId: "node-A", symbol: "funcA", hopIndex: 0 };
        const pin1: SymbolPin = { nodeId: "node-B", symbol: "funcB", hopIndex: 1 };
        const pin2: SymbolPin = { nodeId: "node-C", symbol: "funcC", hopIndex: 2 };
        const replacement: SymbolPin = { nodeId: "node-X", symbol: "funcX", hopIndex: 1 };

        let state = addPin(baseState, pin0);
        state = addPin(state, pin1);
        state = addPin(state, pin2);
        expect(state.pinnedPath).toHaveLength(3);

        state = addPin(state, replacement);
        expect(state.pinnedPath).toHaveLength(2);
        expect(state.pinnedPath[1]).toEqual(replacement);
      });

      it("preserves immutability", () => {
        const pin: SymbolPin = { nodeId: "node-A", symbol: "func", hopIndex: 0 };
        const result = addPin(baseState, pin);

        expect(result).not.toBe(baseState);
        expect(result.pinnedPath).not.toBe(baseState.pinnedPath);
        expect(baseState.pinnedPath).toHaveLength(0); // Original unchanged
      });
    });

    describe("removePin", () => {
      it("removes pins from a specific hop onward", () => {
        const pin0: SymbolPin = { nodeId: "A", symbol: "a", hopIndex: 0 };
        const pin1: SymbolPin = { nodeId: "B", symbol: "b", hopIndex: 1 };
        const pin2: SymbolPin = { nodeId: "C", symbol: "c", hopIndex: 2 };

        let state = addPin(baseState, pin0);
        state = addPin(state, pin1);
        state = addPin(state, pin2);

        state = removePin(state, 1);

        expect(state.pinnedPath).toHaveLength(1);
        expect(state.pinnedPath[0]).toEqual(pin0);
      });

      it("handles removing from hop 0 (clears all)", () => {
        const pin0: SymbolPin = { nodeId: "A", symbol: "a", hopIndex: 0 };
        let state = addPin(baseState, pin0);

        state = removePin(state, 0);

        expect(state.pinnedPath).toHaveLength(0);
      });

      it("handles removing from beyond the path length (no-op)", () => {
        const pin0: SymbolPin = { nodeId: "A", symbol: "a", hopIndex: 0 };
        let state = addPin(baseState, pin0);

        state = removePin(state, 5);

        expect(state.pinnedPath).toHaveLength(1);
      });
    });

    describe("clearPins", () => {
      it("clears the entire pinned path", () => {
        const pin0: SymbolPin = { nodeId: "A", symbol: "a", hopIndex: 0 };
        const pin1: SymbolPin = { nodeId: "B", symbol: "b", hopIndex: 1 };

        let state = addPin(baseState, pin0);
        state = addPin(state, pin1);
        state = clearPins(state);

        expect(state.pinnedPath).toHaveLength(0);
      });

      it("is idempotent on empty path", () => {
        const state = clearPins(baseState);
        expect(state.pinnedPath).toHaveLength(0);
      });
    });
  });

  describe("Hover State", () => {
    const baseState = createInitialState();

    describe("setHoveredSymbol", () => {
      it("sets the hovered symbol", () => {
        const result = setHoveredSymbol(baseState, {
          nodeId: "node-A",
          symbol: "myFunction"
        });

        expect(result.hoveredSymbol).toEqual({
          nodeId: "node-A",
          symbol: "myFunction"
        });
      });

      it("clears hovered symbol with null", () => {
        let state = setHoveredSymbol(baseState, { nodeId: "A", symbol: "f" });
        state = setHoveredSymbol(state, null);

        expect(state.hoveredSymbol).toBeNull();
      });

      it("returns same state when hover is unchanged", () => {
        const hovered = { nodeId: "A", symbol: "f" };
        const state1 = setHoveredSymbol(baseState, hovered);
        const state2 = setHoveredSymbol(state1, { nodeId: "A", symbol: "f" });

        expect(state2).toBe(state1); // Same reference
      });

      it("returns same state when clearing already-null hover", () => {
        const result = setHoveredSymbol(baseState, null);
        expect(result).toBe(baseState);
      });
    });
  });

  describe("Focus State", () => {
    const baseState = createInitialState();

    describe("setFocusedNode", () => {
      it("sets the focused node ID", () => {
        const result = setFocusedNode(baseState, "node-xyz");
        expect(result.focusedNodeId).toBe("node-xyz");
      });

      it("clears focused node with null", () => {
        let state = setFocusedNode(baseState, "node-abc");
        state = setFocusedNode(state, null);

        expect(state.focusedNodeId).toBeNull();
      });

      it("returns same state when focus is unchanged", () => {
        const state1 = setFocusedNode(baseState, "node-123");
        const state2 = setFocusedNode(state1, "node-123");

        expect(state2).toBe(state1);
      });
    });
  });

  describe("Configuration", () => {
    const baseState = createInitialState();

    describe("setMaxHops", () => {
      it("sets max hops within valid range", () => {
        const result = setMaxHops(baseState, 5);
        expect(result.maxHops).toBe(5);
      });

      it("clamps to minimum of 1", () => {
        const result = setMaxHops(baseState, 0);
        expect(result.maxHops).toBe(1);

        const result2 = setMaxHops(baseState, -5);
        expect(result2.maxHops).toBe(1);
      });

      it("clamps to maximum of 10", () => {
        const result = setMaxHops(baseState, 15);
        expect(result.maxHops).toBe(10);
      });

      it("returns same state when value is unchanged", () => {
        const state1 = setMaxHops(baseState, 3); // Default is already 3
        expect(state1).toBe(baseState);
      });
    });

    describe("toggleCollapseUnrelated", () => {
      it("toggles from true to false", () => {
        expect(baseState.collapseUnrelated).toBe(true);
        const result = toggleCollapseUnrelated(baseState);
        expect(result.collapseUnrelated).toBe(false);
      });

      it("toggles from false to true", () => {
        const state = { ...baseState, collapseUnrelated: false };
        const result = toggleCollapseUnrelated(state);
        expect(result.collapseUnrelated).toBe(true);
      });
    });
  });

  describe("Derived State Queries", () => {
    describe("getPinnedNodeIds", () => {
      it("returns empty set for empty path", () => {
        const state = createInitialState();
        const ids = getPinnedNodeIds(state);
        expect(ids.size).toBe(0);
      });

      it("returns set of unique node IDs", () => {
        let state = createInitialState();
        state = addPin(state, { nodeId: "A", symbol: "f1", hopIndex: 0 });
        state = addPin(state, { nodeId: "B", symbol: "f2", hopIndex: 1 });
        state = addPin(state, { nodeId: "A", symbol: "f3", hopIndex: 2 }); // A again

        const ids = getPinnedNodeIds(state);
        expect(ids.size).toBe(2);
        expect(ids.has("A")).toBe(true);
        expect(ids.has("B")).toBe(true);
      });
    });

    describe("getPinnedSymbolsForNode", () => {
      it("returns empty array when node has no pins", () => {
        const state = createInitialState();
        const symbols = getPinnedSymbolsForNode(state, "nonexistent");
        expect(symbols).toEqual([]);
      });

      it("returns symbols pinned on a specific node", () => {
        let state = createInitialState();
        state = addPin(state, { nodeId: "A", symbol: "f1", hopIndex: 0 });
        state = addPin(state, { nodeId: "B", symbol: "f2", hopIndex: 1 });
        state = addPin(state, { nodeId: "A", symbol: "f3", hopIndex: 2 });

        const symbolsA = getPinnedSymbolsForNode(state, "A");
        expect(symbolsA).toEqual(["f1", "f3"]);

        const symbolsB = getPinnedSymbolsForNode(state, "B");
        expect(symbolsB).toEqual(["f2"]);
      });
    });

    describe("isSymbolPinned", () => {
      it("returns false for unpinned symbol", () => {
        const state = createInitialState();
        expect(isSymbolPinned(state, "A", "func")).toBe(false);
      });

      it("returns true for pinned symbol", () => {
        let state = createInitialState();
        state = addPin(state, { nodeId: "A", symbol: "func", hopIndex: 0 });

        expect(isSymbolPinned(state, "A", "func")).toBe(true);
        expect(isSymbolPinned(state, "A", "other")).toBe(false);
        expect(isSymbolPinned(state, "B", "func")).toBe(false);
      });
    });

    describe("getHopIndexForSymbol", () => {
      it("returns -1 for unpinned symbol", () => {
        const state = createInitialState();
        expect(getHopIndexForSymbol(state, "A", "func")).toBe(-1);
      });

      it("returns correct hop index for pinned symbol", () => {
        let state = createInitialState();
        state = addPin(state, { nodeId: "A", symbol: "f1", hopIndex: 0 });
        state = addPin(state, { nodeId: "B", symbol: "f2", hopIndex: 1 });
        state = addPin(state, { nodeId: "C", symbol: "f3", hopIndex: 2 });

        expect(getHopIndexForSymbol(state, "A", "f1")).toBe(0);
        expect(getHopIndexForSymbol(state, "B", "f2")).toBe(1);
        expect(getHopIndexForSymbol(state, "C", "f3")).toBe(2);
      });
    });

    describe("isHoveredSymbolPinned", () => {
      it("returns false when nothing is hovered", () => {
        const state = createInitialState();
        expect(isHoveredSymbolPinned(state)).toBe(false);
      });

      it("returns false when hovered symbol is not pinned", () => {
        let state = createInitialState();
        state = setHoveredSymbol(state, { nodeId: "A", symbol: "f" });

        expect(isHoveredSymbolPinned(state)).toBe(false);
      });

      it("returns true when hovered symbol is pinned", () => {
        let state = createInitialState();
        state = addPin(state, { nodeId: "A", symbol: "f", hopIndex: 0 });
        state = setHoveredSymbol(state, { nodeId: "A", symbol: "f" });

        expect(isHoveredSymbolPinned(state)).toBe(true);
      });
    });

    describe("getRequiredColumnCount", () => {
      it("returns 3 for empty path", () => {
        const state = createInitialState();
        expect(getRequiredColumnCount(state)).toBe(3);
      });

      it("returns 3 for single pin (origin)", () => {
        let state = createInitialState();
        state = addPin(state, { nodeId: "A", symbol: "f", hopIndex: 0 });

        expect(getRequiredColumnCount(state)).toBe(3);
      });

      it("returns 5 for two pins (one hop)", () => {
        let state = createInitialState();
        state = addPin(state, { nodeId: "A", symbol: "f1", hopIndex: 0 });
        state = addPin(state, { nodeId: "B", symbol: "f2", hopIndex: 1 });

        expect(getRequiredColumnCount(state)).toBe(5);
      });

      it("returns 7 for three pins (two hops)", () => {
        let state = createInitialState();
        state = addPin(state, { nodeId: "A", symbol: "f1", hopIndex: 0 });
        state = addPin(state, { nodeId: "B", symbol: "f2", hopIndex: 1 });
        state = addPin(state, { nodeId: "C", symbol: "f3", hopIndex: 2 });

        expect(getRequiredColumnCount(state)).toBe(7);
      });
    });
  });
});
