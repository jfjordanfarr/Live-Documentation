import { describe, expect, it } from "vitest";

import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT, scrubSnapshot } from "../persistence/compressed-url-state";
import { addPin, EMPTY_PIN_SET, getVisibleConnections } from "./pin-state";
import { clearRetainedDirectory, reconcileRetained, releaseRetained, retainedItems, retainedKey, subjectAfterRelease, othersReleasedWords, releaseOthers, type RetainedItem, type RetainedState } from "./retained-state";

describe("independent retained selections", () => {
  it("replaces a released subject without clearing an independent direct-file inspection", () => {
    const previous = addPin(addPin(EMPTY_PIN_SET, "a.ts", "*"), "b.ts", "run");
    const next = addPin(EMPTY_PIN_SET, "a.ts", "*");
    expect(subjectAfterRelease(previous, next, "b.ts")).toBe("a.ts");
    expect(subjectAfterRelease(previous, next, "a.ts")).toBe("a.ts");
    expect(subjectAfterRelease(EMPTY_PIN_SET, EMPTY_PIN_SET, "preview.ts")).toBe("preview.ts");
    expect(subjectAfterRelease(EMPTY_PIN_SET, EMPTY_PIN_SET, "preview.ts", true)).toBeNull();
    expect(subjectAfterRelease(previous, EMPTY_PIN_SET, "b.ts")).toBeNull();
  });
  it("releases an opened parent while preserving its selected files, symbols and opened descendants", () => {
    const state: RetainedState = {
      pins: addPin(addPin(EMPTY_PIN_SET, "a/one.ts", "Thing"), "other/two.ts", "*"),
      openDirectories: new Set(["a", "a/nested", "other"])
    };
    const released = releaseRetained(state, { kind: "directory", directory: "a" });
    expect(released.pins).toBe(state.pins);
    expect([...released.openDirectories]).toEqual(["a/nested", "other"]);
    expect([...state.openDirectories]).toEqual(["a", "a/nested", "other"]);
  });

  it("bulk clearing removes contained selections without erasing relationships required by an outside pin", () => {
    const state: RetainedState = {
      pins: { entries: [
        { nodeId: "a/one.ts", symbol: "Thing" },
        { nodeId: "a/nested/two.ts", symbol: "*" },
        { nodeId: "ab/consumer.ts", symbol: "*" }
      ] },
      openDirectories: new Set(["", "a", "a/nested", "ab"])
    };
    const cleared = clearRetainedDirectory(state, "a");
    expect(cleared.pins.entries).toEqual([{ nodeId: "ab/consumer.ts", symbol: "*" }]);
    expect([...cleared.openDirectories]).toEqual(["", "ab"]);
    const links = [{ source: "ab/consumer.ts", target: "a/one.ts", kind: "dependency" as const, targetSymbol: "Thing" }];
    expect(getVisibleConnections(cleared.pins, links).map(connection => connection.link)).toEqual(links);
    const rootCleared = clearRetainedDirectory(state, "");
    expect(rootCleared.pins.entries).toEqual([]);
    expect(rootCleared.openDirectories.size).toBe(0);
  });

  it("interleaves directory and symbol selections across release, repinning and shared-link restoration", () => {
    let state = reconcileRetained({ pins: EMPTY_PIN_SET, openDirectories: new Set(["a"]) });
    state = reconcileRetained({ ...state, pins: addPin(state.pins, "a/one.ts", "Thing") });
    state = reconcileRetained({ ...state, openDirectories: new Set(["a", "a/nested"]) });
    const first = retainedItems(state)[0];
    const ordered = retainedItems(state).map(retainedKey);
    expect(ordered).toEqual([
      '["directory","a"]', '["pin","a/one.ts","Thing"]', '["directory","a/nested"]'
    ]);
    const restored = decompressSnapshot(compressSnapshot({
      ...DEFAULT_SNAPSHOT,
      pinSet: state.pins,
      openDirectories: state.openDirectories,
      retentionOrder: state.retentionOrder,
      filters: { showTests: true, showAssets: false },
      spatialLayout: "structure"
    }));
    expect(restored.retentionOrder).toEqual(ordered);
    expect(restored.spatialLayout).toBe("structure");
    state = releaseRetained(state, first);
    state = reconcileRetained({ ...state, openDirectories: new Set([...state.openDirectories, "a"]) });
    expect(retainedItems(state).map(retainedKey)).toEqual([...ordered.slice(1), ordered[0]]);
    const scrubbed = scrubSnapshot(restored, new Map([["a/nested/new.ts", {}]]));
    expect(scrubbed.retentionOrder).toEqual([ordered[0], ordered[2]]);
  });
});

