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
 *               those the code binds as well and those only the author's word makes, and those the adapter draws; and
 *               each reference the reader links set beside the compiler's, declaration by declaration, a reference
 *               within its own file as any other, every one they part on classed by its cause.
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
import { crefLinkTarget } from "@live-documentation/engine/live-docs/adapters/csharp.xmldoc";

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
  /** The line of the name of the declaration the comment documents; absent from a record written before declarations were compared. */
  on?:      number | null;
  element:  string;
  written:  string;
  /** `resolved`, the compiler's reason among candidates (`Ambiguous`), `unresolved`, or `unparsed`: a `cref` its grammar does not take (`L::Calc`). */
  outcome:  string;
  resolved: Array<{ kind: string; symbol: string; files: string[]; declarations?: Declaration[]; holder?: Declaration[] }>;
}

/** A declaration: the file and the line of the name it declares. */
export interface Declaration {
  file: string;
  line: number;
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

/**
 * Why the reader and the compiler part on a documentation reference, declaration by declaration. Each reference the
 * compiler records is matched with the reader's of the same file, on the same declaration, written alike; the
 * declarations each names are then set side by side, a reference within its own file as any other.
 */
export const DOCUMENTATION_CAUSES = {
  notRead:      "the reader keeps no documentation where the reference stands: a declaration it shows no symbol for (an enum's member, a member that is not public, an operator, an indexer)",
  holder:       "the reader lands on the type that holds the member the compiler names, the file showing no symbol for the member",
  unresolved:   "the reader reads the reference and resolves it to nothing",
  more:         "the reader links the declarations the compiler names and more",
  fewer:        "the reader links some of the declarations the compiler names, and no other",
  elsewhere:    "the reader links another declaration than the compiler names",
  unparsed:     "the compiler's grammar does not take the reference as written, and the reader links it",
  unwritten:    "the compiler reads no reference written so on that declaration: one in a section its preprocessor symbols leave inactive, which the reader reads as it reads every branch",
  transitive:   "the compiler resolves the reference to nothing: the target's project is reached by the file's only through another project, which the compiler's compilation does not reference and the reader follows",
  framework:    "the compiler resolves the reference to nothing: it writes a parameter's type the compilation, having no framework references, cannot bind",
  compilerNone: "the compiler resolves the reference to nothing, and the reader links it"
} as const;

/** The reader's documentation references set beside the compiler's, declaration by declaration. */
export interface DocumentationRelation {
  /** The C# file pairs the reader's resolved references make: a reference on a symbol of one file to a declaration of another. */
  pairs:      string[];
  /** The references compared (the compiler's and the reader's, each set of alike ones taken once), and how many agree. */
  compared:   number;
  agree:      number;
  /** Every reference they part on, by cause: where it stands, as written, and the declarations each names. */
  byCause:    Record<string, string[]>;
}

/** One reference as the reader read it: the file, the line of the symbol whose documentation writes it, the name as the Live Doc writes it, and the declarations it links. */
export interface ReaderReference {
  from:    string;
  on:      number;
  written: string;
  targets: Declaration[];
}

/** C#'s keywords for the framework's types, which a compilation without framework references cannot bind. */
const FRAMEWORK_KEYWORDS = new Set(["bool", "byte", "sbyte", "char", "decimal", "double", "float", "int", "uint", "long", "ulong", "short", "ushort", "object", "string", "nint", "nuint", "dynamic"]);

/**
 * Whether a reference's parameter list writes a type the compilation, having no framework references, cannot bind: a
 * keyword of the framework's types, or a name no file of the folder declares, its type arguments read the same way.
 * The oracle's own reading of the syntax, kept apart from the reader's.
 */
export function writesUndeclaredParameter(written: string, declared: ReadonlySet<string>): boolean {
  const open = written.indexOf("(");
  if (open < 0) return false;
  const names = written.slice(open + 1, written.lastIndexOf(")")).match(/[\p{L}_][\p{L}\p{N}_]*(?:\s*\.\s*[\p{L}_][\p{L}\p{N}_]*)*/gu) ?? [];
  return names.some((name) => {
    if (/^(?:ref|out|in|params|this|readonly|scoped|global)$/u.test(name)) return false;
    const last = name.slice(name.lastIndexOf(".") + 1).trim();
    return FRAMEWORK_KEYWORDS.has(last) || !declared.has(last);
  });
}

/**
 * Sets the reader's documentation references beside the compiler's, reference by reference and declaration by
 * declaration. A reference is matched by its file, the line of the declaration its comment documents and its name as
 * the Live Doc writes it (`crefLinkTarget`); alike references on one declaration are taken once, since they
 * resolve alike. An ambiguous reference names every candidate, and a reader that links them all agrees. A namespace
 * names no declaration, as the reader links none. `onlyThrough` tells a target whose project the file's reaches only
 * through another.
 */
export function compareDocumentation(record: CompilerRecord, reader: readonly ReaderReference[], onlyThrough: (from: string, to: string) => boolean = () => false): DocumentationRelation {
  const key = (from: string, on: number | null | undefined, written: string): string => `${from}\u0000${on ?? "?"}\u0000${written}`;
  const at = (declaration: Declaration): string => `${declaration.file}:${declaration.line}`;
  const read = new Map<string, { reference: ReaderReference; targets: Set<string> }>();
  for (const reference of reader) {
    const entry = read.get(key(reference.from, reference.on, reference.written)) ?? { reference, targets: new Set<string>() };
    for (const target of reference.targets) entry.targets.add(at(target));
    read.set(key(reference.from, reference.on, reference.written), entry);
  }
  const written = new Map<string, DocumentationReference>();
  for (const reference of record.crefs ?? []) {
    const where = key(reference.from, reference.on, crefLinkTarget(reference.written));
    if (!written.has(where)) written.set(where, reference);
  }
  const declaredTypes = new Set(Object.values(record.declared).flat());
  const byCause: Record<string, string[]> = {};
  let agree = 0;
  const add = (cause: string, entry: string): void => void (byCause[cause] = [...(byCause[cause] ?? []), entry]);
  const list = (declarations: Iterable<string>): string => Array.from(declarations).sort().join(", ") || "nothing";

  for (const [where, reference] of written) {
    const label = `${reference.from}:${reference.line} <${reference.element}> ${reference.written}`;
    const ours = read.get(where);
    if (ours === undefined) {
      add(DOCUMENTATION_CAUSES.notRead, label);
      continue;
    }
    const linked = ours.targets;
    const named = new Set<string>();
    const holders = new Map<string, string>();
    for (const symbol of reference.resolved) {
      if (symbol.kind === "Namespace") continue;
      for (const declaration of symbol.declarations ?? []) {
        named.add(at(declaration));
        const holder = (symbol.holder ?? []).find((candidate) => candidate.file === declaration.file);
        if (holder) holders.set(at(declaration), at(holder));
      }
    }
    const entry = `${label}: the compiler ${reference.outcome === "unparsed" ? "cannot parse it" : list(named)}; the reader ${list(linked)}`;
    if (reference.outcome === "unparsed") {
      if (linked.size === 0) agree += 1;
      else add(DOCUMENTATION_CAUSES.unparsed, entry);
      continue;
    }
    // A member the file shows no symbol for is linked at the type that holds it, as the reader's rule says.
    const asHeld = new Set(Array.from(named).map((declaration) => (!linked.has(declaration) && holders.has(declaration) && linked.has(holders.get(declaration)!) ? holders.get(declaration)! : declaration)));
    const same = (left: Set<string>, right: Set<string>): boolean => left.size === right.size && Array.from(left).every((item) => right.has(item));
    if (same(named, linked)) agree += 1;
    else if (same(asHeld, linked)) add(DOCUMENTATION_CAUSES.holder, entry);
    else if (linked.size === 0) add(DOCUMENTATION_CAUSES.unresolved, entry);
    else if (named.size === 0) {
      const files = Array.from(new Set(Array.from(linked).map((declaration) => declaration.slice(0, declaration.lastIndexOf(":")))));
      add(files.every((to) => onlyThrough(reference.from, to)) ? DOCUMENTATION_CAUSES.transitive
        : writesUndeclaredParameter(reference.written, declaredTypes) ? DOCUMENTATION_CAUSES.framework
        : DOCUMENTATION_CAUSES.compilerNone, entry);
    } else if (Array.from(asHeld).every((declaration) => linked.has(declaration))) add(DOCUMENTATION_CAUSES.more, entry);
    else if (Array.from(linked).every((declaration) => asHeld.has(declaration))) add(DOCUMENTATION_CAUSES.fewer, entry);
    else add(DOCUMENTATION_CAUSES.elsewhere, entry);
  }
  for (const [where, { reference, targets }] of read) {
    if (written.has(where)) continue;
    if (targets.size > 0) add(DOCUMENTATION_CAUSES.unwritten, `${reference.from}:${reference.on} ${reference.written}: the reader ${list(targets)}`);
  }
  const pairs = Array.from(new Set(reader.flatMap((reference) => reference.targets.filter((to) => to.file !== reference.from).map((to) => `${reference.from} → ${to.file}`)))).sort();
  return { pairs, compared: written.size + Array.from(read.keys()).filter((where) => !written.has(where) && read.get(where)!.targets.size > 0).length, agree, byCause };
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
  /**
   * The pairs the author's documentation references make; of them, those the adapter's dependency lines draw; and the
   * reader's documentation relation beside them, a relation of its own kind that no dependency line carries.
   */
  documentation: DocumentationPairs & { drawn: string[]; relation: DocumentationRelation };
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
  const references: ReaderReference[] = [];
  for (const file of csharp) {
    const analysis = await csharpAdapter.analyze({ absolutePath: path.join(root, file), workspaceRoot: root, fileIndex: index });
    for (const dependency of analysis?.dependencies ?? []) {
      const to = dependency.resolvedPath;
      if (to && to !== file && known.has(to)) ours.add(`${file} → ${to}`);
    }
    for (const symbol of analysis?.symbols ?? []) {
      for (const link of symbol.documentation?.links ?? []) {
        if (link.kind !== "cref") continue;
        const targets = (link.targets ?? []).filter((target) => known.has(target.path)).map((target) => ({ file: target.path, line: target.line }));
        references.push({ from: file, on: symbol.location?.line ?? 0, written: link.target, targets });
      }
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
  // A target whose project the file's project reaches, but not by a reference of its own.
  const onlyThrough = (from: string, to: string): boolean => {
    const source = projectOf(from);
    const target = projectOf(to);
    return source !== undefined && target !== undefined && source !== target && !(taken.get(source) ?? []).includes(target) && reach(source, taken).has(target);
  };
  const documentation = documentationPairs(record);
  return {
    documentation: { ...documentation, drawn: documentation.pairs.filter((pair) => ours.has(pair)), relation: compareDocumentation(record, references, onlyThrough) },
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
  console.log(`  C# file pairs they name: ${doc.pairs.length}; the compiler binds ${doc.alsoCode.length} of them through code too, the author's word alone makes ${doc.authorOnly.length}; the adapter's dependency lines draw ${doc.drawn.length}`);
  const relation = doc.relation;
  const pairs = new Set(doc.pairs);
  console.log(`  the reader's documentation relation: ${relation.pairs.length} pairs, ${relation.pairs.filter((pair) => pairs.has(pair)).length} of them the compiler's`);
  console.log(`  references compared declaration by declaration: ${relation.compared}, agreeing ${relation.agree}, parting ${relation.compared - relation.agree}`);
  for (const [cause, entries] of Object.entries(relation.byCause).sort(([left], [right]) => left.localeCompare(right))) console.log(`    ${entries.length}: ${cause}`);
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
  for (const [cause, entries] of Object.entries(relation.byCause)) list(`Documentation references they part on: ${cause}`, entries);
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
