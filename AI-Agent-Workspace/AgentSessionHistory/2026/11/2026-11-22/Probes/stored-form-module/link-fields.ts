// Probe of 2026-11-22 (not product code): what every link field of a scan holds, before a rule refuses any. For each
// field (a dependency's, a type's, a documentation reference's, an entry's symbol and declarer, a cited-by line, a
// re-export's origin, a symbol's source), whether it begins with a scheme, holds a NUL, or, resolved against its
// document's folder, climbs above the scanned folder.
//
//   npx tsx --tsconfig ./tsconfig.base.json <this folder>/link-fields.ts <index.json>...
import { readFileSync } from "node:fs";

import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

/** The link's path before its fragment and query, folded against the document's folder, as the link rule folds it. */
function climbs(docPath: string, link: string): boolean {
  const hash = link.indexOf("#");
  const before = hash === -1 ? link : link.slice(0, hash);
  const query = before.indexOf("?");
  let path = query === -1 ? before : before.slice(0, query);
  try {
    path = decodeURIComponent(path);
  } catch {
    // kept as written
  }
  if (path === "") return false;
  const slash = docPath.lastIndexOf("/");
  const segments: string[] = [];
  for (const segment of `${slash === -1 ? "." : docPath.slice(0, slash)}/${path}`.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === ".." && segments.length > 0 && segments[segments.length - 1] !== "..") segments.pop();
    else segments.push(segment);
  }
  return path.startsWith("/") || segments[0] === "..";
}

for (const file of process.argv.slice(2)) {
  const graph = JSON.parse(readFileSync(file, "utf8")) as LiveDocGraph;
  const tally = new Map<string, { fields: number; scheme: number; nul: number; climbs: number; examples: string[] }>();
  const see = (kind: string, docPath: string, link: string | undefined): void => {
    if (link === undefined) return;
    const t = tally.get(kind) ?? { fields: 0, scheme: 0, nul: 0, climbs: 0, examples: [] };
    t.fields += 1;
    const scheme = /^[A-Za-z][A-Za-z0-9+.-]*:/u.test(link);
    if (scheme) t.scheme += 1;
    if (link.includes("\0")) t.nul += 1;
    if (!scheme && climbs(docPath, link)) {
      t.climbs += 1;
      if (t.examples.length < 3) t.examples.push(`${docPath} → ${link}`.slice(0, 140));
    }
    tally.set(kind, t);
  };
  for (const f of Object.values(graph.files)) {
    const d = f.docPath;
    for (const dep of f.dependencies) see("dependency", d, dep.link);
    for (const s of f.symbols) {
      for (const r of s.references) for (const t of r.role === "Parameters" ? r.parameters.flatMap((p) => p.types) : r.types) see("type", d, t.link);
      if (s.source) see("source", d, s.source.path);
    }
    for (const e of f.entries) {
      see("entry's symbol", d, e.symbol?.link);
      see("entry's declarer", d, e.declarer?.link);
    }
    for (const c of f.citedBy ?? []) see("cited-by", d, c.link);
    for (const r of f.reExports ?? []) see("re-export's origin", d, r.from?.link);
  }
  console.log(JSON.stringify({ corpus: file.split("/").pop(), docsRoot: `${graph.root}/${graph.baseLayer}`, fields: Object.fromEntries(tally) }, null, 1));
}
