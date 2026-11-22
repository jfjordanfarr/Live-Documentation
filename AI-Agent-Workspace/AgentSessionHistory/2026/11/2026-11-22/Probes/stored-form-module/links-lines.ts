// Probe of 2026-11-22 (not product code): whether every line of every section the scanner reads documentation
// references from is exactly the line the engine's composer writes for some reading of it. If every one is, the
// reading alone can stand for the lines; if not, the lines hold something the reading does not.
//
//   npx tsx --tsconfig ./tsconfig.base.json <this folder>/links-lines.ts <index.json>...
import { readFileSync } from "node:fs";

import { documentationReferenceLine, LINKS_SECTION, readDocumentationReference } from "@live-documentation/engine/live-docs/document";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

for (const path of process.argv.slice(2)) {
  const graph = JSON.parse(readFileSync(path, "utf8")) as LiveDocGraph;
  const kinds = new Map<string, { count: number; example: string }>();
  let lines = 0;
  let sections = 0;
  let exact = 0;
  let withText = 0;
  const note = (kind: string, line: string): void => {
    const k = kinds.get(kind) ?? { count: 0, example: line.slice(0, 120) };
    k.count += 1;
    kinds.set(kind, k);
  };
  for (const file of Object.values(graph.files)) {
    for (const symbol of file.symbols) {
      for (const section of symbol.sections) {
        if (section.title !== LINKS_SECTION) continue;
        sections += 1;
        for (const line of section.body) {
          lines += 1;
          const reading = readDocumentationReference(line);
          if (reading && documentationReferenceLine(reading) === line) {
            exact += 1;
            if (reading.text !== undefined) withText += 1;
            note(reading.link === undefined ? "a reference, unlinked" : "a reference, linked", line);
            continue;
          }
          if (/^- \[[^\]]*\]\([a-z][a-z0-9+.-]*:/iu.test(line)) note("a web link, `- [label](scheme:…)`", line);
          else if (!line.startsWith("- ")) note("a line that goes on from the one before (a reference's text over several lines)", line);
          else if (reading) note("read as a reference, but not written back the same", line);
          else note("a line no reference reads (a plain `- target`, or other)", line);
        }
      }
    }
  }
  console.log(JSON.stringify({ corpus: path.split("/").pop(), sections, lines, exact, exactWithText: withText, kinds: Object.fromEntries(kinds) }, null, 1));
}
