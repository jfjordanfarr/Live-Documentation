#!/usr/bin/env node
/**
 * The hand reading of 2026-11-19 kept where a test can read it: 222 PowerShell wires, each a call at a line of one
 * file claimed to reach a function another file defines, judged in the source by two readers who agreed on every one
 * (`AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/samples.md`). The corpora they
 * were judged on are public repositories this one does not hold; what is kept of them is an extract, and from it a
 * skeleton of each corpus is written for the PowerShell reader to read.
 *
 * The extract holds, for each corpus, only the files a judged wire's answer rests on, and of each file only what the
 * rule "loaded, else unique" reads: the functions it defines whose names a judged wire calls, at its own level or
 * local to another function or a script block, each at its line; the judged calls it makes, each at its line; and its
 * loads (dot-sources, imports, `using module`, `#requires`, a loop's listing, a script run by its path, a manifest's
 * entries) of other files of the extract, each as the file PowerShell's parser resolved it to. No line of a corpus's
 * code is kept: a load is written again as the plainest load of the same kind of the same file, so a skeleton tests
 * the reader's rule, not its reading of `Join-Path` and loops, which the parser-record tests grade on this
 * repository's own fixtures.
 *
 * The files kept: every calling file and every file a wire claims, every file that defines a judged name at its own
 * level (so that "unique" means what it meant in the whole corpus), the module roots whose modules hold a calling
 * file with the files that put it there, and every file on a load path from a calling file or such a root to a
 * defining one (so that "loaded" does too). A load path through a file left out would be a load the extract lost;
 * none is, since every file on every such path is kept.
 *
 * Written by hand, once, from the corpora at their commits, with PowerShell's parser (`powershell-ast.ps1`):
 *
 *   npx tsx --tsconfig ./tsconfig.base.json scripts/oracle/powershell-judged.ts --out <extract.json> \
 *     --samples <samples.md> dbatools=<folder> al-go=<folder> azurestack-tools=<folder> tsqlt=<folder>
 *
 * A record the parser already wrote may stand for a folder's run: `dbatools=<folder>@<record.json>`.
 */
import * as fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { folderFiles } from "./powershell-compare";
import { isDataFileFacts, parsePowerShellFixture, type PowerShellAst, type PowerShellDataFileFacts, type PowerShellScriptFacts } from "./powershell-edges";
import { readVerdicts, type HandVerdict } from "./powershell-verdicts";
import { callName, isManifest, parserLoads, ParserWorkspace, recordedShippedNames } from "./powershell-wires";

/** A function a file defines, by the name it is written by there and the line it starts on. */
export interface ExtractFunction {
  name: string;
  line: number;
}

/** A command a file calls, as written, at its line; `&` or `.` when the call is written with one. */
export interface ExtractCall {
  name:      string;
  line:      number;
  operator?: "&" | ".";
}

/** A load of another file of the extract, by kind, at the line it stands on; `using module` and `#requires` are imports. */
export interface ExtractLoad {
  kind: "dot" | "import" | "run";
  to:   string;
  line: number;
}

/** What the extract keeps of one file. */
export interface ExtractFile {
  /** Functions defined at the file's own level, where whoever loads the file sees them. */
  defines?:  ExtractFunction[];
  /** Functions defined inside another function or a script block, local to it. */
  local?:    ExtractFunction[];
  calls?:    ExtractCall[];
  loads?:    ExtractLoad[];
  /** A module manifest's entries that name files of the extract, by key, each as the path from the manifest's folder. */
  manifest?: Array<{ key: string; value: string }>;
}

/** One corpus: the repository it was read from, its licence, and the files kept. */
export interface ExtractCorpus {
  /** The name the hand reading's table gives it. */
  name:       string;
  repository: string;
  address:    string;
  commit:     string;
  licence:    string;
  /** The licence's notice as the repository carries it, kept beside the extract. */
  notice:     string;
  files:      Record<string, ExtractFile>;
}

/** A judged wire: the row of the table, the definition's line, and why the judges said false or arguable. */
export interface JudgedWire extends HandVerdict {
  definerLine: number;
  why?:        string;
}

/** The extract as it is committed. */
export interface JudgedExtract {
  about:      string[];
  permission: { asked: string; answer: string; by: string; date: string };
  corpora:    ExtractCorpus[];
  /** All 222 rows of the table, the shop's among them, though its corpus was never committed. */
  wires:      JudgedWire[];
}

