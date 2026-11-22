#!/usr/bin/env node
/**
 * Grades the C# reader on a whole folder against the C# compiler's own binding.
 *
 * `csharp-compiler.cs` (Roslyn, run by `dotnet run`) builds one compilation for each project of the folder, each
 * referencing the compilations of the projects it references, binds every simple name, and records each file-to-file
 * edge a source symbol makes. A project's references are MSBuild's evaluation of it (`dotnet msbuild
 * -getItem:ProjectReference`, `msbuildProjectReferences`); where MSBuild cannot evaluate a project, as on Linux for an
 * old-style web project whose Visual Studio targets the .NET SDK does not ship, its references are its XML's
 * `<ProjectReference>` elements, read by System.Xml with every condition taken as met, and the report says which
 * projects were read which way. The C# adapter reads the same files as the generator has it read them, every file of
 * the folder its index. The two are then set side by side:
 *
 *   edges       a C# file and another it depends on: the compiler's, by a type or only a member, against the adapter's
 *               dependency lines that name another C# file of the folder;
 *   ours only   by cause: a namesake (the compiler bound a name the target declares to another file's type); an edge
 *               that rests on a reference under a condition the default configuration does not meet (the target's
 *               project is reached by the project's XML elements and not by MSBuild's evaluation, as mojoPortal's
 *               references for each database are); and the rest;
 *   references  every reference a project's XML holds under a condition MSBuild's default configuration does not
 *               meet, counted as a class of its own, since the reader reads every condition's reference as real;
 *   documentation  the C# file pairs a documentation comment's `cref` names, as the compiler resolves it, split into
 *               those the code binds as well and those only the author's word makes, and those the adapter draws.
 *
 * Without framework references a name reached only through a framework type does not bind, so the compiler's column
 * undercounts, as the November 19 probe measured. It prints figures, and every disagreement with `--detail`, and exits
 * 0: the list is the measurement. A folder that keeps `expected/csharp-compiler.json` is read from it without .NET;
 * `--write` keeps the compiler's record there.
 *
 * Usage:
 *   npm run oracle:csharp -- <folder> [--detail] [--json]
 *   npm run oracle:csharp -- <fixture> --write
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { csharpAdapter } from "@live-documentation/engine/live-docs/adapters/csharp";

import { folderFiles } from "./powershell-compare";
import { msbuildProjectReferences } from "./scip-edges";
import { sourceDigests, sourcesDiffer } from "./sources";

const COMPILER = path.join(__dirname, "csharp-compiler.cs");
/** Folders whose files are no project's: the build's outputs and a fixture's own records. */
const NOT_SOURCE = /(?:^|\/)(?:bin|obj|node_modules|expected)\//u;

/** What the compiler program printed of a folder. */
export interface CompilerRecord {
  tool:     string;
  projects: Array<{ project: string; readBy: "msbuild" | "xml"; references: string[]; xmlReferences: string[] }>;
  files:    number;
  names:    number;
  bound:    number;
  edges:    Array<{ from: string; to: string; type: string[]; member: string[] }>;
  declared: Record<string, string[]>;
  /** Every documentation comment's `cref`, as the compiler resolves it; absent from a record written before 2026-11-22. */
  crefs?:   DocumentationReference[];
  /** The files the compilation was made from, its C# files and its project files, each with its digest (`sources.ts`). */
  sources?: Record<string, string>;
}

/**
 * One `cref` of a documentation comment: the file and line it stands on, the element that carries it (`see`, `seealso`,
 * `inheritdoc`, `exception`, `permission` …), the reference as written, and the compiler's answer: `resolved` to one
 * symbol, a reason it could not choose among several candidates (`Ambiguous`, for a method's name with overloads), or
 * `unresolved`, which without framework references also says of a framework type such as `ArgumentException`.
 */
export interface DocumentationReference {
  from:     string;
  line:     number;
  element:  string;
  written:  string;
  outcome:  string;
  resolved: Array<{ kind: string; symbol: string; files: string[] }>;
}

