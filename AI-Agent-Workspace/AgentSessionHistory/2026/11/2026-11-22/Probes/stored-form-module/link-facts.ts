// Probe of 2026-11-22 (not product code): a link and what it names, held once. For every link field of a scan (the
// links of dependencies, types and documentation references, which carry a target; and the links of entries, cited-by
// lines, re-exports and sources, which do not), against the engine's own rule (`linkTarget`):
// - whether the target and anchor the sink would store are what the rule gives for the link and the location;
// - which links the rule gives no target, and what they hold;
// - what deriving every target costs, and what storing none saves in the file.
//
//   npx tsx --tsconfig ./tsconfig.base.json <this folder>/link-facts.ts <index.json>...
import { readFileSync } from "node:fs";

import { linkTarget, type LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { writeScan, type Scan } from "../../../../../../../packages/stored-form/src/storedForm";

import { scanOfGraph } from "./scan-of-graph";

const kindOf = (link: string): string => {
  if (/^[a-z][a-z0-9+.-]*:/iu.test(link)) return `a scheme (${link.split(":")[0].toLowerCase()}:)`;
  if (link.startsWith("#")) return "a fragment of the document itself";
  if (link.includes("\0")) return "a NUL";
  return "a relative path";
};

void (async () => {
  for (const path of process.argv.slice(2)) {
    const graph = JSON.parse(readFileSync(path, "utf8")) as LiveDocGraph;
    const location = { root: graph.root, baseLayer: graph.baseLayer, extension: graph.extension };
    const scan = scanOfGraph(graph, "probe");
    const carrying = new Map<string, number>();
    const notCarrying = new Map<string, number>();
    const untargeted = new Map<string, { count: number; example: string }>();
    let links = 0;
    let agree = 0;
    let disagree = 0;
    const count = (m: Map<string, number>, k: string): void => void m.set(k, (m.get(k) ?? 0) + 1);
    const docPath = (codePath: string): string => [location.root, location.baseLayer, `${codePath}${location.extension}`].filter((x) => x !== "").join("/");
    const derive = (codePath: string, link: string): { target?: string; anchor?: string } => {
      const t = linkTarget(docPath(codePath), link, location);
      return t ? { target: t.codePath, ...(t.anchor !== undefined ? { anchor: t.anchor } : {}) } : {};
    };
    const check = (codePath: string, v: { link?: string; target?: string; anchor?: string }): void => {
      if (v.link === undefined) return;
      links += 1;
      count(carrying, kindOf(v.link));
      const d = derive(codePath, v.link);
      if (d.target === v.target && d.anchor === v.anchor) agree += 1;
      else disagree += 1;
      if (d.target === undefined) {
        const k = kindOf(v.link);
        const u = untargeted.get(k) ?? { count: 0, example: v.link.slice(0, 100) };
        u.count += 1;
        untargeted.set(k, u);
      }
    };
    for (const f of scan.files) {
      for (const d of f.dependencies) check(f.codePath, d);
      for (const s of f.symbols) {
        for (const r of s.references) for (const t of r.role === "Parameters" ? r.parameters.flatMap((p) => p.types) : r.types) check(f.codePath, t);
        for (const d of s.documentation) check(f.codePath, d);
        if (s.source) count(notCarrying, `a source: ${kindOf(s.source.path)}`);
      }
      for (const e of f.entries) {
        if (e.symbol?.link !== undefined) count(notCarrying, `an entry's symbol: ${kindOf(e.symbol.link)}`);
        if (e.declarer) count(notCarrying, `an entry's declarer: ${kindOf(e.declarer.link)}`);
      }
      for (const c of f.citedBy ?? []) count(notCarrying, `a cited-by: ${kindOf(c.link)}`);
      for (const r of f.reExports ?? []) if (r.from) count(notCarrying, `a re-export's origin: ${kindOf(r.from.link)}`);
    }
    // What deriving every target costs: the rule run over every link, best of three.
    const times: number[] = [];
    for (let k = 0; k < 3; k += 1) {
      const start = performance.now();
      for (const f of scan.files) {
        for (const d of f.dependencies) if (d.link !== undefined) derive(f.codePath, d.link);
        for (const s of f.symbols) {
          for (const r of s.references) for (const t of r.role === "Parameters" ? r.parameters.flatMap((p) => p.types) : r.types) if (t.link !== undefined) derive(f.codePath, t.link);
          for (const d of s.documentation) if (d.link !== undefined) derive(f.codePath, d.link);
        }
      }
      times.push(performance.now() - start);
    }
    // What storing no target saves: the same scan with every target and anchor taken out.
    const strip = <T extends { target?: string; anchor?: string }>(v: T): T => {
      const { target, anchor, ...rest } = v;
      void target;
      void anchor;
      return rest as T;
    };
    const bare: Scan = {
      ...scan,
      files: scan.files.map((f) => ({
        ...f,
        dependencies: f.dependencies.map(strip),
        symbols: f.symbols.map((s) => ({ ...s, references: s.references.map((r) => (r.role === "Parameters" ? { ...r, parameters: r.parameters.map((p) => ({ ...p, types: p.types.map(strip) })) } : { ...r, types: r.types.map(strip) })), documentation: s.documentation.map(strip) }))
      }))
    };
    const withTargets = await writeScan(scan);
    const without = await writeScan(bare);
    console.log(
      JSON.stringify(
        {
          corpus: path.split("/").pop(),
          linksThatCarryATarget: links,
          storedEqualsDerived: agree,
          storedDiffers: disagree,
          whatTheyHold: Object.fromEntries(carrying),
          givenNoTarget: Object.fromEntries(untargeted),
          linksThatCarryNoTarget: Object.fromEntries(notCarrying),
          deriveAllMs: Math.round(Math.min(...times)),
          bytesWithTargets: withTargets.ok ? withTargets.value.length : withTargets.reason,
          bytesWithout: without.ok ? without.value.length : without.reason
        },
        null,
        1
      )
    );
  }
})();
