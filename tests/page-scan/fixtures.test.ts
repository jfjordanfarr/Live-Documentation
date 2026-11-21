import fs from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../packages/engine/src/config/liveDocumentationConfig";
import { LANGUAGE_ADAPTERS } from "../../packages/engine/src/live-docs/adapters/index";
import { discoverTargetFiles } from "../../packages/engine/src/live-docs/discovery";
import { copyFixture } from "../../scripts/oracle/fixture";
import { FIXTURES } from "./fixtures";

/**
 * That the folders the check scans in the page reach every reader the engine registers: each reads at least one file
 * the scan of some fixture discovers, chosen as the engine chooses (`analyzeWithLanguageAdapters`: by name first, then
 * by extension). Prints which fixture reaches which reader, and the extensions read by no reader (TypeScript and
 * JavaScript, which the compiler reads, among them).
 */

/** The id of the reader the engine hands a file to, or the file's extension when none reads it. */
function readerOf(file: string): string {
  const name = path.basename(file);
  const extension = path.extname(name).toLowerCase();
  const reader = LANGUAGE_ADAPTERS.find((candidate) => candidate.fileNames?.includes(name)) ?? (extension ? LANGUAGE_ADAPTERS.find((candidate) => candidate.extensions.includes(extension)) : undefined);
  return reader ? reader.id : `(no reader) ${extension || name}`;
}

it("every reader the engine registers reads files of some fixture the check scans", async () => {
  const reached = new Map<string, Set<string>>();
  const config = normalizeLiveDocumentationConfig();
  for (const fixture of FIXTURES) {
    const copy = copyFixture(fixture.absolute, "page-scan-readers-");
    try {
      for (const file of await discoverTargetFiles({ workspaceRoot: copy, config, include: new Set(), changedOnly: false })) {
        const reader = readerOf(file);
        (reached.get(reader) ?? reached.set(reader, new Set()).get(reader)!).add(fixture.name);
      }
    } finally {
      fs.rmSync(copy, { recursive: true, force: true });
    }
  }
  console.log([...reached].sort(([a], [b]) => (a < b ? -1 : 1)).map(([reader, fixtures]) => `${reader}: ${[...fixtures].join(", ")}`).join("\n"));
  expect(LANGUAGE_ADAPTERS.map((adapter) => adapter.id).filter((id) => !reached.has(id))).toEqual([]);
}, 120_000);
