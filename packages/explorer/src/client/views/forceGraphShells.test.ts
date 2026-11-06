import { describe, expect, it } from "vitest";

import type { FileConnection } from "./fileConnections";
import { linkPulls, shellRadius, spatialNodeRadius, type SpatialLink } from "./forceGraphLayout";
import { connectedNeighbours, spatialScope, type StartableNode } from "./forceGraphScope";
import { bodyShape, directoryAt, OUTER_LAYER, packingRadius, partitionHidden, phantomShape, poppedAfter, shellDirectory, shellId, shellPicture, type ShellPartition } from "./forceGraphShells";
import { wrapperHull, wrapperPadding, type WrapperHull } from "./forceGraphWrappers";
import { getDefaultTuning } from "../persistence/local-storage";

const tuning = getDefaultTuning().forceGraph;
const file = (id: string, symbols = 0): StartableNode => ({ id, publicSymbols: Array.from({ length: symbols }, (_, i) => `s${i}`), codeRelativePath: id });

/** Ten hidden files over a small tree: a deep pair, a directory's own file and a lone subdirectory file, a pair elsewhere, lone files. */
const HIDDEN = ["packages/explorer/src/a.ts", "packages/explorer/src/b.ts", "packages/explorer/views/c.ts", "packages/explorer/d.ts",
  "packages/cli/e.ts", "packages/cli/f.ts", "packages/engine/g.ts", "tests/x.ts", "tests/y.ts", "root.ts"];
const hidden = HIDDEN.map(id => ({ id, path: id }));

const shellsOf = (partition: ShellPartition): Record<string, readonly string[]> => Object.fromEntries(partition.shells.map(shell => [shell.directory, shell.files]));
const namesOf = (partition: ShellPartition): string[] => partition.shells.map(shell => shell.name);
/** Every hidden file is held, released or loose, and once only: a partition loses nothing. */
function accountsForAll(partition: ShellPartition, files: readonly string[]): void {
  const counted = [...partition.shells.flatMap(shell => shell.files), ...partition.released, ...partition.loose].sort();
  expect(counted).toEqual([...files].sort());
}

describe("the shells' partition of the hidden files by directory", () => {
  it("holds each directory's hidden files at the Shell Depth, two files or more to a shell, the rest loose", () => {
    const two = partitionHidden(hidden, 2, new Set());
    expect(shellsOf(two)).toEqual({
      "packages/cli": ["packages/cli/e.ts", "packages/cli/f.ts"],
      "packages/explorer": ["packages/explorer/d.ts", "packages/explorer/src/a.ts", "packages/explorer/src/b.ts", "packages/explorer/views/c.ts"],
      // A directory shallower than the depth holds its own files.
      tests: ["tests/x.ts", "tests/y.ts"]
    });
    expect(two.loose).toEqual(["packages/engine/g.ts", "root.ts"]);
    expect(two.released).toEqual([]);
    expect(two.shells.map(shell => shell.id)).toEqual(["shell:packages/cli", "shell:packages/explorer", "shell:tests"]);
    expect(namesOf(two)).toEqual(["cli", "explorer", "tests"]);
    accountsForAll(two, HIDDEN);
  });

  it("holds more in fewer shells at depth 1, and fewer in more at depth 3", () => {
    const one = partitionHidden(hidden, 1, new Set());
    expect(shellsOf(one)).toEqual({ packages: HIDDEN.filter(id => id.startsWith("packages/")).sort(), tests: ["tests/x.ts", "tests/y.ts"] });
    expect(one.loose).toEqual(["root.ts"]);
    const three = partitionHidden(hidden, 3, new Set());
    expect(shellsOf(three)).toEqual({ "packages/cli": ["packages/cli/e.ts", "packages/cli/f.ts"],
      "packages/explorer/src": ["packages/explorer/src/a.ts", "packages/explorer/src/b.ts"], tests: ["tests/x.ts", "tests/y.ts"] });
    expect(three.loose).toEqual(["packages/engine/g.ts", "packages/explorer/d.ts", "packages/explorer/views/c.ts", "root.ts"]);
    for (const partition of [one, three]) accountsForAll(partition, HIDDEN);
  });

  it("gives the scan root's own files a shell of their own, and refuses a depth that is not a whole number of directories", () => {
    const rooted = partitionHidden([{ id: "a.ts", path: "a.ts" }, { id: "b.ts", path: "b.ts" }], 2, new Set());
    expect(rooted.shells).toEqual([{ id: shellId(""), directory: "", name: "Scan root", files: ["a.ts", "b.ts"] }]);
    expect(shellDirectory(shellId(""))).toBe("");
    expect(shellDirectory("a.ts")).toBeUndefined();
    expect(directoryAt("packages/explorer/src", 2)).toBe("packages/explorer");
    expect(directoryAt("tests", 2)).toBe("tests");
    expect(() => partitionHidden(hidden, 0, new Set())).toThrow(/depth/);
    expect(() => partitionHidden(hidden, 1.5, new Set())).toThrow(/depth/);
  });
});

