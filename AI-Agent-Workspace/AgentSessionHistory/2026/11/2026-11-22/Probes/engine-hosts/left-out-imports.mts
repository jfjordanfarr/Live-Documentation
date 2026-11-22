// For every script file a scan keeps, what its imports and re-exports resolve to when a file the scan leaves out may be
// read (the disk, as at the tip) and when it may not (the run's listing), by the engine's own `collectDependencies` and
// `augmentWithReExportedSymbols`, from a copy of the engine with `listed-resolution.py` applied. Reads only: nothing is
// generated, so it runs over read-only corpora in place.
//   tsx --tsconfig <copy>/tsconfig.base.json left-out-imports.mts <folder> <label>
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { SUPPORTED_SCRIPT_EXTENSIONS } from "@live-documentation/engine/live-docs/coreConstants";
import { augmentWithReExportedSymbols, collectDependencies } from "@live-documentation/engine/live-docs/dependencies";
import { discoverTargetFiles } from "@live-documentation/engine/live-docs/discovery";
import { inferScriptKind } from "@live-documentation/engine/live-docs/symbolExtraction";
import { workspaceListing } from "@live-documentation/engine/tooling/workspaceListing";

const [folder, label] = process.argv.slice(2);
const root = path.resolve(folder);
const configFile = path.join(root, ".live-docs.config.json");
const config = normalizeLiveDocumentationConfig(fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, "utf8")) : undefined);
const kept = await discoverTargetFiles({ workspaceRoot: root, config, include: new Set(), changedOnly: false });
const relative = kept.map((file) => path.relative(root, file).split(path.sep).join("/"));
const listing = workspaceListing(root, relative);

const kinds: Record<string, number> = {};
const examples: Record<string, string[]> = {};
let scripts = 0;
let filesChanged = 0;
let reExportNamesLost = 0;
const note = (kind: string, example: string): void => {
  kinds[kind] = (kinds[kind] ?? 0) + 1;
  if ((examples[kind] ??= []).length < 3) examples[kind].push(example);
};
for (const absolutePath of kept) {
  const extension = path.extname(absolutePath).toLowerCase();
  if (!SUPPORTED_SCRIPT_EXTENSIONS.has(extension)) continue;
  scripts += 1;
  const sourceFile = ts.createSourceFile(absolutePath, fs.readFileSync(absolutePath, "utf8"), ts.ScriptTarget.Latest, true, inferScriptKind(extension));
  const fromDisk = await collectDependencies({ sourceFile, absolutePath, workspaceRoot: root });
  const fromListing = await collectDependencies({ sourceFile, absolutePath, workspaceRoot: root, files: listing } as Parameters<typeof collectDependencies>[0]);
  const file = path.relative(root, absolutePath);
  let changed = false;
  fromDisk.forEach((entry, at) => {
    const listed = fromListing[at];
    if (entry.resolvedPath === listed?.resolvedPath) return;
    changed = true;
    const how = entry.reExportAll ? "export * from a left-out file" : entry.kind === "export" ? "export { … } from a left-out file" : "an import of a left-out file";
    const where = entry.resolvedPath?.includes("node_modules/") ? `${how}, through node_modules` : how;
    note(where, `${file}: ${entry.specifier} → ${entry.resolvedPath} becomes ${listed?.resolvedPath ?? `unresolved, labelled "${listed?.specifier}"`}`);
  });
  const symbols: never[] = [];
  const diskReExports = (await augmentWithReExportedSymbols({ sourceAbsolute: absolutePath, workspaceRoot: root, dependencies: fromDisk, existingSymbols: symbols })).reExports.map((entry) => entry.name);
  const listedReExports = (await augmentWithReExportedSymbols({ sourceAbsolute: absolutePath, workspaceRoot: root, dependencies: fromListing, existingSymbols: symbols, reads: listing } as Parameters<typeof augmentWithReExportedSymbols>[0])).reExports.map((entry) => entry.name);
  const lost = diskReExports.filter((name) => !listedReExports.includes(name));
  if (lost.length > 0) {
    changed = true;
    reExportNamesLost += lost.length;
    note("re-exported names no longer known", `${file}: ${lost.slice(0, 4).join(", ")}${lost.length > 4 ? ` and ${lost.length - 4} more` : ""}`);
  }
  if (changed) filesChanged += 1;
}
console.log(JSON.stringify({ label, kept: kept.length, scripts, filesChanged, kinds, reExportNamesLost, examples }, null, 1));