/** The file pairs documentation references make, set beside the pairs the code binds. */
export interface DocumentationPairs {
  /** Every `cref` the record holds, and how many the compiler resolved to nothing or could not choose for. */
  references: number;
  unresolved: number;
  ambiguous:  number;
  /** C# file pairs a `cref` names a declaration across: a type or a member, never a namespace, never the file itself. */
  pairs:      string[];
  /** Of those, the pairs the compiler also binds through code, and the pairs only the author's word makes. */
  alsoCode:   string[];
  authorOnly: string[];
}

/**
 * The pairs the record's documentation references make: each to every file declaring the symbol (each part of a
 * partial type; each candidate of an ambiguous one). A namespace is no pair, as among the edges: every file that
 * opens one declares it.
 */
export function documentationPairs(record: CompilerRecord): DocumentationPairs {
  const crefs = record.crefs ?? [];
  const pairs = new Set<string>();
  for (const reference of crefs) {
    for (const symbol of reference.resolved) {
      if (symbol.kind === "Namespace") continue;
      for (const to of symbol.files) if (to !== reference.from) pairs.add(`${reference.from} → ${to}`);
    }
  }
  const code = new Set(record.edges.map((edge) => `${edge.from} → ${edge.to}`));
  const sorted = Array.from(pairs).sort();
  return {
    references: crefs.length,
    unresolved: crefs.filter((reference) => reference.outcome === "unresolved").length,
    ambiguous:  crefs.filter((reference) => reference.outcome !== "unresolved" && reference.outcome !== "resolved").length,
    pairs:      sorted,
    alsoCode:   sorted.filter((pair) => code.has(pair)),
    authorOnly: sorted.filter((pair) => !code.has(pair))
  };
}

/** The files a compilation of the folder is made from: its C# files, and its project files, from which its references are read. */
export function compiledSources(files: readonly string[]): string[] {
  return files.filter((file) => /\.(?:cs|csproj)$/iu.test(file) && !NOT_SOURCE.test(file)).sort();
}

/** Each project's references as MSBuild evaluates them, folder-relative, or null where MSBuild cannot evaluate it. */
function evaluatedReferences(root: string, files: readonly string[]): Record<string, string[] | null> {
  const references: Record<string, string[] | null> = {};
  for (const project of files.filter((file) => file.toLowerCase().endsWith(".csproj") && !NOT_SOURCE.test(file))) {
    try {
      references[project] = msbuildProjectReferences(path.join(root, project)).map((full) => path.relative(root, full).split(path.sep).join("/"));
    } catch (error) {
      if (!(error instanceof Error) || !error.message.startsWith("MSBuild could not evaluate")) throw error;
      references[project] = null;
    }
  }
  return references;
}

/** Runs the compiler program over the folder; `dotnet` must be on the path. */
export function compileFolder(root: string, files: readonly string[]): CompilerRecord {
  const run = spawnSync("dotnet", ["run", COMPILER, "--", root], {
    input:     JSON.stringify({ references: evaluatedReferences(root, files) }),
    encoding:  "utf8",
    maxBuffer: 1024 * 1024 * 1024,
    env:       { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" }
  });
  if (run.error) throw new Error(`dotnet could not be run: ${run.error.message}`);
  if (run.status !== 0) throw new Error(`dotnet exited with ${run.status}:\n${run.stdout}\n${run.stderr}`);
  return { ...(JSON.parse(run.stdout) as CompilerRecord), sources: sourceDigests(root, compiledSources(files)) };
}

/** One measure set side by side, as `oracle:powershell` reports it. */
interface Measure {
  compiler:      number;
  adapter:       number;
  both:          number;
  compilerOnly:  string[];
  adapterOnly:   { namesake: string[]; conditional: string[]; other: string[] };
}

/** The comparison of one folder: what was read, how its projects' references were, and the edges side by side. */
export interface CSharpReport {
  folder:     string;
  tool:       string;
  files:      number;
  projects:   { msbuild: number; xml: string[] };
  /** References a project's XML holds under a condition MSBuild's default configuration does not meet, as `project → reference`. */
  conditional: string[];
  edges:      Measure;
  names:      { simple: number; bound: number };
  /** The pairs the author's documentation references make, and of them those the adapter's dependency lines draw. */
  documentation: DocumentationPairs & { drawn: string[] };
}

/** The projects one reaches, itself among them, following references. */
function reach(start: string, references: Map<string, string[]>): Set<string> {
  const seen = new Set<string>([start]);
  const pending = [start];
  while (pending.length > 0) {
    for (const next of references.get(pending.pop()!) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        pending.push(next);
      }
    }
  }
  return seen;
}