describe("a shell over a chain of directories", () => {
  const chain = ["lib/core/src/x.ts", "lib/core/src/y.ts", "lib/core/src/deep/z.ts", "lib/core/src/deep/w.ts", "lib/core/src/one/v.ts"].map(id => ({ id, path: id }));

  it("stands for the deepest directory holding all its files, named by the chain from its cut", () => {
    const partition = partitionHidden(chain, 2, new Set());
    expect(partition.shells.map(({ id, directory, name }) => ({ id, directory, name }))).toEqual([{ id: "shell:lib/core/src", directory: "lib/core/src", name: "core/src" }]);
  });

  it("opens onto its own files and its subdirectories when popped, the chain above it with it", () => {
    const partition = partitionHidden(chain, 2, poppedAfter(new Set(), "lib/core/src", true));
    expect(partition.released).toEqual(["lib/core/src/one/v.ts", "lib/core/src/x.ts", "lib/core/src/y.ts"]);
    expect(shellsOf(partition)).toEqual({ "lib/core/src/deep": ["lib/core/src/deep/w.ts", "lib/core/src/deep/z.ts"] });
    accountsForAll(partition, chain.map(file => file.id));
    // A pop below the cut opens nothing above it: the scan root's own files keep their shell.
    const rooted = [...chain, { id: "a.ts", path: "a.ts" }, { id: "b.ts", path: "b.ts" }];
    expect(partitionHidden(rooted, 2, poppedAfter(new Set(), "lib/core/src", true)).shells.map(shell => shell.directory)).toEqual(["", "lib/core/src/deep"]);
    // Wrapped again, it is the one shell it was.
    expect(partitionHidden(chain, 2, poppedAfter(poppedAfter(new Set(), "lib/core/src", true), "lib/core/src", false))).toEqual(partitionHidden(chain, 2, new Set()));
  });
});

describe("a pop", () => {
  it("shows a popped directory's own files, makes its subdirectories shells, and loses nothing it held", () => {
    const before = partitionHidden(hidden, 2, new Set());
    const held = before.shells.find(shell => shell.directory === "packages/explorer")!.files;
    const after = partitionHidden(hidden, 2, poppedAfter(new Set(), "packages/explorer", true));
    // Its own file enters, and so does the lone file of a subdirectory the pop opened, which no shell would hold.
    expect(after.released).toEqual(["packages/explorer/d.ts", "packages/explorer/views/c.ts"]);
    expect(shellsOf(after)).toEqual({ "packages/cli": ["packages/cli/e.ts", "packages/cli/f.ts"],
      "packages/explorer/src": ["packages/explorer/src/a.ts", "packages/explorer/src/b.ts"], tests: ["tests/x.ts", "tests/y.ts"] });
    for (const id of held) expect(after.released.includes(id) || after.shells.some(shell => shell.files.includes(id)), id).toBe(true);
    // The other shells and the loose files are as they were.
    expect(after.loose).toEqual(before.loose);
    accountsForAll(after, HIDDEN);
  });

  it("opens a shell within a popped one, and wraps both again with the outer one", () => {
    const outer = poppedAfter(new Set(), "packages/explorer", true), both = poppedAfter(outer, "packages/explorer/src", true);
    const inner = partitionHidden(hidden, 2, both);
    expect(inner.released).toEqual(["packages/explorer/d.ts", "packages/explorer/src/a.ts", "packages/explorer/src/b.ts", "packages/explorer/views/c.ts"]);
    expect(inner.shells.map(shell => shell.directory)).toEqual(["packages/cli", "tests"]);
    accountsForAll(inner, HIDDEN);
    const wrapped = poppedAfter(both, "packages/explorer", false);
    expect([...wrapped]).toEqual([]);
    expect(partitionHidden(hidden, 2, wrapped)).toEqual(partitionHidden(hidden, 2, new Set()));
    // Wrapping the scan root again wraps everything; another directory's pop is not touched by a sibling's.
    expect([...poppedAfter(both, "", false)]).toEqual([]);
    expect([...poppedAfter(new Set(["packages/cli", "packages/explorer"]), "packages/explorer", false)]).toEqual(["packages/cli"]);
  });
});

