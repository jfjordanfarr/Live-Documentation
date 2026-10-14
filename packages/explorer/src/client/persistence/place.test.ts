import { describe, expect, it } from "vitest";

import { compressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "./compressed-url-state";
import { placeOf } from "./place";
import { addPin } from "../views/pin-state";

const exploration = (snapshot: Partial<UrlStateSnapshot>): string =>
  `?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, ...snapshot })}`;

describe("placeOf", () => {
  it("tells views and files apart", () => {
    expect(placeOf("?view=world")).not.toBe(placeOf("?view=local&node=a.ts"));
    expect(placeOf("?view=local&node=a.ts")).not.toBe(placeOf("?view=local&node=b.ts"));
  });

  it("reads a node without a view as the Local Map, as the page opens it", () => {
    expect(placeOf("?node=a.ts")).toBe(placeOf("?view=local&node=a.ts"));
  });

  it("counts an opened folder of the Local Map as a move", () => {
    expect(placeOf(exploration({ openDirectories: new Set(["packages"]) })))
      .not.toBe(placeOf(exploration({ openDirectories: new Set(["packages", "packages/engine"]) })));
  });

  it("reads pins as the same place", () => {
    const folders = new Set(["packages", "packages/engine"]);
    const before = exploration({ openDirectories: folders });
    const after = exploration({
      openDirectories: folders,
      pinSet: addPin(DEFAULT_SNAPSHOT.pinSet, "packages/engine/src/a.ts", "run"),
    });
    expect(after).not.toBe(before);
    expect(placeOf(after)).toBe(placeOf(before));
  });

  it("keeps explicit representation changes in history within the Local Map", () => {
    expect(placeOf("?view=local&mode=2d&node=a.ts")).not.toBe(placeOf("?view=local&mode=3d&node=a.ts"));
    expect(placeOf("?view=force&node=a.ts")).toBe(placeOf("?view=local&mode=3d&node=a.ts"));
    expect(placeOf("?view=sources&mode=2d")).toBe(placeOf("?view=sources&mode=3d"));
  });

  it("counts the end of a path asked for, a file with or without its symbol or a directory, and not the pins it starts from", () => {
    const base: UrlStateSnapshot = { ...DEFAULT_SNAPSHOT, selectedNodeId: "a.ts", pinSet: addPin(DEFAULT_SNAPSHOT.pinSet, "a.ts", "*") };
    const at = (snapshot: UrlStateSnapshot) => placeOf(`?s=${compressSnapshot(snapshot)}`);
    expect(at(base)).toBe(at({ ...base, pinSet: DEFAULT_SNAPSHOT.pinSet }));
    expect(at({ ...base, destination: { kind: "file", nodeId: "b.ts" } })).not.toBe(at(base));
    expect(at({ ...base, destination: { kind: "file", nodeId: "b.ts", symbol: "run" } })).not.toBe(at({ ...base, destination: { kind: "file", nodeId: "b.ts" } }));
    expect(at({ ...base, destination: { kind: "directory", directory: "src" } })).not.toBe(at({ ...base, destination: { kind: "file", nodeId: "b.ts" } }));
    expect(at({ ...base, destination: { kind: "directory", directory: "src" } })).toBe(at({ ...base, destination: { kind: "directory", directory: "src" } }));
  });

  it("ignores which data file the page was opened on", () => {
    expect(placeOf("?view=world&data=other.json")).toBe(placeOf("?view=world"));
  });
});
