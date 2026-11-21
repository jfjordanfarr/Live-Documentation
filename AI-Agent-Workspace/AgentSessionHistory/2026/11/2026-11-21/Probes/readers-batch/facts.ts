/**
 * Reads a corpus as the generator does, without writing anything into it: discovery by the default configuration, the
 * symbol index from every file, then each file of the named extensions with it. Writes one line per file: its
 * dependencies (target and symbols) and its symbols, as JSON.
 *
 * npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/facts.ts <corpus> <out.jsonl> <ext,ext,...>
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "../../../../../../../packages/engine/src/config/liveDocumentationConfig";
import { buildWorkspaceIndexes, discoverTargetFiles } from "../../../../../../../packages/engine/src/live-docs/discovery";
import { analyzeSourceFile } from "../../../../../../../packages/engine/src/live-docs/sourceAnalysis";

async function main(): Promise<void> {
  const [corpus, out, extensionList] = process.argv.slice(2);
  const workspaceRoot = path.resolve(corpus);
  const extensions = new Set(extensionList.split(",").map((extension) => extension.toLowerCase()));
  const config = { ...DEFAULT_LIVE_DOCUMENTATION_CONFIG };
  const targetFiles = await discoverTargetFiles({ workspaceRoot, config, include: new Set(), changedOnly: false });
  const relative = (absolute: string): string => path.relative(workspaceRoot, absolute).split(path.sep).join("/");
  const fileIndex = new Set(targetFiles.map(relative));
  const { symbols } = await buildWorkspaceIndexes({ targetFiles, workspaceRoot, liveDocsRoot: ".live-documentation/source", docExtension: ".md", fileIndex });
  const lines: string[] = [];
  for (const absolute of targetFiles) {
    const file = relative(absolute);
    const name = path.basename(file);
    if (!extensions.has(path.extname(name).toLowerCase()) && !extensions.has(name.toLowerCase())) continue;
    let result;
    try {
      result = await analyzeSourceFile(absolute, workspaceRoot, fileIndex, symbols);
    } catch (error) {
      lines.push(JSON.stringify({ file, error: String(error) }));
      continue;
    }
    lines.push(JSON.stringify({
      file,
      deps: result.dependencies.map((dependency) => ({ to: dependency.resolvedPath ?? dependency.specifier, resolved: Boolean(dependency.resolvedPath), symbols: [...dependency.symbols].sort() })).sort((a, b) => a.to.localeCompare(b.to)),
      symbols: result.symbols.map((symbol) => symbol.name).sort(),
      program: Boolean(result.program)
    }));
  }
  writeFileSync(out, `${lines.join("\n")}\n`);
  console.log(`${targetFiles.length} files found, ${lines.length} read, into ${out}`);
}

void main();
