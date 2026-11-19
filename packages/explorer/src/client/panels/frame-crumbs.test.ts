import { describe, expect, it } from "vitest";
import { crumbsOf, outwardCrumb } from "./frame-crumbs";

describe("the Bare frame's crumbs", () => {
  it("are Knowledge Sources alone on that view, with or without a board", () => {
    expect(crumbsOf({ view: "sources", hasBoard: true, subject: null })).toEqual([{ kind: "view", view: "sources", current: true }]);
    expect(crumbsOf({ view: "sources", hasBoard: false, subject: { kind: "file", path: "a/b.ts" } })).toEqual([{ kind: "view", view: "sources", current: true }]);
  });

  it("are the World Map alone on the World Map, the place shown", () => {
    expect(crumbsOf({ view: "world", hasBoard: true, subject: { kind: "file", path: "a/b.ts" } })).toEqual([{ kind: "view", view: "world", current: true }]);
  });

  it("go from the World Map through the scan root and each directory to the subject file", () => {
    expect(crumbsOf({ view: "map", hasBoard: true, subject: { kind: "file", path: "packages/explorer/src/index.ts" } })).toEqual([
      { kind: "view", view: "world", current: false },
      { kind: "directory", path: "", name: "", current: false },
      { kind: "directory", path: "packages", name: "packages", current: false },
      { kind: "directory", path: "packages/explorer", name: "explorer", current: false },
      { kind: "directory", path: "packages/explorer/src", name: "src", current: false },
      { kind: "file", path: "packages/explorer/src/index.ts", name: "index.ts", current: true }
    ]);
  });

  it("leave the World Map out when the bundle carries no board", () => {
    const crumbs = crumbsOf({ view: "map", hasBoard: false, subject: { kind: "file", path: "README.md" } });
    expect(crumbs).toEqual([
      { kind: "directory", path: "", name: "", current: false },
      { kind: "file", path: "README.md", name: "README.md", current: true }
    ]);
  });

  it("end at a directory subject, which is the place shown", () => {
    const crumbs = crumbsOf({ view: "map", hasBoard: true, subject: { kind: "directory", path: "scripts/live-docs/" } });
    expect(crumbs.slice(1)).toEqual([
      { kind: "directory", path: "", name: "", current: false },
      { kind: "directory", path: "scripts", name: "scripts", current: false },
      { kind: "directory", path: "scripts/live-docs", name: "live-docs", current: true }
    ]);
  });

  it("end at the scan root when the Local Map has no subject or the subject is the root", () => {
    for (const subject of [null, { kind: "directory" as const, path: "" }]) {
      expect(crumbsOf({ view: "map", hasBoard: true, subject })).toEqual([
        { kind: "view", view: "world", current: false },
        { kind: "directory", path: "", name: "", current: true }
      ]);
    }
  });

  it("have exactly one place shown, and it is the last", () => {
    const inputs = [
      { view: "map" as const, hasBoard: true, subject: { kind: "file" as const, path: "a/b/c.ts" } },
      { view: "map" as const, hasBoard: false, subject: { kind: "directory" as const, path: "a" } },
      { view: "world" as const, hasBoard: true, subject: null }
    ];
    for (const input of inputs) {
      const crumbs = crumbsOf(input);
      expect(crumbs.filter(crumb => crumb.current)).toHaveLength(1);
      expect(crumbs.at(-1)!.current).toBe(true);
    }
  });

  it("go out one scale from a narrow window's back chevron, and nowhere from the outermost", () => {
    const crumbs = crumbsOf({ view: "map", hasBoard: true, subject: { kind: "file", path: "src/a.ts" } });
    expect(outwardCrumb(crumbs)).toEqual({ kind: "directory", path: "src", name: "src", current: false });
    expect(outwardCrumb(crumbsOf({ view: "world", hasBoard: true, subject: null }))).toBeNull();
  });
});
