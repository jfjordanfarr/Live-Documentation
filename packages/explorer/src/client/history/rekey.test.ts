import { describe, expect, it } from "vitest";

import { composedRenames, hasRenames, invertedRenames, NO_RENAMES, rekeyedCaches, renamedDirectory, renamedId, type Renames } from "./rekey";

const renames: Renames = {
  files: new Map([["packages/shared/src/core.ts", "packages/engine/src/core.ts"]]),
  directories: new Map([["packages/shared", "packages/engine"], ["packages/shared/src/tooling/__fixtures__", "scripts/doc-tools/__fixtures__"]])
};

describe("renamedId", () => {
  it("moves a file by its path, a hub by the innermost renamed directory that holds it, and leaves the rest", () => {
    expect(renamedId("packages/shared/src/core.ts", renames)).toBe("packages/engine/src/core.ts");
    expect(renamedId("packages/shared/src/other.ts", renames)).toBe("packages/shared/src/other.ts");
    expect(renamedId("directory:packages/shared", renames)).toBe("directory:packages/engine");
    expect(renamedId("directory:packages/shared/src/live-docs", renames)).toBe("directory:packages/engine/src/live-docs");
    expect(renamedId("directory:packages/shared/src/tooling/__fixtures__/links", renames)).toBe("directory:scripts/doc-tools/__fixtures__/links");
    expect(renamedId("directory:packages/sharedness", renames)).toBe("directory:packages/sharedness");
    expect(renamedDirectory("", renames.directories)).toBe("");
    expect(renamedId("related:README.md", renames)).toBe("related:README.md");
  });
});

describe("rekeyedCaches", () => {
  const linkKey = (link: { kind: string; source: string | { id: string }; target: string | { id: string } }): string =>
    `${link.kind}|${typeof link.source === "string" ? link.source : link.source.id}|${typeof link.target === "string" ? link.target : link.target.id}`;

  it("keeps every object, rewrites the ids of the renamed, moves string ends with them, and recomputes every key", () => {
    const core = { id: "packages/shared/src/core.ts" };
    const hub = { id: "directory:packages/shared" };
    const other = { id: "scripts/run.ts" };
    const nodes = new Map([[core.id, core], [hub.id, hub], [other.id, other]]);
    const resolved = { kind: "containment", source: hub, target: core };
    const unresolved = { kind: "dependency", source: "scripts/run.ts", target: "packages/shared/src/core.ts" };
    type Link = { kind: string; source: string | { id: string }; target: string | { id: string } };
    const links = new Map<string, Link>([[linkKey(resolved), resolved], [linkKey(unresolved), unresolved]]);
    const moved = rekeyedCaches(nodes, links, renames, linkKey);
    expect([...moved.nodes.keys()].sort()).toEqual(["directory:packages/engine", "packages/engine/src/core.ts", "scripts/run.ts"]);
    expect(moved.nodes.get("packages/engine/src/core.ts")).toBe(core);
    expect(core.id).toBe("packages/engine/src/core.ts");
    expect(hub.id).toBe("directory:packages/engine");
    expect([...moved.links.keys()].sort()).toEqual(["containment|directory:packages/engine|packages/engine/src/core.ts", "dependency|scripts/run.ts|packages/engine/src/core.ts"]);
    expect(moved.links.get("containment|directory:packages/engine|packages/engine/src/core.ts")).toBe(resolved);
    expect(unresolved.target).toBe("packages/engine/src/core.ts");
    expect(resolved.target).toBe(core);
  });

  it("copies the caches as they are when nothing is renamed", () => {
    const node = { id: "a.ts" };
    const nodes = new Map([["a.ts", node]]);
    const moved = rekeyedCaches(nodes, new Map(), NO_RENAMES, linkKey);
    expect(moved.nodes).not.toBe(nodes);
    expect(moved.nodes.get("a.ts")).toBe(node);
    expect(hasRenames(NO_RENAMES)).toBe(false);
    expect(hasRenames(renames)).toBe(true);
  });
});

describe("inverted and composed renames", () => {
  it("reads the renames the other way for a step back", () => {
    const back = invertedRenames(renames);
    expect(back.files.get("packages/engine/src/core.ts")).toBe("packages/shared/src/core.ts");
    expect(back.directories.get("packages/engine")).toBe("packages/shared");
  });

  it("chains two moves, a path renamed twice going where the second took it, and keeps a second move's fresh renames", () => {
    const second: Renames = { files: new Map([["packages/engine/src/core.ts", "packages/engine/src/live-docs/core.ts"], ["b.ts", "c.ts"]]), directories: new Map() };
    const composed = composedRenames(renames, second);
    expect(composed.files.get("packages/shared/src/core.ts")).toBe("packages/engine/src/live-docs/core.ts");
    expect(composed.files.has("packages/engine/src/core.ts")).toBe(false);
    expect(composed.files.get("b.ts")).toBe("c.ts");
    expect(composed.directories.get("packages/shared")).toBe("packages/engine");
  });
});