describe("fold others away and unpin others", () => {
  const file = (nodeId: string): RetainedItem => ({ kind: "pin", pin: { nodeId, symbol: "*" } });
  const symbol = (nodeId: string, name: string): RetainedItem => ({ kind: "pin", pin: { nodeId, symbol: name } });
  const directory = (path: string): RetainedItem => ({ kind: "directory", directory: path });
  const keys = (state: RetainedState): string[] => retainedItems(state).map(retainedKey);
  // Oldest first: a whole file, two symbols of one file, another whole file, and two opened directories.
  const working = (): RetainedState => reconcileRetained({
    pins: { entries: [
      { nodeId: "a.ts", symbol: "*" },
      { nodeId: "b.ts", symbol: "run" },
      { nodeId: "b.ts", symbol: "stop" },
      { nodeId: "c.ts", symbol: "*" }
    ] },
    openDirectories: new Set(["lib", "lib/nested"])
  });

  describe("at the unpin strength", () => {
    it("keeps a file pinned whole and releases every other pin and directory", () => {
      const result = releaseOthers(working(), file("a.ts"), "unpin");
      expect(result.state.pins.entries).toEqual([{ nodeId: "a.ts", symbol: "*" }]);
      expect([...result.state.openDirectories]).toEqual([]);
      expect([result.pins, result.directories]).toEqual([3, 2]);
      expect(keys(result.state)).toEqual([retainedKey(file("a.ts"))]);
    });

    it("keeps a file narrowed to its symbols as it is, in its order", () => {
      const result = releaseOthers(working(), file("b.ts"), "unpin");
      expect(result.state.pins.entries).toEqual([{ nodeId: "b.ts", symbol: "run" }, { nodeId: "b.ts", symbol: "stop" }]);
      expect(keys(result.state)).toEqual([retainedKey(symbol("b.ts", "run")), retainedKey(symbol("b.ts", "stop"))]);
      expect([result.pins, result.directories]).toEqual([2, 2]);
    });

    it("keeps exactly a pinned symbol and releases its file's other symbols", () => {
      const result = releaseOthers(working(), symbol("b.ts", "stop"), "unpin");
      expect(result.state.pins.entries).toEqual([{ nodeId: "b.ts", symbol: "stop" }]);
      expect(result.pins).toBe(3);
    });

    it("keeps the whole-file pin that holds a symbol rather than narrowing it", () => {
      const result = releaseOthers(working(), symbol("a.ts", "Thing"), "unpin");
      expect(result.state.pins.entries).toEqual([{ nodeId: "a.ts", symbol: "*" }]);
      expect(result.pins).toBe(3);
    });

    it("pins a file drawn only because something else shows it, as the one pin, and keeps no directory for it", () => {
      const whole = releaseOthers(working(), file("lib/neighbour.ts"), "unpin");
      expect(whole.state.pins.entries).toEqual([{ nodeId: "lib/neighbour.ts", symbol: "*" }]);
      expect([...whole.state.openDirectories]).toEqual([]);
      expect([whole.pins, whole.directories]).toEqual([4, 2]);
      expect(keys(whole.state)).toEqual([retainedKey(file("lib/neighbour.ts"))]);
      const row = releaseOthers(working(), symbol("neighbour.ts", "helper"), "unpin");
      expect(row.state.pins.entries).toEqual([{ nodeId: "neighbour.ts", symbol: "helper" }]);
      // A symbol row of a narrowed file that is not itself pinned is in the picture only through its file's other pins.
      const sibling = releaseOthers(working(), symbol("b.ts", "reset"), "unpin");
      expect(sibling.state.pins.entries).toEqual([{ nodeId: "b.ts", symbol: "reset" }]);
      expect(sibling.pins).toBe(4);
    });

    it("leaves an unpinned subject or the discovery unpinned, since it stands in the picture by itself", () => {
      const subject = releaseOthers(working(), file("subject.ts"), "unpin", { subject: "subject.ts" });
      expect(subject.state.pins.entries).toEqual([]);
      expect([subject.pins, subject.directories]).toEqual([4, 2]);
      const discovered = releaseOthers(working(), symbol("found.ts", "run"), "unpin", { discovery: { kind: "file", nodeId: "found.ts" } });
      expect(discovered.state.pins.entries).toEqual([]);
      expect(discovered.discovery).toEqual({ kind: "file", nodeId: "found.ts" });
      expect(discovered.discoveryReleased).toBe(false);
    });

    it("keeps an opened directory open and releases its descendants and the pins inside it like any other", () => {
      const state = reconcileRetained({ ...working(), pins: addPin(working().pins, "lib/inside.ts", "*") });
      const result = releaseOthers(state, directory("lib"), "unpin");
      expect(result.state.pins.entries).toEqual([]);
      expect([...result.state.openDirectories]).toEqual(["lib"]);
      expect([result.pins, result.directories]).toEqual([5, 1]);
    });

    it("releases a pin whose file does not stand at the moment shown like any other, and leaves its input alone", () => {
      // Which files stand at a moment is the history's; the release does not ask it.
      const before = working();
      const words = (state: RetainedState): string => JSON.stringify({ ...state, openDirectories: [...state.openDirectories] });
      const snapshot = words(before);
      expect(releaseOthers(before, file("c.ts"), "unpin").pins).toBe(3);
      expect(words(before)).toBe(snapshot);
    });
  });

  describe("at the fold strength", () => {
    it("keeps every pin and closes every opened directory, pop and discovery elsewhere", () => {
      const result = releaseOthers(working(), file("a.ts"), "fold", {
        discovery: { kind: "directory", directory: "lib" },
        popped: new Set(["src", "src/deep"])
      });
      expect(result.state.pins).toEqual(working().pins);
      expect([...result.state.openDirectories]).toEqual([]);
      expect([...result.popped]).toEqual([]);
      expect(result.discovery).toBeNull();
      expect([result.pins, result.directories, result.discoveryReleased]).toEqual([0, 4, true]);
    });

    it("keeps open the directories that hold a file drawn only inside them, and nothing else", () => {
      const state: RetainedState = { pins: addPin(EMPTY_PIN_SET, "a.ts", "*"), openDirectories: new Set(["", "lib", "lib/nested", "other"]) };
      const result = releaseOthers(state, file("lib/nested/inside.ts"), "fold", { popped: new Set(["lib", "src"]) });
      expect([...result.state.openDirectories]).toEqual(["", "lib", "lib/nested"]);
      expect([...result.popped]).toEqual(["lib"]);
      expect(result.state.pins).toBe(state.pins);
      expect(result.directories).toBe(2);
      // Pinned, the same file is drawn wherever it stands, and every directory folds.
      const pinned = releaseOthers({ ...state, pins: addPin(state.pins, "lib/nested/inside.ts", "*") }, file("lib/nested/inside.ts"), "fold");
      expect([...pinned.state.openDirectories]).toEqual([]);
      // Displayed paths decide, as at a moment of the history whose paths differ from today's ids.
      const moved = releaseOthers(state, file("today.ts"), "fold", { pathOf: () => "other/then.ts" });
      expect([...moved.state.openDirectories]).toEqual(["", "other"]);
    });

    it("keeps an opened or popped directory kept, and the discovery that is the thing's own", () => {
      const result = releaseOthers(working(), directory("lib/nested"), "fold", { discovery: { kind: "directory", directory: "lib/nested" }, popped: new Set(["lib/nested", "x"]) });
      expect([...result.state.openDirectories]).toEqual(["lib/nested"]);
      expect([...result.popped]).toEqual(["lib/nested"]);
      expect(result.discovery).toEqual({ kind: "directory", directory: "lib/nested" });
      expect([result.directories, result.discoveryReleased]).toEqual([2, false]);
    });
  });

  it("releases nothing and returns the same state when nothing else is pinned or open", () => {
    const alone: RetainedState = { pins: { entries: [{ nodeId: "b.ts", symbol: "run" }, { nodeId: "b.ts", symbol: "stop" }] }, openDirectories: new Set() };
    for (const strength of ["fold", "unpin"] as const) {
      const result = releaseOthers(alone, file("b.ts"), strength);
      expect(result.state).toBe(alone);
      expect([result.pins, result.directories, result.discoveryReleased]).toEqual([0, 0, false]);
    }
    const folder: RetainedState = { pins: EMPTY_PIN_SET, openDirectories: new Set(["lib"]) };
    expect(releaseOthers(folder, directory("lib"), "unpin").state).toBe(folder);
    // A file with nothing pinned or open anywhere has nothing to release, so nothing is pinned either.
    expect(releaseOthers({ pins: EMPTY_PIN_SET, openDirectories: new Set() }, file("neighbour.ts"), "unpin").state.pins).toBe(EMPTY_PIN_SET);
    // With pins but nothing open elsewhere, folding has nothing to do.
    expect(releaseOthers(alone, file("a.ts"), "fold").directories).toBe(0);
  });

  it("says once, in plain words, what went", () => {
    expect(othersReleasedWords({ pins: 4, directories: 2, discoveryReleased: false })).toBe("Unpinned 4 others, folded 2 directories away");
    expect(othersReleasedWords({ pins: 1, directories: 0, discoveryReleased: false })).toBe("Unpinned 1 other");
    expect(othersReleasedWords({ pins: 0, directories: 3, discoveryReleased: false })).toBe("Folded 3 directories away");
    expect(othersReleasedWords({ pins: 0, directories: 1, discoveryReleased: true })).toBe("Folded 1 directory and the discovery away");
    expect(othersReleasedWords({ pins: 2, directories: 0, discoveryReleased: true })).toBe("Unpinned 2 others, folded the discovery away");
  });
});
