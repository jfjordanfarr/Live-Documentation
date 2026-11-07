import { describe, expect, it } from "vitest";

import type { FileConnection } from "./fileConnections";
import { linkPulls, shellRadiusOf, spatialNodeRadius, type SpatialLink } from "./forceGraphLayout";
import { connectedNeighbours, spatialScope, type StartableNode } from "./forceGraphScope";
import { bodyGaps, bodyShape, directoryAt, DRAWN_FILES, packBall, partitionHidden, poppedAfter, shellDirectory, shellId, shellPicture, type ShellPartition } from "./forceGraphShells";
import { wrapperHull, type WrapperHull } from "./forceGraphWrappers";
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

describe("a ball of spheres packed apart (2026-11-06, second round)", () => {
  const spheres = (count: number, big = 0): Array<{ id: string; radius: number }> =>
    Array.from({ length: count }, (_, i) => ({ id: `u${String(i).padStart(4, "0")}`, radius: i < big ? 30 + 7 * i : 4 + ((i * 7919) % 13) * 0.7 }));
  const shortfall = (units: ReadonlyArray<{ id: string; radius: number }>, places: Map<string, { x: number; y: number; z: number }>, gap: number): number => {
    let worst = 0;
    for (let i = 0; i < units.length; i++) for (let j = i + 1; j < units.length; j++) {
      const a = places.get(units[i].id)!, b = places.get(units[j].id)!;
      worst = Math.max(worst, units[i].radius + units[j].radius + gap - Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z));
    }
    return worst;
  };

  for (const [count, big] of [[1, 0], [2, 2], [7, 3], [40, 2], [120, 0]] as const) {
    it(`keeps ${count} spheres apart by the gap, held by its extent, the same whatever their order`, () => {
      const units = spheres(count, big), { places, extent } = packBall(units, 5);
      expect(shortfall(units, places, 5)).toBeLessThanOrEqual(5 / 100);
      for (const unit of units) { const at = places.get(unit.id)!; expect(Math.hypot(at.x, at.y, at.z) + unit.radius).toBeLessThanOrEqual(extent + 1e-9); }
      expect(packBall([...units].reverse(), 5)).toEqual({ places, extent });
    });
  }

  it("is compact: spheres of mixed sizes fill a good share of the ball, and a small one stands beside a large one, not around it", () => {
    const units = spheres(120), { extent } = packBall(units, 5);
    const volume = units.reduce((sum, unit) => sum + (unit.radius + 2.5) ** 3, 0);
    expect(volume / extent ** 3).toBeGreaterThan(0.35);
    // One large and one small: the ball that holds them is no larger than the two side by side.
    const pair = packBall([{ id: "large", radius: 40 }, { id: "small", radius: 10 }], 5);
    expect(pair.extent).toBeLessThanOrEqual((40 + 10 + 2.5) * 1.002);
  });

  it("stands a sphere named the centre at the origin", () => {
    const units = spheres(30), { places } = packBall(units, 5, units[7].id);
    expect(places.get(units[7].id)).toEqual({ x: 0, y: 0, z: 0 });
    expect(shortfall(units, places, 5)).toBeLessThanOrEqual(5 / 100);
  });
});

