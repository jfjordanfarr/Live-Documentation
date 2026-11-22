// Scratch: four readings of each judged row. (1) the rule over the parser's record of the whole corpus; (2) the reader
// over the skeleton; (3) the reader over the corpus's own text; (4) the rule over the parser's record of the skeleton.
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { powershellAdapter } from "@live-documentation/engine/live-docs/adapters/powershell";

import { comparePowerShell } from "../../../../../workspaces/Live-Documentation/.claude/worktrees/agent-adc5a04bdd878c2a8/scripts/oracle/powershell-compare";
import { parsePowerShellFixture, type PowerShellAst } from "../../../../../workspaces/Live-Documentation/.claude/worktrees/agent-adc5a04bdd878c2a8/scripts/oracle/powershell-edges";
import { writeSkeleton, type JudgedExtract } from "../../../../../workspaces/Live-Documentation/.claude/worktrees/agent-adc5a04bdd878c2a8/scripts/oracle/powershell-judged";
import { readVerdicts } from "../../../../../workspaces/Live-Documentation/.claude/worktrees/agent-adc5a04bdd878c2a8/scripts/oracle/powershell-verdicts";
import { ParserWorkspace, recordedShippedNames } from "../../../../../workspaces/Live-Documentation/.claude/worktrees/agent-adc5a04bdd878c2a8/scripts/oracle/powershell-wires";

const WT = "/workspaces/Live-Documentation/.claude/worktrees/agent-adc5a04bdd878c2a8";
const S = "/tmp/claude-1000/-workspaces-Live-Documentation/8edd198a-ddfc-4db4-98d3-afb50c64b8a7/scratchpad/powershell-extract";
const C = "/tmp/claude-1000/-workspaces-Live-Documentation/1501b25e-9b79-43c7-b25c-c8b29500c331/scratchpad/readers-builder-2/corpora";
const folders: Record<string, string> = { dbatools: "dbatools", "al-go": "algo", "azurestack-tools": "azurestack", tsqlt: "tsqlt" };
const extract = JSON.parse(fs.readFileSync(`${WT}/tests/integration/fixtures/powershell-judged/extract.json`, "utf8")) as JudgedExtract;
const rows = readVerdicts(fs.readFileSync(`${WT}/AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/samples.md`, "utf8"));
const key = (a: string, n: string, b: string): string => `${a} → ${n.toLowerCase()} → ${b}`;

async function main(): Promise<void> {
  const out: string[] = [];
  for (const corpus of extract.corpora) {
    const own = rows.filter((row) => row.corpus === corpus.name);
    const full = { tool: "pwsh", files: (JSON.parse(fs.readFileSync(`${S}/ast/${folders[corpus.name]}.json`, "utf8")) as PowerShellAst).files };
    const ruleFull = new ParserWorkspace(full, recordedShippedNames());
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "judged-x-"));
    const files = writeSkeleton(corpus, dir);
    const skelAst = parsePowerShellFixture(dir, files);
    const ruleSkel = new ParserWorkspace(skelAst, recordedShippedNames());
    const index = new Set(files);
    const real = await comparePowerShell(path.join(C, folders[corpus.name]), full, recordedShippedNames());
    void real;
    // the reader over real text: reuse the comparison's adapter reading through its calls measure
    const realCalls = new Set<string>([...real.calls.adapterOnly, ...real.calls.parserOnly.length ? [] : []]);
    void realCalls;
    for (const row of own) {
      const w1 = ruleFull.wiresOf(row.caller).get(row.definer);
      const r1 = !!w1 && [...w1].some((n) => n.toLowerCase() === row.name.toLowerCase());
      const w4 = ruleSkel.wiresOf(row.caller).get(row.definer);
      const r4 = !!w4 && [...w4].some((n) => n.toLowerCase() === row.name.toLowerCase());
      const a2 = (await powershellAdapter.analyze({ absolutePath: path.join(dir, row.caller), workspaceRoot: dir, fileIndex: index }))!;
      const r2 = a2.dependencies.some((d) => d.resolvedPath === row.definer && d.symbols.some((n) => n.toLowerCase() === row.name.toLowerCase()));
      out.push(`${corpus.name}\t${row.row}\t${row.verdict}\t${r1 ? 1 : 0}\t${r2 ? 1 : 0}\t${r4 ? 1 : 0}`);
    }
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.writeFileSync(`${S}/crosscheck-124.tsv`, out.join("\n") + "\n");
}
main();