/** A connected picture: two shown files at the root, the hidden files above wired to them, to each other, and within a shell. */
function connected(): { nodes: Array<StartableNode & { codeRelativePath: string }>; links: FileConnection[] } {
  const nodes = ["s1.ts", "s2.ts", ...HIDDEN].map(id => ({ ...file(id), codeRelativePath: id }));
  const pair = (source: string, target: string, forward: number, backward: number, kind = "dependency"): FileConnection => {
    if (!(source < target)) throw new Error("A file pair's ends are in path order.");
    return { source, target, kind, count: forward + backward, forward, backward };
  };
  const links = [
    pair("packages/explorer/src/a.ts", "s1.ts", 2, 1), // a uses s1 twice, s1 uses a once
    pair("packages/explorer/d.ts", "s1.ts", 3, 0),
    pair("packages/cli/e.ts", "s2.ts", 0, 4), // s2 uses e
    pair("packages/cli/f.ts", "packages/explorer/src/b.ts", 1, 2), // between two shells
    pair("packages/explorer/src/a.ts", "packages/explorer/src/b.ts", 5, 0), // within one shell
    pair("s1.ts", "s2.ts", 1, 0), // the picture's own wire
    pair("packages/engine/g.ts", "s1.ts", 1, 0), // to a loose file
    pair("tests/x.ts", "tests/y.ts", 1, 0, "containment") // never bundled
  ];
  return { nodes, links };
}

describe("a shell's wires", () => {
  const { nodes, links } = connected();
  const pulls = (link: { kind?: string }): boolean => linkPulls(link, "connections");
  const picture = (popped: ReadonlySet<string>) => shellPicture({ nodes, links, shown: new Set(["s1.ts", "s2.ts"]), hidden: HIDDEN, depth: 2, popped,
    beside: connectedNeighbours(nodes, links, pulls), bundles: link => link.kind !== "containment" });

  it("bundle each pair's references into one wire with its count, both directions kept, shell to shell as to a file", () => {
    const shells = picture(new Set());
    expect(shells.wires).toEqual([
      // In id order: s1 uses the explorer's shell once (a), and the shell's files use s1 five times (a twice, d three).
      { source: "s1.ts", target: "shell:packages/explorer", kind: "dependency", count: 6, forward: 1, backward: 5 },
      { source: "s2.ts", target: "shell:packages/cli", kind: "dependency", count: 4, forward: 4, backward: 0 },
      { source: "shell:packages/cli", target: "shell:packages/explorer", kind: "dependency", count: 3, forward: 1, backward: 2 }
    ]);
    expect(shells.shells.find(shell => shell.id === "shell:packages/explorer")!.files).toContain("packages/explorer/src/b.ts");
    expect(shells.loose).toEqual(["packages/engine/g.ts", "root.ts"]);
    // A ring is left only where a connected file is neither shown nor held: s1's loose neighbour; s2's are all held or shown.
    expect([...shells.beyond]).toEqual([["s1.ts", 1]]);
  });

  it("resolve into the files' own wires when a pop releases them", () => {
    const popped = picture(poppedAfter(new Set(), "packages/explorer", true));
    expect(popped.released).toEqual(["packages/explorer/d.ts", "packages/explorer/views/c.ts"]);
    // d now stands: its wire to s1 is the picture's own. a, in the src shell, still wires s1 through it, and b's to the cli shell.
    expect(popped.wires).toEqual([
      { source: "s1.ts", target: "shell:packages/explorer/src", kind: "dependency", count: 3, forward: 1, backward: 2 },
      { source: "s2.ts", target: "shell:packages/cli", kind: "dependency", count: 4, forward: 4, backward: 0 },
      { source: "shell:packages/cli", target: "shell:packages/explorer/src", kind: "dependency", count: 3, forward: 1, backward: 2 }
    ]);
  });

  it("are read from the scope's hidden files: the rest of a group shown in part, never a group shown only by its seed", () => {
    const island = [file("z/p.ts"), file("z/q.ts")];
    const all = [...nodes, ...island];
    const both: SpatialLink[] = [...links, { source: "z/p.ts", target: "z/q.ts", count: 1, kind: "dependency" }];
    const scope = spatialScope(all, both, new Set(["s2.ts"]), 1, pulls);
    expect(scope.groups.get("z/p.ts") ?? scope.groups.get("z/q.ts")).toBe(2);
    expect(scope.hidden.some(id => id.startsWith("z/"))).toBe(false);
    // s2's hop shows s1 and e; the rest of their group is hidden, never the files no reference reaches, each a group of its own.
    const alone = ["packages/explorer/views/c.ts", "root.ts", "tests/x.ts", "tests/y.ts"];
    expect(scope.hidden.sort()).toEqual(HIDDEN.filter(id => id !== "packages/cli/e.ts" && !alone.includes(id)).sort());
  });
});