describe("a body built from the leaves (2026-11-06, second round)", () => {
  const gaps = bodyGaps(tuning);
  /** A shell over a small tree: own files, a leaf directory, a chain of single directories, a lone file, and a nest two deep. */
  const files = [file("p/own.ts", 4), file("p/other.ts"),
    ...Array.from({ length: 5 }, (_, i) => file(`p/models/m${i}.ts`, i)),
    file("p/chain/a/b/x.ts", 2), file("p/chain/a/b/y.ts"), file("p/chain/a/b/deep/z.ts"), file("p/chain/a/b/deep/w.ts", 9),
    file("p/lone/only.ts", 3),
    ...Array.from({ length: 3 }, (_, i) => file(`p/nest/inner/f${i}.ts`)), file("p/nest/n.ts", 1)];
  const shape = bodyShape("shell:p", files, tuning, undefined, "p");
  const units = new Map(shape.units!.map(unit => [unit.id, unit]));
  const at = (id: string) => units.get(id)!;

  it("places every file exactly once, and the result does not depend on the order the files are given in", () => {
    expect(shape.members.map(member => member.id).sort()).toEqual(files.map(node => node.id).sort());
    expect(shape.files).toBe(files.length);
    const reversed = bodyShape("shell:p", [...files].reverse(), tuning, undefined, "p");
    expect(reversed).toEqual(shape);
  });

  it("draws every file inside its innermost bubble, a lone subdirectory's file as that file, and collapses a chain into what it holds", () => {
    expect(shape.units!.filter(unit => unit.kind === "file").map(unit => unit.id).sort()).toEqual(files.map(node => node.id).sort());
    expect([...units.values()].filter(unit => unit.kind === "directory").map(unit => unit.id).sort())
      .toEqual(["p/chain/a/b", "p/chain/a/b/deep", "p/models", "p/nest", "p/nest/inner"]);
    expect(at("p/lone/only.ts")).toMatchObject({ kind: "file", depth: 0, parent: undefined });
    expect(at("p/models/m3.ts")).toMatchObject({ parent: "p/models", depth: 1 });
    expect(at("p/chain/a/b/deep/z.ts")).toMatchObject({ parent: "p/chain/a/b/deep", depth: 2 });
    expect(at("p/nest/inner/f1.ts")).toMatchObject({ parent: "p/nest/inner", depth: 2 });
    expect(at("p/nest")).toMatchObject({ files: 4, depth: 0 });
  });

  it("stands every unit inside its bubble, the bubble's units apart by the gap, and the body as large as holds them", () => {
    const parentOf = (id: string) => at(id).parent;
    for (const unit of units.values()) {
      const parent = unit.parent === undefined ? { x: 0, y: 0, z: 0, radius: shape.radius! } : at(unit.parent);
      expect(Math.hypot(unit.x - parent.x, unit.y - parent.y, unit.z - parent.z) + unit.radius + gaps.margin, unit.id).toBeLessThanOrEqual(parent.radius + 1e-6);
    }
    const all = [...units.values()];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const a = all[i], b = all[j];
      if (parentOf(a.id) !== parentOf(b.id)) continue;
      expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z), `${a.id} ${b.id}`).toBeGreaterThanOrEqual(a.radius + b.radius + gaps.gap - gaps.gap / 100);
    }
    // As large as holds them: some unit of the body's own reaches its skin less the margin.
    const reach = Math.max(...all.filter(unit => unit.parent === undefined).map(unit => Math.hypot(unit.x, unit.y, unit.z) + unit.radius + gaps.margin));
    expect(reach).toBeCloseTo(shape.radius!, 6);
    // The skin, the hull over the body's own units padded by the margin, holds each of them whole.
    const hull = wrapperHull(shape, shape.margin!);
    for (const unit of all.filter(item => item.parent === undefined)) expect(farthestBeyond(hull, unit.x, unit.y, unit.z) + unit.radius, unit.id).toBeLessThanOrEqual(1e-6);
  });

  it("makes each bubble the body its directory's shell has when a pop releases it: the same size and the same places within", () => {
    const nest = at("p/nest"), inner = files.filter(node => node.id.startsWith("p/nest/"));
    const shell = bodyShape("shell:p/nest", inner, tuning, undefined, "p/nest");
    expect(shell.radius).toBeCloseTo(nest.radius, 9);
    for (const member of shell.members) {
      const placed = shape.members.find(other => other.id === member.id)!;
      expect(placed.x - nest.x).toBeCloseTo(member.x, 6); expect(placed.y - nest.y).toBeCloseTo(member.y, 6); expect(placed.z - nest.z).toBeCloseTo(member.z, 6);
    }
  });

  it(`veils a bubble whose files would pass ${DRAWN_FILES}, keeping its count, and a body whose own files would`, () => {
    const many = [...Array.from({ length: DRAWN_FILES - 2 }, (_, i) => file(`q/a/f${String(i).padStart(4, "0")}.ts`)), ...Array.from({ length: 5 }, (_, i) => file(`q/b/g${i}.ts`)), file("q/own.ts")];
    const body = bodyShape("shell:q", many, tuning, undefined, "q");
    expect(body.veiled).toBe(false);
    const drawn = body.units!.filter(unit => unit.kind === "file").length, veiled = body.units!.filter(unit => unit.veiled);
    expect(drawn).toBeLessThanOrEqual(DRAWN_FILES);
    expect(veiled.map(unit => ({ id: unit.id, files: unit.files }))).toEqual([{ id: "q/a", files: DRAWN_FILES - 2 }]);
    expect(body.units!.some(unit => unit.parent === "q/a")).toBe(false);
    expect(body.members).toHaveLength(many.length);
    const flat = bodyShape("shell:r", Array.from({ length: DRAWN_FILES + 1 }, (_, i) => file(`r/f${String(i).padStart(4, "0")}.ts`)), tuning, undefined, "r");
    expect(flat.veiled).toBe(true);
    expect(flat.units).toEqual([expect.objectContaining({ kind: "directory", veiled: true, files: DRAWN_FILES + 1, depth: -1 })]);
    // Two bodies of over a thousand files each, packed whole: some seconds under the coverage run.
  }, 30_000);

  it("packs a wrapped group about its seed, every member drawn but the seed, which stands at the centre", () => {
    const group = [file("g/seed.ts", 6), ...Array.from({ length: 12 }, (_, i) => file(`g/x/m${i}.ts`, i % 4))];
    const island = bodyShape("g/seed.ts", group, tuning, "g/seed.ts");
    expect(island.members.find(member => member.id === "g/seed.ts")).toEqual({ id: "g/seed.ts", x: 0, y: 0, z: 0, radius: spatialNodeRadius(group[0], tuning) });
    expect(island.units!.map(unit => unit.id).sort()).toEqual(group.slice(1).map(node => node.id).sort());
    expect(island.units!.every(unit => unit.kind === "file" && unit.depth === 0)).toBe(true);
    for (const unit of island.units!) expect(Math.hypot(unit.x, unit.y, unit.z) + unit.radius + gaps.margin).toBeLessThanOrEqual(island.radius! + 1e-6);
  });
});

describe("a shell's radius told only its count", () => {
  it("is so many symbol-less files' padded volume, for a node whose body is not yet known", () => {
    expect(spatialNodeRadius({ id: "shell:x", publicSymbols: [], shellFiles: 64 }, tuning)).toBeCloseTo(shellRadiusOf(Array.from({ length: 64 }, () => tuning.nodeSize), tuning), 9);
    expect(spatialNodeRadius({ id: "shell:x", publicSymbols: [], shellFiles: 3, shellBody: 42 }, tuning)).toBe(42);
  });
});
