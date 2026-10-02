import { describe, expect, it } from "vitest";

import { createStateStore } from "./state";

  describe("StateStore", () => {
    it("getState returns the current state", () => {
      const store = createStateStore({ focusedNodeId: null as string | null, maxHops: 3 });
      const state = store.getState();

      expect(state.focusedNodeId).toBeNull();
    });

    it("update modifies state via reducer", () => {
      const store = createStateStore({ focusedNodeId: null as string | null, maxHops: 3 });

      store.update(s => ({ ...s, focusedNodeId: "node-123" }));

      expect(store.getState().focusedNodeId).toBe("node-123");
    });

    it("subscribe notifies on state changes", () => {
      const store = createStateStore({ focusedNodeId: null as string | null, maxHops: 3 });
      const notifications: Array<{ state: { focusedNodeId: string | null }; prev: { focusedNodeId: string | null } }> = [];

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
      const store = createStateStore({ focusedNodeId: null as string | null, maxHops: 3 });
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
      const store = createStateStore({ focusedNodeId: null as string | null, maxHops: 3 });
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
      const store = createStateStore({ focusedNodeId: null as string | null, maxHops: 3 });
      const sub1Calls: number[] = [];
      const sub2Calls: number[] = [];

      store.subscribe(() => sub1Calls.push(1));
      store.subscribe(() => sub2Calls.push(2));

      store.update(s => ({ ...s, maxHops: 5 }));

      expect(sub1Calls).toEqual([1]);
      expect(sub2Calls).toEqual([2]);
    });
  });
