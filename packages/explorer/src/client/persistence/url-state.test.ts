import { describe, expect, it } from "vitest";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "./compressed-url-state";
import { parseNavigation } from "./url-state";

describe("navigation and representation", () => {
  it.each(["local", "map", "membrane", "circuit"])("migrates %s to the 2D Local Map", view => {
    expect(parseNavigation(`?view=${view}&node=src/a.ts`)).toMatchObject({ view: "map", perspective: "2d", nodeId: "src/a.ts", hasUrlState: true });
  });
  it.each(["force", "graph"])("migrates %s to the 3D Local Map", view => {
    expect(parseNavigation(`?view=${view}`)).toMatchObject({ view: "map", perspective: "3d" });
  });
  it("explicit mode overrides a legacy name, and unknown modes fall back safely", () => {
    expect(parseNavigation("?view=force&mode=2d").perspective).toBe("2d");
    expect(parseNavigation("?view=local&mode=nonsense").perspective).toBe("2d");
  });
  it("retains mode while another navigable view is active", () => {
    expect(parseNavigation("?view=sources&mode=3d")).toMatchObject({ view: "sources", perspective: "3d" });
    expect(parseNavigation("?view=world").perspective).toBeNull();
    expect(parseNavigation("").hasUrlState).toBe(false);
  });
  it("opens a named folder or the scan root without inventing a focused file", () => {
    expect(parseNavigation("?view=local&dir=src%2F").openDirectories).toEqual(new Set(["src"]));
    expect(parseNavigation("?dir=")).toMatchObject({ view: "map", perspective: "2d", nodeId: null, openDirectories: new Set([""]) });
  });
  it("gives the exploration snapshot priority over supplementary query parameters", () => {
    const s = compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", selectedNodeId: "src/a.ts" });
    expect(parseNavigation(`?s=${s}&view=world&mode=2d&node=elsewhere.ts`)).toMatchObject({ view: "map", perspective: "3d", nodeId: "src/a.ts" });
  });
});
