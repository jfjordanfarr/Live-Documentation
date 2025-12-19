/**
 * Integration tests for state module workflows.
 * 
 * These tests verify that the state module correctly supports multi-hop
 * pathfinding scenarios that the controller will orchestrate.
 * 
 * The controller itself requires DOM elements and is tested via E2E,
 * but these pure-function integration tests verify the state logic.
 */
import { describe, expect, it } from "vitest";
import {
  createInitialState,
  createStateStore,
  addPin,
  removePin,
  clearPins,
  setHoveredSymbol,
  setFocusedNode,
  isSymbolPinned,
  getPinnedNodeIds,
  getRequiredColumnCount,
  type LocalMapState,
  type SymbolPin
} from "./state";

describe("State Integration: Multi-hop Pathfinding Scenarios", () => {
  describe("Building a multi-hop path", () => {
    it("supports building a 3-hop path incrementally", () => {
      const store = createStateStore(createInitialState());
      
      // User clicks origin symbol
      store.update(s => addPin(s, { nodeId: "controller.ts", symbol: "render", hopIndex: 0 }));
      expect(store.getState().pinnedPath).toHaveLength(1);
      expect(getRequiredColumnCount(store.getState())).toBe(3);
      
      // User clicks symbol on first hop neighbor
      store.update(s => addPin(s, { nodeId: "render.ts", symbol: "renderLocalView", hopIndex: 1 }));
      expect(store.getState().pinnedPath).toHaveLength(2);
      expect(getRequiredColumnCount(store.getState())).toBe(5);
      
      // User clicks symbol on second hop neighbor
      store.update(s => addPin(s, { nodeId: "connections.ts", symbol: "drawConnections", hopIndex: 2 }));
      expect(store.getState().pinnedPath).toHaveLength(3);
      expect(getRequiredColumnCount(store.getState())).toBe(7);
    });

    it("truncates path when user changes direction mid-trace", () => {
      let state = createInitialState();
      
      // Build a 3-hop path
      state = addPin(state, { nodeId: "A", symbol: "f1", hopIndex: 0 });
      state = addPin(state, { nodeId: "B", symbol: "f2", hopIndex: 1 });
      state = addPin(state, { nodeId: "C", symbol: "f3", hopIndex: 2 });
      expect(state.pinnedPath).toHaveLength(3);
      
      // User clicks a different symbol at hop 1 → truncates hop 2+
      state = addPin(state, { nodeId: "D", symbol: "f4", hopIndex: 1 });
      expect(state.pinnedPath).toHaveLength(2);
      expect(state.pinnedPath[0].nodeId).toBe("A");
      expect(state.pinnedPath[1].nodeId).toBe("D");
    });

    it("maintains correct node IDs set through path changes", () => {
      let state = createInitialState();
      
      state = addPin(state, { nodeId: "A", symbol: "f1", hopIndex: 0 });
      state = addPin(state, { nodeId: "B", symbol: "f2", hopIndex: 1 });
      
      const nodeIds = getPinnedNodeIds(state);
      expect(nodeIds.has("A")).toBe(true);
      expect(nodeIds.has("B")).toBe(true);
      expect(nodeIds.size).toBe(2);
    });
  });

  describe("State store subscription for reactive UI", () => {
    it("notifies subscribers when path changes", () => {
      const store = createStateStore(createInitialState());
      const notifications: LocalMapState[] = [];
      
      store.subscribe((state) => {
        notifications.push(state);
      });
      
      store.update(s => addPin(s, { nodeId: "A", symbol: "f", hopIndex: 0 }));
      store.update(s => addPin(s, { nodeId: "B", symbol: "g", hopIndex: 1 }));
      
      expect(notifications).toHaveLength(2);
      expect(notifications[0].pinnedPath).toHaveLength(1);
      expect(notifications[1].pinnedPath).toHaveLength(2);
    });

    it("notifies even when clearing an already-empty path (new array reference)", () => {
      const store = createStateStore(createInitialState());
      const notifications: LocalMapState[] = [];
      
      store.subscribe((state) => {
        notifications.push(state);
      });
      
      // clearPins always creates a new state object with a new pinnedPath array
      // This is intentional for simplicity - the cost of an extra notification is negligible
      store.update(s => clearPins(s));
      
      expect(notifications).toHaveLength(1);
      expect(notifications[0].pinnedPath).toHaveLength(0);
    });

    it("unsubscribe prevents further notifications", () => {
      const store = createStateStore(createInitialState());
      const notifications: LocalMapState[] = [];
      
      const unsub = store.subscribe((state) => {
        notifications.push(state);
      });
      
      store.update(s => addPin(s, { nodeId: "A", symbol: "f", hopIndex: 0 }));
      expect(notifications).toHaveLength(1);
      
      unsub();
      
      store.update(s => addPin(s, { nodeId: "B", symbol: "g", hopIndex: 1 }));
      expect(notifications).toHaveLength(1); // No new notification
    });
  });

  describe("Hover state interaction with pinned path", () => {
    it("tracks hover separately from pinned path", () => {
      let state = createInitialState();
      
      // Pin a symbol
      state = addPin(state, { nodeId: "A", symbol: "f", hopIndex: 0 });
      
      // Hover a different symbol
      state = setHoveredSymbol(state, { nodeId: "B", symbol: "g" });
      
      // Both should exist independently
      expect(state.pinnedPath).toHaveLength(1);
      expect(state.hoveredSymbol).toEqual({ nodeId: "B", symbol: "g" });
      expect(isSymbolPinned(state, "A", "f")).toBe(true);
      expect(isSymbolPinned(state, "B", "g")).toBe(false);
    });

    it("clearing hover does not affect pinned path", () => {
      let state = createInitialState();
      
      state = addPin(state, { nodeId: "A", symbol: "f", hopIndex: 0 });
      state = setHoveredSymbol(state, { nodeId: "A", symbol: "f" });
      state = setHoveredSymbol(state, null);
      
      expect(state.pinnedPath).toHaveLength(1);
      expect(state.hoveredSymbol).toBeNull();
    });
  });

  describe("Focus state coordination", () => {
    it("can set focus node independent of pinned path", () => {
      let state = createInitialState();
      
      state = addPin(state, { nodeId: "A", symbol: "f", hopIndex: 0 });
      state = setFocusedNode(state, "B");
      
      expect(state.pinnedPath[0].nodeId).toBe("A");
      expect(state.focusedNodeId).toBe("B");
    });

    it("clearing pins does not clear focus", () => {
      let state = createInitialState();
      
      state = setFocusedNode(state, "center-node");
      state = addPin(state, { nodeId: "A", symbol: "f", hopIndex: 0 });
      state = clearPins(state);
      
      expect(state.pinnedPath).toHaveLength(0);
      expect(state.focusedNodeId).toBe("center-node");
    });
  });

  describe("Complex workflow: trace → backtrack → retrace", () => {
    it("supports complete workflow without state corruption", () => {
      const store = createStateStore(createInitialState());
      
      // Step 1: Build initial path A → B → C
      store.update(s => addPin(s, { nodeId: "A", symbol: "f1", hopIndex: 0 }));
      store.update(s => addPin(s, { nodeId: "B", symbol: "f2", hopIndex: 1 }));
      store.update(s => addPin(s, { nodeId: "C", symbol: "f3", hopIndex: 2 }));
      expect(store.getState().pinnedPath.map(p => p.nodeId)).toEqual(["A", "B", "C"]);
      
      // Step 2: Backtrack to hop 1 (remove C)
      store.update(s => removePin(s, 2));
      expect(store.getState().pinnedPath.map(p => p.nodeId)).toEqual(["A", "B"]);
      
      // Step 3: Retrace with different path A → B → D
      store.update(s => addPin(s, { nodeId: "D", symbol: "f4", hopIndex: 2 }));
      expect(store.getState().pinnedPath.map(p => p.nodeId)).toEqual(["A", "B", "D"]);
      
      // Step 4: Complete backtrack to origin
      store.update(s => removePin(s, 1));
      expect(store.getState().pinnedPath.map(p => p.nodeId)).toEqual(["A"]);
      
      // Step 5: Clear everything
      store.update(s => clearPins(s));
      expect(store.getState().pinnedPath).toHaveLength(0);
    });
  });
});
