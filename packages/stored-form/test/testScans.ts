/**
 * Scans made for the stored form's tests: one that holds every kind of fact, and many made from a seed.
 *
 * @remarks
 * Test support, imported by the tests and by the fuzzer's worker, never by the module. It imports nothing, so that it
 * moves with the module.
 *
 * @module
 */

import type { Scan, StoredFile, StoredType } from "../src/storedForm";

/** A scan of three files that holds every field the layout has, each mark set and unset somewhere. */
export function everyFact(): Scan {
  const files: StoredFile[] = [
    {
      codePath: "src/a.ts",
      layer: 4,
      archetype: "implementation",
      entries: [{ reason: "program", symbol: { name: "main", link: "#main" } }, { reason: "command", command: "build", declarer: { label: "package.json", link: "../package.json.mdmd.md" } }, { reason: "tooling" }],
      generatedAt: "2026-11-22T00:00:00.000Z",
      authored: "### Purpose\nSays hello.\n\n### Notes\n<script>alert(1)</script> is text here, never markup.",
      symbols: [
        {
          name: "main",
          slug: "main",
          kind: "function",
          flags: ["default"],
          source: { path: "../../src/a.ts", line: 3 },
          references: [
            { role: "Returns", types: [{ name: "Widget", link: "b.ts.mdmd.md#widget", target: "src/b.ts", anchor: "widget", promise: true }] },
            { role: "Parameters", parameters: [{ name: "items", types: [{ name: "Item", link: "b.ts.mdmd.md", target: "src/b.ts", array: true }, { name: "string" }] }] }
          ],
          sections: [{ title: "Summary", body: ["Starts the program.", "Line two, with a tab\tand ünïcödé 😀."] }]
        },
        { name: "Thing (interface)", kind: "interface", flags: [], references: [{ role: "Extends", types: [{ name: "Gone", link: "gone.ts.mdmd.md", target: "src/gone.ts" }] }], sections: [] }
      ],
      dependencies: [
        { label: "src/b.ts", link: "b.ts.mdmd.md", target: "src/b.ts", qualifiers: ["type-only"] },
        { label: "node:fs", symbols: ["readFileSync"], qualifiers: [] },
        { label: "outside", link: "../../../outside.md", qualifiers: ["configuration"] }
      ],
      citedBy: [{ label: "README.md", link: "../../README.md" }]
    },
    {
      codePath: "src/b.ts",
      layer: 4,
      entries: [],
      authored: "### Purpose\n_Pending authored purpose_",
      symbols: [{ name: "Widget", slug: "widget", kind: "class", flags: [], references: [{ role: "Implements", types: [{ name: "Thing", link: "a.ts.mdmd.md#thing", target: "src/a.ts", anchor: "thing" }] }], sections: [] }],
      dependencies: [{ label: "src/a.ts", link: "a.ts.mdmd.md", target: "src/a.ts", qualifiers: ["re-export"] }],
      reExports: [{ name: "Thing", slug: "thing", from: { label: "src/a.ts", link: "a.ts.mdmd.md" }, flags: ["type-only"] }, { name: "Other", flags: [] }]
    },
    { codePath: "src/c.ts", layer: 4, entries: [], authored: "", symbols: [], dependencies: [], citedBy: [], reExports: [] }
  ];
  return { head: { location: { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" }, scanner: "a test 1.0", leftOut: [{ reason: "excluded by configuration", count: 2, detail: "AI-Agent-Workspace/**" }] }, files };
}

/** A small deterministic generator of numbers from a seed (mulberry32). */
export function random(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A scan of `count` files made from a seed: names drawn from a small vocabulary, so strings repeat as real ones do. */
export function seededScan(seed: number, count: number): Scan {
  const next = random(seed);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)];
  const words = ["alpha", "beta", "gamma", "delta", "Ωmega", "名前", "a b", "x\ny", "", "#", "../"] as const;
  const kinds = ["method", "class", "property", "function"] as const;
  const paths = Array.from({ length: count }, (_, i) => `dir${i % 7}/file-${String(i).padStart(5, "0")}.ts`).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const type = (): StoredType => {
    const t: StoredType = { name: pick(words) };
    if (next() < 0.6) {
      t.link = `${pick(words)}.mdmd.md`;
      if (next() < 0.8) {
        t.target = next() < 0.9 ? pick(paths) : "not/scanned.ts";
        if (next() < 0.5) t.anchor = pick(words);
      }
    }
    if (next() < 0.2) t.array = true;
    if (next() < 0.1) t.promise = true;
    return t;
  };
  const files = paths.map((codePath): StoredFile => {
    const file: StoredFile = {
      codePath,
      layer: 4,
      entries: next() < 0.1 ? [{ reason: "module", declarer: { label: "package.json", link: "package.json.mdmd.md" } }] : [],
      authored: next() < 0.7 ? "### Purpose\n_Pending authored purpose_" : `### Purpose\n${pick(words)} ${Math.floor(next() * 1e6)}`,
      symbols: Array.from({ length: Math.floor(next() * 4) }, (_, k) => ({
        name: `${pick(words)}${k}`,
        ...(next() < 0.8 ? { slug: `s${k}` } : {}),
        kind: pick(kinds),
        flags: next() < 0.1 ? ["default"] : [],
        ...(next() < 0.5 ? { source: { path: `../${codePath}`, line: Math.floor(next() * 500) } } : {}),
        references: next() < 0.5 ? [{ role: "Returns" as const, types: [type()] }, { role: "Parameters" as const, parameters: [{ name: "p", types: [type(), type()] }] }] : [],
        sections: next() < 0.5 ? [{ title: "Summary", body: [`${pick(words)} ${Math.floor(next() * 1e9)}`] }] : []
      })),
      dependencies: Array.from({ length: Math.floor(next() * 5) }, () => {
        const t = type();
        return { label: t.name, ...(t.link !== undefined ? { link: t.link } : {}), ...(t.target !== undefined ? { target: t.target } : {}), ...(t.anchor !== undefined ? { anchor: t.anchor } : {}), qualifiers: next() < 0.2 ? ["type-only"] : [] };
      })
    };
    if (next() < 0.3) file.archetype = pick(["implementation", "test", "config"]);
    if (next() < 0.5) file.generatedAt = `2026-11-${String(1 + Math.floor(next() * 28)).padStart(2, "0")}`;
    if (next() < 0.1) file.citedBy = [{ label: "README.md", link: "README.md" }];
    return file;
  });
  return { head: { location: { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" }, scanner: `seed ${seed}`, leftOut: [] }, files };
}