/** Reads the folder both ways, or the compiler's kept record of it, and sets the edges side by side. */
export async function compareCSharp(root: string, kept?: CompilerRecord): Promise<CSharpReport> {
  const files = folderFiles(root);
  const record = kept ?? compileFolder(root, files);
  const index = new Set(files);
  const csharp = Object.keys(record.declared).sort();
  const known = new Set(csharp);

  const ours = new Set<string>();
  for (const file of csharp) {
    const analysis = await csharpAdapter.analyze({ absolutePath: path.join(root, file), workspaceRoot: root, fileIndex: index });
    for (const dependency of analysis?.dependencies ?? []) {
      const to = dependency.resolvedPath;
      if (to && to !== file && known.has(to)) ours.add(`${file} → ${to}`);
    }
  }
  const compiler = new Set(record.edges.filter((edge) => known.has(edge.from) && known.has(edge.to)).map((edge) => `${edge.from} → ${edge.to}`));

  // Each file's project: the nearest folder above it with a project file.
  const projectFolders = new Map(record.projects.map((project) => [path.posix.dirname(project.project), project.project]));
  const projectOf = (file: string): string | undefined => {
    for (let folder = path.posix.dirname(file); ; folder = path.posix.dirname(folder)) {
      const project = projectFolders.get(folder);
      if (project) return project;
      if (folder === "." || folder === "/" || folder === "") return projectFolders.get(".");
    }
  };
  const taken = new Map(record.projects.map((project) => [project.project, project.references]));
  const elements = new Map(record.projects.map((project) => [project.project, project.xmlReferences]));
  const conditional = record.projects
    .filter((project) => project.readBy === "msbuild")
    .flatMap((project) => project.xmlReferences.filter((reference) => !project.references.includes(reference)).map((reference) => `${project.project} → ${reference}`));

  const bound = new Map<string, Set<string>>();
  for (const edge of record.edges) bound.set(edge.from, new Set([...(bound.get(edge.from) ?? []), edge.to]));
  const adapterOnly = { namesake: [] as string[], conditional: [] as string[], other: [] as string[] };
  for (const key of Array.from(ours).filter((edge) => !compiler.has(edge)).sort()) {
    const [from, to] = key.split(" → ");
    const names = new Set(record.declared[to] ?? []);
    const namesake = Array.from(bound.get(from) ?? []).some((other) => other !== to && (record.declared[other] ?? []).some((name) => names.has(name)));
    const source = projectOf(from);
    const target = projectOf(to);
    const restsOnCondition = source !== undefined && target !== undefined && !reach(source, taken).has(target) && reach(source, elements).has(target);
    (namesake ? adapterOnly.namesake : restsOnCondition ? adapterOnly.conditional : adapterOnly.other).push(key);
  }
  const compilerOnly = Array.from(compiler).filter((edge) => !ours.has(edge)).sort();
  const documentation = documentationPairs(record);
  return {
    documentation: { ...documentation, drawn: documentation.pairs.filter((pair) => ours.has(pair)) },
    folder:      root,
    tool:        record.tool,
    files:       csharp.length,
    projects:    { msbuild: record.projects.filter((project) => project.readBy === "msbuild").length, xml: record.projects.filter((project) => project.readBy === "xml").map((project) => project.project) },
    conditional,
    edges:       { compiler: compiler.size, adapter: ours.size, both: ours.size - (adapterOnly.namesake.length + adapterOnly.conditional.length + adapterOnly.other.length), compilerOnly, adapterOnly },
    names:       { simple: record.names, bound: record.bound }
  };
}