/** The corpora the table names, with where each was read from and its licence's notice. */
export const CORPORA: Array<Omit<ExtractCorpus, "files">> = [
  { name: "dbatools", repository: "dataplat/dbatools", address: "https://github.com/dataplat/dbatools", commit: "067b215bf843ec3573a79226ac9d2b871d1440cb", licence: "MIT", notice: "licences/dbatools.txt" },
  { name: "al-go", repository: "microsoft/AL-Go", address: "https://github.com/microsoft/AL-Go", commit: "403f36ab563291207687c513c8dedd93f683f8ce", licence: "MIT", notice: "licences/al-go.txt" },
  { name: "azurestack-tools", repository: "Azure/AzureStack-Tools", address: "https://github.com/Azure/AzureStack-Tools", commit: "0e4a9f32c4677e2ee3b687032e0472b890a772b6", licence: "MIT", notice: "licences/azurestack-tools.txt" },
  { name: "tsqlt", repository: "tSQLt-org/tSQLt", address: "https://github.com/tSQLt-org/tSQLt", commit: "4a921d0dacfb1d66b3db124c58158c80e5e910e6", licence: "Apache-2.0", notice: "licences/tsqlt.txt" }
];

/** Every file reached from some files by following the edges given. */
function closure(start: Iterable<string>, next: (file: string) => Iterable<string>): Set<string> {
  const reached = new Set(start);
  const pending = Array.from(reached);
  while (pending.length > 0) {
    const at = pending.pop()!;
    for (const to of next(at)) {
      if (!reached.has(to)) {
        reached.add(to);
        pending.push(to);
      }
    }
  }
  return reached;
}

