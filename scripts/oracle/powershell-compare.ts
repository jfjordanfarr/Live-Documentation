#!/usr/bin/env node
/**
 * Grades the PowerShell reader on a whole folder against PowerShell's own
 * parser.
 *
 * `powershell-ast.ps1` reads every `.ps1`, `.psm1` and `.psd1` file of the
 * folder with `System.Management.Automation.Language.Parser`, in batches, and
 * the rules of `powershell-wires.ts`, written again over the parser's facts
 * with the names pwsh answers by itself (`powershell-shipped.ps1`), say which
 * file each file loads, which file each call reaches ("loaded, else unique"),
 * and which scripts are libraries. It grades the adapter's reading of the
 * facts and its list of PowerShell's own names, not the rules, which both
 * sides hold alike (`powershell-wires.ts` says what it cannot measure). The
 * PowerShell adapter reads the same files as the generator has
 * it read them, with every file of the folder as the workspace's index. The
 * two are then set side by side:
 *
 *   wires     a file and another it depends on, by a load (a dot-source, an
 *             import, `using module`, `#requires`, a loop's listing, a script
 *             run by its path, a manifest's entry) or by a call to a function
 *             the other defines: the parser's resolved file pairs against the
 *             adapter's dependencies that name a file of the folder;
 *   calls     a file, a function it calls and the file that defines it: the
 *             parser's wires of calls against the functions each of the
 *             adapter's dependencies carries;
 *   programs  whether a `.ps1` is the program's entry or a library, for every
 *             script and module.
 *
 * The folder's files are every file but the version control's folder and a
 * folder of Live Docs (`.live-documentation`), as a corpus was read for the
 * measurements of 2026-11-19 (dbatools' 1,797 PowerShell files counted its
 * `bin/` too). Which file a call reaches at run time is not the parser's to
 * say: the rules are the measured design, and this scores the adapter against
 * them, not against a run. A test file is told from working code by the
 * default configuration's conventions on both sides. It prints figures, and
 * every disagreement with `--detail`, and exits 0: the list is the
 * measurement. `pwsh` must be on the path.
 *
 * Usage:
 *   npm run oracle:powershell -- <folder> [--detail] [--json]
 */
import * as fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { powershellAdapter } from "@live-documentation/engine/live-docs/adapters/powershell";
import type { SourceAnalysisResult } from "@live-documentation/engine/live-docs/core";

import { isDataFileFacts, parsePowerShellFixture, type PowerShellAst } from "./powershell-edges";
import { askShippedNames, isLibraryByParser, parserLoads, ParserWorkspace, recordedShippedNames, type ShippedNames } from "./powershell-wires";

/** Folders a corpus's reading leaves out: the version control's, and the docs the default configuration writes. */
const LEFT_OUT = new Set([".git", ".live-documentation"]);
/** Files handed to one run of the parser, so that no one run's output grows past what a pipe carries well. */
const BATCH = 200;
const POWERSHELL = /\.(?:ps1|psm1|psd1)$/iu;

/** Every file of a folder, folder-relative with `/`, but those of the folders left out. */
export function folderFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (relative: string): void => {
    for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
      if (entry.isDirectory() && LEFT_OUT.has(entry.name)) continue;
      const entryPath = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(entryPath);
      else if (entry.isFile()) files.push(entryPath);
    }
  };
  walk("");
  return files.sort();
}

/** The parser's record of the folder's PowerShell files, read in batches and joined. */
function parseFolder(root: string, files: string[]): PowerShellAst {
  const scripts = files.filter((file) => POWERSHELL.test(file));
  let tool = "pwsh";
  const parsed: PowerShellAst["files"] = {};
  for (let start = 0; start < scripts.length; start += BATCH) {
    const batch = parsePowerShellFixture(root, scripts.slice(start, start + BATCH));
    tool = batch.tool;
    Object.assign(parsed, batch.files);
  }
  return { tool, files: parsed };
}

/** One side's reading of the folder, as sets of keys: `from → to` wires, `from → name → to` calls, and the scripts that are programs. */
interface Reading {
  wires:    Set<string>;
  calls:    Set<string>;
  programs: Set<string>;
}

/** What the parser's facts make of the folder under the rules of `powershell-wires.ts`, with the names pwsh answers by itself. */
export function parserReading(ast: PowerShellAst, shipped: ShippedNames): Reading {
  const workspace = new ParserWorkspace(ast, shipped);
  const reading: Reading = { wires: new Set(), calls: new Set(), programs: new Set() };
  for (const [file, facts] of Object.entries(ast.files)) {
    for (const load of parserLoads(file, facts)) if (load.to !== file) reading.wires.add(`${file} → ${load.to}`);
    if (isDataFileFacts(facts)) continue;
    for (const [to, names] of workspace.wiresOf(file)) {
      reading.wires.add(`${file} → ${to}`);
      for (const name of names) reading.calls.add(`${file} → ${name} → ${to}`);
    }
    if (/\.ps1$/iu.test(file) && !isLibraryByParser(facts)) reading.programs.add(file);
  }
  return reading;
}