function printReport(report: CSharpReport, detail: boolean): void {
  const projects = report.projects.msbuild + report.projects.xml.length;
  console.log(`The C# reader against ${report.tool}'s binding, without framework references`);
  console.log(`Folder: ${report.folder}`);
  console.log(`Files: ${report.files} C# files in ${projects} projects; references read by MSBuild's evaluation for ${report.projects.msbuild}, by their XML elements for ${report.projects.xml.length}, which MSBuild could not evaluate here`);
  console.log(`Names: ${report.names.simple} simple names, ${report.names.bound} bound`);
  console.log(`References under a condition the default configuration does not meet: ${report.conditional.length}`);
  console.log("");
  const only = report.edges.adapterOnly;
  console.log(`Edges (C# file pairs): the compiler's ${report.edges.compiler}, the adapter's ${report.edges.adapter}, both ${report.edges.both}`);
  console.log(`  the adapter's only: ${only.namesake.length + only.conditional.length + only.other.length}: a namesake ${only.namesake.length}, resting on a reference under a condition the default configuration does not meet ${only.conditional.length}, other ${only.other.length}`);
  console.log(`  the compiler's only: ${report.edges.compilerOnly.length}`);
  const doc = report.documentation;
  console.log(`Documentation references (cref): ${doc.references}, resolved to nothing ${doc.unresolved} (a framework type among them, having no framework references), ambiguous ${doc.ambiguous}`);
  console.log(`  C# file pairs they name: ${doc.pairs.length}; the compiler binds ${doc.alsoCode.length} of them through code too, the author's word alone makes ${doc.authorOnly.length}; the adapter draws ${doc.drawn.length}`);
  if (!detail) return;
  const list = (label: string, keys: string[]): void => {
    if (keys.length === 0) return;
    console.log("");
    console.log(`${label} (${keys.length}):`);
    for (const key of keys) console.log(`  ${key}`);
  };
  list("Projects whose references were read from their XML elements", report.projects.xml);
  list("References under a condition the default configuration does not meet", report.conditional);
  list("Edges the adapter draws on a namesake", only.namesake);
  list("Edges the adapter draws on a reference under such a condition", only.conditional);
  list("Other edges the adapter draws and the compiler does not", only.other);
  list("Edges the compiler binds and the adapter does not draw", report.edges.compilerOnly);
  list("Pairs only a documentation reference makes", doc.authorOnly);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const folder = args.find((arg) => !arg.startsWith("--"));
  if (!folder || args.includes("--help") || args.includes("-h")) {
    console.log("Usage: npm run oracle:csharp -- <folder> [--detail] [--json] [--write]");
    process.exit(folder ? 0 : 1);
  }
  const root = path.resolve(folder);
  const keptFile = path.join(root, "expected", "csharp-compiler.json");
  const kept = !args.includes("--write") && fs.existsSync(keptFile) ? (JSON.parse(fs.readFileSync(keptFile, "utf8")) as CompilerRecord) : undefined;
  if (kept) {
    const differ = sourcesDiffer(sourceDigests(root, compiledSources(folderFiles(root))), kept.sources);
    if (differ.length > 0) {
      console.error(`${path.relative(process.cwd(), keptFile)} was not compiled from the folder as it stands: ${differ.join("; ")}. Write it again with --write.`);
      process.exit(1);
    }
  }
  const record = kept ?? compileFolder(root, folderFiles(root));
  if (args.includes("--write")) {
    fs.mkdirSync(path.dirname(keptFile), { recursive: true });
    fs.writeFileSync(keptFile, `${JSON.stringify(record, null, 2)}\n`);
    console.log(`wrote ${path.relative(process.cwd(), keptFile)} (${record.files} C# files, ${record.edges.length} edges)`);
  }
  const report = await compareCSharp(root, record);
  if (args.includes("--json")) console.log(JSON.stringify(report, null, 2));
  else printReport(report, args.includes("--detail"));
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exit(1);
  });
}