/** The signed distance of a point beyond the hull's farthest triangle plane; within the hull it is at most zero. */
function farthestBeyond(hull: WrapperHull, x: number, y: number, z: number): number {
  let worst = -Infinity;
  const p = hull.positions;
  for (let i = 0; i < hull.triangles.length; i += 3) {
    const a = 3 * hull.triangles[i], b = 3 * hull.triangles[i + 1], c = 3 * hull.triangles[i + 2];
    const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2], vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, length = Math.hypot(nx, ny, nz);
    if (length < 1e-9) continue;
    worst = Math.max(worst, (nx * (x - p[a]) + ny * (y - p[a + 1]) + nz * (z - p[a + 2])) / length);
  }
  return worst;
}

describe("a shell's body and its phantom packing", () => {
  const padding = wrapperPadding(tuning);

  it("grows with the cube root of its files from a file with no symbols, and its children's volumes fit its own", () => {
    expect(shellRadius(1, tuning)).toBeCloseTo(spatialNodeRadius(file("x"), tuning), 9);
    expect(shellRadius(27, tuning)).toBeCloseTo(3 * shellRadius(1, tuning), 9);
    expect(shellRadius(3, tuning) ** 3 + shellRadius(7, tuning) ** 3).toBeCloseTo(shellRadius(10, tuning) ** 3, 6);
    // A shell node is sized by its files, in the field and on screen alike; its packing takes the files in their padding.
    expect(spatialNodeRadius({ id: "shell:a", publicSymbols: [], shellFiles: 64 }, tuning)).toBe(shellRadius(64, tuning));
    expect(packingRadius(8, tuning, padding)).toBeCloseTo(2 * (tuning.nodeSize + padding), 9);
  });

  for (const count of [2, 7, OUTER_LAYER + 1, 300]) {
    it(`packs ${count} files the same every time, inside the packing, every one padded within the hull`, () => {
      const files = Array.from({ length: count }, (_, i) => file(`d/f${String(i).padStart(3, "0")}.ts`, (i * 7) % 11));
      const shape = bodyShape("shell:d", files, tuning, padding);
      expect(bodyShape("shell:d", [...files].reverse(), tuning, padding)).toEqual(shape);
      expect(shape.members.map(member => member.id).sort()).toEqual(files.map(node => node.id));
      const body = packingRadius(count, tuning, padding);
      const hull = wrapperHull(shape, padding);
      // Drawn to fit the shell's body, the hull shrinks toward it, never grows.
      expect(shellRadius(count, tuning) / hull.radius).toBeLessThan(1);
      for (const member of shape.members) {
        const out = Math.hypot(member.x, member.y, member.z);
        // A member stands where its padded sphere fits the body, at the centre when the body is too small for it.
        if (member.radius + padding <= body) expect(out + member.radius + padding, member.id).toBeLessThanOrEqual(body + 1e-9);
        else expect(out, member.id).toBe(0);
        expect(farthestBeyond(hull, member.x, member.y, member.z) + member.radius + padding, member.id).toBeLessThanOrEqual(1e-6);
      }
      // Lumpy, not a gem: the members stand at many depths, not on one sphere.
      const depths = shape.members.map(member => Math.hypot(member.x, member.y, member.z));
      expect(Math.max(...depths) - Math.min(...depths)).toBeGreaterThan(0.05 * body);
    });
  }

  it("packs a shell's subdirectories each together, inside the packing, its own files alone, so a pop's shells are born where their files stood", () => {
    const files = [...Array.from({ length: 6 }, (_, i) => file(`p/models/m${i}.ts`, i)), ...Array.from({ length: 3 }, (_, i) => file(`p/pages/deep/q${i}.ts`)),
      file("p/own.ts", 4), file("p/other.ts")];
    const shape = bodyShape("shell:p", files, tuning, padding, undefined, "p");
    const byId = (members: readonly { id: string }[]) => [...members].sort((a, b) => (a.id < b.id ? -1 : 1));
    const reversed = bodyShape("shell:p", [...files].reverse(), tuning, padding, undefined, "p");
    expect(byId(reversed.members)).toEqual(byId(shape.members));
    expect(byId(reversed.outline!)).toEqual(byId(shape.outline!));
    const body = packingRadius(files.length, tuning, padding), hull = wrapperHull(shape, padding);
    const at = new Map(shape.members.map(member => [member.id, member]));
    for (const member of shape.members) {
      expect(Math.hypot(member.x, member.y, member.z) + member.radius + padding, member.id).toBeLessThanOrEqual(body + 1e-9);
      expect(farthestBeyond(hull, member.x, member.y, member.z) + member.radius + padding, member.id).toBeLessThanOrEqual(1e-6);
    }
    // Each subdirectory's files stand within its own ball about their centroid, at its centre, and the two balls stand apart.
    const centroid = (prefix: string): { x: number; y: number; z: number } => {
      const members = shape.members.filter(member => member.id.startsWith(prefix));
      return { x: members.reduce((s, m) => s + m.x, 0) / members.length, y: members.reduce((s, m) => s + m.y, 0) / members.length, z: members.reduce((s, m) => s + m.z, 0) / members.length };
    };
    const models = centroid("p/models/"), pages = centroid("p/pages/");
    for (const [prefix, centre, count] of [["p/models/", models, 6], ["p/pages/", pages, 3]] as const) {
      for (const member of shape.members.filter(m => m.id.startsWith(prefix))) {
        expect(Math.hypot(member.x - centre.x, member.y - centre.y, member.z - centre.z) + member.radius, member.id).toBeLessThanOrEqual(packingRadius(count, tuning, padding) + 1e-6);
      }
    }
    expect(Math.hypot(models.x - pages.x, models.y - pages.y, models.z - pages.z)).toBeGreaterThan(0.5 * packingRadius(3, tuning, padding));
    expect(at.get("p/own.ts")).toBeDefined();
    // The hull is taken over the subdirectories' balls and the shell's own files: four spheres, not eleven.
    expect(shape.outline?.length).toBe(4);
  });

  it("stands a group's seed at its centre, the rest about it", () => {
    const shape = phantomShape("seed", [{ id: "b", radius: 4 }, { id: "seed", radius: 6 }, { id: "a", radius: 4 }], 30, padding, "seed");
    expect(shape.members.find(member => member.id === "seed")).toEqual({ id: "seed", x: 0, y: 0, z: 0, radius: 6 });
    for (const member of shape.members.filter(member => member.id !== "seed")) expect(Math.hypot(member.x, member.y, member.z)).toBeGreaterThan(0);
  });
});