/** A script's loads of files, each with its line and kind as the extract writes it. */
function scriptLoads(file: string, facts: PowerShellScriptFacts): ExtractLoad[] {
  const loads: ExtractLoad[] = [];
  const add = (kind: ExtractLoad["kind"], to: string | null, line: number): void => {
    if (to && to !== file) loads.push({ kind, to, line });
  };
  for (const command of facts.importModules) for (const name of command.names) add("import", name.resolved, command.line);
  for (const using of facts.usingStatements) if (using.kind === "Module") add("import", using.resolved, using.line);
  for (const module of facts.requiredModules) add("import", module.resolved, 1);
  for (const dotSource of facts.dotSources) add("dot", dotSource.resolved, dotSource.line);
  for (const load of facts.loads) for (const to of load.resolved) add(load.kind, to, load.line);
  const seen = new Set<string>();
  return loads.filter((load) => {
    const key = `${load.kind}|${load.to}|${load.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The files of one corpus a judged wire's answer rests on, and what each keeps. */
export function extractCorpus(ast: PowerShellAst, rows: HandVerdict[]): Record<string, ExtractFile> {
  const workspace = new ParserWorkspace(ast, recordedShippedNames());
  const names     = new Set(rows.map((row) => callName(row.name)));
  const loads     = new Map(Object.entries(ast.files).map(([file, facts]) => [file, parserLoads(file, facts)]));
  const reaches   = (file: string): string[] => (loads.get(file) ?? []).filter((load) => load.kind !== "run").map((load) => load.to);
  const reversed  = new Map<string, string[]>();
  for (const [file, list] of loads) for (const load of list) if (load.kind !== "run") reversed.set(load.to, [...(reversed.get(load.to) ?? []), file]);

  const callers  = new Set(rows.map((row) => row.caller));
  const definers = new Set<string>();
  for (const [file, facts] of Object.entries(ast.files)) {
    if (isDataFileFacts(facts)) continue;
    if (facts.functions.some((fn) => !fn.member && fn.fileScope && names.has(callName(fn.name)))) definers.add(file);
  }
  const roots = Object.keys(ast.files).filter((file) => {
    const facts = ast.files[file];
    return isDataFileFacts(facts) ? isManifest(facts) : /\.psm1$/iu.test(file);
  });

  const kept = new Set<string>([...callers, ...rows.map((row) => row.definer), ...definers]);
  const starts = new Set(callers);
  for (const root of roots) {
    const members = workspace.membersOf(root);
    const held    = Array.from(callers).filter((caller) => members.has(caller));
    if (held.length === 0) continue;
    starts.add(root);
    // The files that put a calling file in the module: those of the module from which a dot-source, or the root's manifest entry, leads to it.
    const into = (file: string): string[] => (reversed.get(file) ?? []).filter((from) => members.has(from) && (loads.get(from) ?? []).some((load) => load.to === file && (load.kind === "dot" || (load.kind === "manifest" && from === root))));
    for (const file of closure(held, into)) kept.add(file);
  }
  const forward  = closure(starts, reaches);
  const backward = closure(definers, (file) => reversed.get(file) ?? []);
  for (const file of forward) if (backward.has(file)) kept.add(file);

  const extract: Record<string, ExtractFile> = {};
  for (const file of Array.from(kept).sort()) {
    const facts = ast.files[file];
    if (!facts) throw new Error(`No record of ${file}: the corpus does not hold a file the table names`);
    const entry: ExtractFile = {};
    if (isDataFileFacts(facts)) {
      const manifest = manifestEntries(file, facts, kept);
      if (manifest) entry.manifest = manifest;
      extract[file] = entry;
      continue;
    }
    const functions = facts.functions.filter((fn) => !fn.member && names.has(callName(fn.name)));
    const defines   = functions.filter((fn) => fn.fileScope).map((fn) => ({ name: fn.name, line: fn.line }));
    const local     = functions.filter((fn) => !fn.fileScope).map((fn) => ({ name: fn.name, line: fn.line }));
    const calls     = rows.filter((row) => row.caller === file).map((row) => judgedCall(file, facts, row));
    const kept_     = scriptLoads(file, facts).filter((load) => kept.has(load.to));
    if (defines.length > 0) entry.defines = defines;
    if (local.length > 0) entry.local = local;
    if (calls.length > 0) entry.calls = uniqueCalls(calls);
    if (kept_.length > 0) entry.loads = kept_;
    extract[file] = entry;
  }
  return extract;
}

/** A manifest's entries naming kept files, each as the path from its folder; undefined for a data file. */
function manifestEntries(file: string, facts: PowerShellDataFileFacts, kept: Set<string>): ExtractFile["manifest"] {
  if (!isManifest(facts)) return undefined;
  const directory = path.posix.dirname(file);
  return facts.references
    .filter((reference) => reference.resolved && reference.resolved !== file && kept.has(reference.resolved))
    .map((reference) => ({ key: reference.key, value: path.posix.relative(directory, reference.resolved!) }));
}

/** The call a row judges, as the parser found it at the row's line: its name as written and its operator. */
function judgedCall(file: string, facts: PowerShellScriptFacts, row: HandVerdict): ExtractCall {
  const found = facts.invocations.find((invocation) => invocation.line === row.line && invocation.name && callName(invocation.name) === callName(row.name));
  if (!found) throw new Error(`The parser finds no call of ${row.name} at ${file}:${row.line} (row ${row.row})`);
  const call: ExtractCall = { name: found.name!, line: row.line };
  if (found.operator === "&" || found.operator === ".") call.operator = found.operator;
  return call;
}

function uniqueCalls(calls: ExtractCall[]): ExtractCall[] {
  const seen = new Set<string>();
  return calls.filter((call) => {
    const key = `${call.name}|${call.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.line - b.line);
}

/** A path written for a load from one file to another: the other's path from the first's folder, after `$PSScriptRoot`. */
function fromScriptRoot(file: string, to: string): string {
  return `"$PSScriptRoot/${path.posix.relative(path.posix.dirname(file), to)}"`;
}

/** The text of one skeleton file: each item on its line, items that share a line joined by `;`. */
export function skeletonText(file: string, entry: ExtractFile): string {
  if (entry.manifest !== undefined) {
    const keys = new Map<string, string[]>();
    for (const { key, value } of entry.manifest) keys.set(key, [...(keys.get(key) ?? []), value]);
    const lines = Array.from(keys, ([key, values]) => `    ${key} = @(${values.map((value) => `'${value.replace(/'/gu, "''")}'`).join(", ")})`);
    // An empty version marks the table a module manifest's whichever of its entries the extract keeps.
    return ["@{", "    ModuleVersion = ''", ...lines, "}", ""].join("\n");
  }
  const at = new Map<number, string[]>();
  const put = (line: number, text: string): void => {
    at.set(line, [...(at.get(line) ?? []), text]);
  };
  for (const fn of entry.defines ?? []) put(fn.line, `function ${fn.name} { }`);
  for (const fn of entry.local ?? []) put(fn.line, `& { function ${fn.name} { } }`);
  for (const load of entry.loads ?? []) {
    const written = fromScriptRoot(file, load.to);
    put(load.line, load.kind === "dot" ? `. ${written}` : load.kind === "run" ? `& ${written}` : `Import-Module ${written}`);
  }
  for (const call of entry.calls ?? []) put(call.line, call.operator ? `${call.operator} ${call.name}` : call.name);
  const last = Math.max(0, ...at.keys());
  const lines: string[] = [];
  for (let line = 1; line <= last; line += 1) lines.push((at.get(line) ?? []).join("; "));
  return `${lines.join("\n")}\n`;
}

/** Writes a corpus's skeleton into a folder, one file for each kept, and returns their paths. */
export function writeSkeleton(corpus: ExtractCorpus, folder: string): string[] {
  for (const [file, entry] of Object.entries(corpus.files)) {
    const target = path.join(folder, ...file.split("/"));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, skeletonText(file, entry));
  }
  return Object.keys(corpus.files).sort();
}

