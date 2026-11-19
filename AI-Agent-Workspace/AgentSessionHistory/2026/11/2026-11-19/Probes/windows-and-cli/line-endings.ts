// Whether the tool's own files and a person's board mind CRLF endings or a byte-order mark.
import { readFileSync } from "node:fs";

import { parseBoard } from "../../../../../../../packages/engine/src/live-docs/board";
import { citingDocuments } from "../../../../../../../packages/engine/src/live-docs/relatedDocs";
import { normalizeLiveDocumentationConfig } from "../../../../../../../packages/engine/src/config/liveDocumentationConfig";

const BOARD = "# Sample board\n\n## Metadata\n- Layer: 3\n\n## Authored\n### Purpose\nA board.\n\n### Notes\nNone.\n\n## Declared\n\n### Things\n\n#### `app`\n- Kind: web\n- From: `src`\n\n### Connections\n_No connections declared_\n";
const MARK = String.fromCharCode(0xfeff);
for (const [label, text] of [["LF", BOARD], ["CRLF", BOARD.replace(/\n/g, "\r\n")], ["mark", MARK + BOARD]] as const) {
  try {
    const board = parseBoard(text);
    console.log(`board ${label}: read, "${board.title}", ${board.things.length} thing(s)`);
  } catch (error) {
    console.log(`board ${label}: refused: ${(error as Error).message.slice(0, 140)}`);
  }
}

const config = normalizeLiveDocumentationConfig({});
const README = "# Notes\n\nSee [the app](src/app.ts) and [the page][page].\n\n[page]: src/page.ts\n";
for (const [label, text] of [["LF", README], ["CRLF", README.replace(/\n/g, "\r\n")]] as const) {
  const cited = citingDocuments([{ path: "README.md", text }], new Set(["src/app.ts", "src/page.ts"]), config, []);
  console.log(`document ${label}: cites ${[...cited.keys()].sort().join(", ") || "nothing"}`);
}

const json = readFileSync(process.argv[2], "utf8").replace(/\n/g, "\r\n");
console.log(`index with CRLF: ${Object.keys((JSON.parse(json) as { files: object }).files).length} files parsed`);
