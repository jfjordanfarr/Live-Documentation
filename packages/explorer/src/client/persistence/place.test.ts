import { describe, expect, it } from "vitest";

import { compressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "./compressed-url-state";
import { placeOf } from "./place";
import { addPin } from "../views/membraneView/pin-state";

const membrane = (snapshot: Partial<UrlStateSnapshot>): string =>
  `?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, ...snapshot })}`;

describe("placeOf", () => {
  it("tells views and files apart", () => {
    expect(placeOf("?view=world")).not.toBe(placeOf("?view=local&node=a.ts"));
    expect(placeOf("?view=local&node=a.ts")).not.toBe(placeOf("?view=local&node=b.ts"));
  });

  it("reads a node without a view as the Local Map, as the page opens it", () => {
    expect(placeOf("?node=a.ts")).toBe(placeOf("?view=local&node=a.ts"));
  });

  it("counts an opened folder of the Membrane Map as a move", () => {
    expect(placeOf(membrane({ expandedDirectories: new Set(["packages"]) })))
      .not.toBe(placeOf(membrane({ expandedDirectories: new Set(["packages", "packages/engine"]) })));
  });

  it("reads pins, expanded cards, pan and zoom as the same place", () => {
    const folders = new Set(["packages", "packages/engine"]);
    const before = membrane({ expandedDirectories: folders });
    const after = membrane({
      expandedDirectories: folders,
      pinSet: addPin(DEFAULT_SNAPSHOT.pinSet, "packages/engine/src/a.ts", "run"),
      expandedCards: new Set(["packages/engine/src/a.ts"]),
      transform: { x: 40, y: -12, k: 1.6 }
    });
    expect(after).not.toBe(before);
    expect(placeOf(after)).toBe(placeOf(before));
  });

  it("counts a path only once it has both ends", () => {
    expect(placeOf("?view=local&node=a.ts&from=a.ts")).toBe(placeOf("?view=local&node=a.ts"));
    expect(placeOf("?view=local&node=a.ts&from=a.ts&to=b.ts")).not.toBe(placeOf("?view=local&node=a.ts"));
  });

  it("ignores which data file the page was opened on", () => {
    expect(placeOf("?view=world&data=other.json")).toBe(placeOf("?view=world"));
  });
});