/** The why of a false or arguable row, from the table's last cell. */
function whyOf(markdown: string): Map<number, { why?: string; definerLine: number }> {
  const found = new Map<number, { why?: string; definerLine: number }>();
  for (const line of markdown.split(/\r?\n/u)) {
    if (!/^\|\s*\d+\s*\|/u.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    const definerLine = Number(/:(\d+)`?$/u.exec(cells[4] ?? "")?.[1]);
    found.set(Number(cells[0]), cells[8] ? { why: cells[8], definerLine } : { definerLine });
  }
  return found;
}

/** The parser's record of a folder's PowerShell files, two hundred files to a run, as the grader reads a corpus. */
function parseInBatches(folder: string): PowerShellAst {
  const scripts = folderFiles(folder).filter((file) => /\.(?:ps1|psm1|psd1)$/iu.test(file));
  const files: PowerShellAst["files"] = {};
  for (let start = 0; start < scripts.length; start += 200) Object.assign(files, parsePowerShellFixture(folder, scripts.slice(start, start + 200)).files);
  return { tool: "pwsh", files };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const valueOf = (flag: string): string | undefined => {
    const at = args.indexOf(flag);
    return at === -1 ? undefined : args[at + 1];
  };
  const out     = valueOf("--out");
  const samples = valueOf("--samples");
  const folders = args.filter((arg) => /^[a-z-]+=/u.test(arg));
  if (!out || !samples || folders.length === 0) {
    console.log("Usage: tsx scripts/oracle/powershell-judged.ts --out <extract.json> --samples <samples.md> <corpus>=<folder>[@<record.json>] ...");
    process.exit(1);
  }
  const markdown = fs.readFileSync(samples, "utf8");
  const rows     = readVerdicts(markdown);
  const why      = whyOf(markdown);
  const corpora: ExtractCorpus[] = [];
  for (const meta of CORPORA) {
    const given = folders.find((arg) => arg.startsWith(`${meta.name}=`));
    if (!given) throw new Error(`No folder given for ${meta.name}`);
    const [folder, record] = given.slice(meta.name.length + 1).split("@");
    const ast: PowerShellAst = record
      ? { tool: "pwsh", files: (JSON.parse(fs.readFileSync(record, "utf8")) as { files: PowerShellAst["files"] }).files }
      : parseInBatches(folder);
    corpora.push({ ...meta, files: extractCorpus(ast, rows.filter((row) => row.corpus === meta.name)) });
  }
  const extract: JudgedExtract = {
    about: [
      "An extract of four public repositories, kept as the test data of tests/integration/live-docs/powershell-judged.test.ts: for each file, its path, the functions it defines whose names a judged wire calls, the judged calls it makes and the files it loads, each at its line. No code of theirs is kept.",
      "It was changed from the repositories' files, by keeping only those facts; each repository's own licence notice is kept beside it, under licences/, as its licence asks.",
      "The 222 wires are the hand reading of 2026-11-19 (AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/samples.md), two judges agreeing on every row. Row 215 is of the cold run's shop, which was never committed, so it is kept and never scored.",
      "Written by scripts/oracle/powershell-judged.ts from the repositories at the commits named, read with PowerShell's parser (pwsh 7.7.0)."
    ],
    permission: { asked: "a small extract of those four public MIT and Apache repositories committed as test data: paths, function names, calls; no code", answer: "Yep! Go ahead!", by: "the owner", date: "2026-11-22" },
    corpora,
    wires: rows.map((row) => ({ ...row, ...why.get(row.row)! }))
  };
  fs.writeFileSync(out, `${JSON.stringify(extract, null, 1)}\n`);
  for (const corpus of corpora) console.log(`${corpus.name}: ${Object.keys(corpus.files).length} files`);
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exit(1);
  });
}
