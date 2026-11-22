// Probe of 2026-11-22 (not product code): a scan for the stored form made from today's graph index, as the engine's sink
// would hand it over. Since the stored form derives what a link names by its own link rule (2026-11-22), a link is
// handed over as written, and the stored form's graph is held against the engine's, which resolved the same links itself.
import { LINKS_SECTION, readDocumentationReference } from "@live-documentation/engine/live-docs/document";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { comparePaths, type Scan, type StoredDocumentation, type StoredFile, type StoredType } from "../../../../../../../packages/stored-form/src/storedForm";

/** The scan a graph's files describe, as the engine's sink would hand it over. */
export function scanOfGraph(graph: LiveDocGraph, scanner: string): Scan {
  const location = { root: graph.root, baseLayer: graph.baseLayer, extension: graph.extension };
  const files: StoredFile[] = [];
  for (const file of Object.values(graph.files)) {
    const type = (t: { name: string; link?: string; array?: boolean; promise?: boolean }): StoredType => {
      const out: StoredType = { name: t.name };
      if (t.link !== undefined) out.link = t.link;
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
        references: s.references.map((r) => (r.role === "Parameters" ? { role: r.role, parameters: r.parameters.map((p) => ({ name: p.name, types: p.types.map(type) })) } : { role: r.role, types: r.types.map(type) })),
        // The references its documentation makes, read from its `Links` sections' lines by the engine's own grammar,
        // each link given what it names: what the sink hands over beside the lines themselves.
        documentation: s.sections
          .filter((section) => section.title === LINKS_SECTION)
          .flatMap((section) => section.body.map(readDocumentationReference))
          .filter((r): r is NonNullable<typeof r> => r !== undefined)
          .map((r): StoredDocumentation => {
            const out: StoredDocumentation = { name: r.name };
            if (r.element !== undefined) out.element = r.element;
            if (r.link !== undefined) out.link = r.link;
            return out;
          })
      })),
      dependencies: file.dependencies,
      ...(file.citedBy !== undefined ? { citedBy: file.citedBy } : {}),
      ...(file.reExports !== undefined ? { reExports: file.reExports } : {})
    });
  }
  // Handed over in the stored form's order, the order of UTF-8 bytes, which the engine's sink will use too.
  files.sort((a, b) => comparePaths(a.codePath, b.codePath));
  return { head: { location, scanner, leftOut: [] }, files };
}