/** What the adapter's analyses of the folder's files make of it, read as the parser's are. */
export function adapterReading(analyses: Map<string, SourceAnalysisResult>): Reading {
  const reading: Reading = { wires: new Set(), calls: new Set(), programs: new Set() };
  for (const [file, analysis] of analyses) {
    for (const dependency of analysis.dependencies) {
      const to = dependency.resolvedPath;
      if (!to || to === file) continue;
      reading.wires.add(`${file} → ${to}`);
      for (const name of dependency.symbols) reading.calls.add(`${file} → ${name} → ${to}`);
    }
    if (analysis.program !== undefined) reading.programs.add(file);
  }
  return reading;
}

/** One measure set side by side: the parser's, the adapter's, both, and each side's own. */
interface Measure {
  parser:      number;
  adapter:     number;
  both:        number;
  parserOnly:  string[];
  adapterOnly: string[];
}

function measure(parser: Set<string>, adapter: Set<string>): Measure {
  const parserOnly  = Array.from(parser).filter((key) => !adapter.has(key)).sort();
  const adapterOnly = Array.from(adapter).filter((key) => !parser.has(key)).sort();
  return { parser: parser.size, adapter: adapter.size, both: parser.size - parserOnly.length, parserOnly, adapterOnly };
}

/** The comparison of one folder: what was read, and each measure set side by side. */
export interface PowerShellReport {
  folder:      string;
  tool:        string;
  /** The pwsh whose own names the parser's side used: its version and system. */
  shipped:     string;
  files:       { powershell: number; scripts: number; parseErrors: number };
  wires:       Measure;
  calls:       Measure;
  /** Scripts and modules on which the two agree whether the file is the program's entry, and those they differ on. */
  programs:    { agree: number; differ: string[] };
}

/**
 * Reads the folder both ways and sets the readings side by side. The names pwsh answers by itself are asked of the pwsh
 * that parses the folder; a record given in its place, which runs no pwsh, is read with the names kept beside the rules.
 */
export async function comparePowerShell(root: string, ast?: PowerShellAst, names?: ShippedNames): Promise<PowerShellReport> {
  const files   = folderFiles(root);
  const record  = ast ?? parseFolder(root, files);
  const shipped = names ?? (ast ? recordedShippedNames() : askShippedNames());
  const index  = new Set(files);
  const analyses = new Map<string, SourceAnalysisResult>();
  for (const file of Object.keys(record.files).sort()) {
    const analysis = await powershellAdapter.analyze({ absolutePath: path.join(root, file), workspaceRoot: root, fileIndex: index });
    if (analysis) analyses.set(file, analysis);
  }
  const parser  = parserReading(record, shipped);
  const adapter = adapterReading(analyses);
  const scripts = Object.entries(record.files).filter(([, facts]) => !isDataFileFacts(facts)).map(([file]) => file);
  const differ  = scripts.filter((file) => parser.programs.has(file) !== adapter.programs.has(file)).sort();
  return {
    folder:   root,
    tool:     record.tool,
    shipped:  `pwsh ${shipped.version} on ${shipped.os}`,
    files:    {
      powershell:  Object.keys(record.files).length,
      scripts:     scripts.length,
      parseErrors: Object.values(record.files).filter((facts) => facts.parseErrors.length > 0).length
    },
    wires:    measure(parser.wires, adapter.wires),
    calls:    measure(parser.calls, adapter.calls),
    programs: { agree: scripts.length - differ.length, differ }
  };
}

function printReport(report: PowerShellReport, detail: boolean): void {
  console.log(`The PowerShell reader against ${report.tool}'s parser, under the rules of scripts/oracle/powershell-wires.ts`);
  console.log(`The names PowerShell answers by itself: those of ${report.shipped}`);
  console.log(`Folder: ${report.folder}`);
  console.log(`Files: ${report.files.powershell} PowerShell, ${report.files.scripts} of them scripts and modules, ${report.files.parseErrors} with a parse error`);
  console.log("");
  const line = (label: string, value: Measure): void => {
    console.log(`${label}: the parser's ${value.parser}, the adapter's ${value.adapter}, both ${value.both}`);
  };
  line("Wires (file pairs)", report.wires);
  line("Calls (file, function, defining file)", report.calls);
  console.log(`Programs: ${report.programs.agree} agree, ${report.programs.differ.length} differ`);
  if (!detail) return;
  const list = (label: string, keys: string[]): void => {
    if (keys.length === 0) return;
    console.log("");
    console.log(`${label} (${keys.length}):`);
    for (const key of keys) console.log(`  ${key}`);
  };
  list("Wires the parser's rules draw and the adapter does not", report.wires.parserOnly);
  list("Wires the adapter draws and the parser's rules do not", report.wires.adapterOnly);
  list("Calls the parser's rules draw and the adapter does not", report.calls.parserOnly);
  list("Calls the adapter draws and the parser's rules do not", report.calls.adapterOnly);
  list("Scripts the two call a program and a library apart", report.programs.differ);
}

async function main(): Promise<void> {
  const args   = process.argv.slice(2);
  const folder = args.find((arg) => !arg.startsWith("--"));
  if (!folder || args.includes("--help") || args.includes("-h")) {
    console.log("Usage: npm run oracle:powershell -- <folder> [--detail] [--json]");
    process.exit(folder ? 0 : 1);
  }
  const report = await comparePowerShell(path.resolve(folder));
  if (args.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, args.includes("--detail"));
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exit(1);
  });
}
