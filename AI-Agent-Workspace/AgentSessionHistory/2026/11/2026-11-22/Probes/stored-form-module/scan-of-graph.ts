// Probe of 2026-11-22 (not product code): a scan for the stored form made from today's graph index, as the engine's sink
// would hand it over. Each link is given what it names by the engine's own link rule (`linkTarget`), so that the
// stored form's graph can be held against the engine's graph, which resolved the same links itself.
import { linkTarget, type LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import type { Scan, StoredFile, StoredType } from "../../../../../../../packages/stored-form/src/storedForm";

/** The scan a graph's files describe, each link given the path and anchor it names. */
export function scanOfGraph(graph: LiveDocGraph, scanner: string): Scan {
  const location = { root: graph.root, baseLayer: graph.baseLayer, extension: graph.extension };
  const files: StoredFile[] = [];
  for (const file of Object.values(graph.files)) {
    const named = (link: string | undefined): { target?: string; anchor?: string } => {
      if (link === undefined) return {};
      const t = linkTarget(file.docPath, link, location);
      if (!t) return {};
      return t.anchor === undefined ? { target: t.codePath } : { target: t.codePath, anchor: t.anchor };
    };
    const type = (t: { name: string; link?: string; array?: boolean; promise?: boolean }): StoredType => {
      const out: StoredType = { name: t.name };
      if (t.link !== undefined) Object.assign(out, { link: t.link }, named(t.link));
      if (t.array) out.array = true;
      if (t.promise) out.promise = true;
      return out;
    };
    files.push({
      codePath: file.codePath,
      layer: file.layer,
      ...(file.archetype !== undefined ? { archetype: file.archetype } : {}),
      entries: file.entries,
      ...(file.generatedAt !== undefined ? { generatedAt: file.generatedAt } : {}),
      authored: file.authored,
      symbols: file.symbols.map((s) => ({
        ...s,
        references: s.references.map((r) => (r.role === "Parameters" ? { role: r.role, parameters: r.parameters.map((p) => ({ name: p.name, types: p.types.map(type) })) } : { role: r.role, types: r.types.map(type) }))
      })),
      dependencies: file.dependencies.map((d) => ({ ...d, ...named(d.link) })),
      ...(file.citedBy !== undefined ? { citedBy: file.citedBy } : {}),
      ...(file.reExports !== undefined ? { reExports: file.reExports } : {})
    });
  }
  return { head: { location, scanner, leftOut: [] }, files };
}
