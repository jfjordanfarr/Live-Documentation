/**
 * Turns a SCIP index into file-to-file edges, with nothing filtered.
 *
 * A reference occurrence in one document that resolves to a definition in another
 * document is an edge. Two wrinkles of the indexers are handled here, and both are
 * recorded in the output rather than hidden:
 *
 * - scip-dotnet names a type by its innermost namespace only, so two projects that both
 *   declare `Controllers.PaymentsController` produce the same symbol. The solution's
 *   project references decide which definitions a document can see; when more than one
 *   visible definition remains, every candidate becomes an edge and the case is listed
 *   under `ambiguous`, so the reader sees it instead of a guess.
 * - scip-go also indexes the test binaries it generates outside the module, under the
 *   Go build cache. No source file exists for those documents, so they are listed under
 *   `outside` and take no part in the edges.
 * - rust-analyzer names every crate root of a Cargo package `crate/`, so the library, the
 *   binary and each integration test define the same symbol. A `crate::` path means the
 *   referencing file's own crate, so that one symbol is narrowed to the root of the crate
 *   the file belongs to, with crates read from Cargo's conventional layout.
 */
import * as fs from "node:fs";
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { scip } = require("@sourcegraph/scip-typescript/dist/src/scip") as {
  scip: {
    Index:      { deserialize(bytes: Uint8Array): ScipIndex };
    SymbolRole: { Definition: number };
  };
};

/** The parts of a SCIP index this module reads. */
export interface ScipIndex {
  metadata:  { tool_info: { name: string; version: string } };
  documents: ScipDocument[];
}

/** One indexed file and its symbol occurrences. */
export interface ScipDocument {
  relative_path: string;
  occurrences:   Array<{ symbol: string; symbol_roles: number }>;
}

/** A project of the solution, by name, with the directory its files live under. */
export interface OracleProject {
  name:       string;
  directory:  string;
  references: string[];
  /** The project's documents, listed explicitly where directories do not decide membership (Cargo crates share `src/`). */
  members?:   string[];
}

/** `from` references at least one symbol that `to` defines. */
export interface OracleEdge {
  from:    string;
  to:      string;
  symbols: string[];
}

/** A reference the solution structure could not narrow to one defining file. */
export interface OracleAmbiguity {
  from:       string;
  symbol:     string;
  candidates: string[];
}

/** The written form of a fixture's `expected/compiler-edges.json`. */
export interface OracleEdges {
  tool:         string;
  /** The project file the indexer was pointed at; absent for a language that needs none. */
  projectFile?: string;
  projects:     OracleProject[];
  documents:    string[];
  /** Documents the indexer produced from files outside the fixture. */
  outside:      string[];
  edges:        OracleEdge[];
  ambiguous:    OracleAmbiguity[];
}

/** What the caller knows about the fixture that the index does not. */
export interface IndexContext {
  projects:     OracleProject[];
  projectFile?: string;
  /** Replaces the name and version the index reports about its own tool, for a tool that misreports it. */
  tool?:        string;
}

/** SCIP's Definition role bit; the binding exposes the same value. */
const DEFINITION_ROLE = 1;

/** rust-analyzer's symbol for a crate root; the same in every crate of a package. */
const CRATE_ROOT = "crate/";

/** A symbol is `<scheme> <manager> <package-name> <version> <descriptors>`, with a space inside the first four fields doubled. Only the descriptors are shown. */
const PACKAGE_FIELDS = /^(?:(?:[^ ]| {2})+ ){4}/;

function toPosix(value: string): string {
  return value.replace(/\\/g, "/");
}

function displaySymbol(symbol: string): string {
  return symbol.replace(PACKAGE_FIELDS, "");
}

function isOutside(documentPath: string): boolean {
  return documentPath.startsWith("../") || path.posix.isAbsolute(documentPath);
}

/** Reads the projects of a .sln, or the one project of a .csproj, with their direct project references. */
export function readProjects(projectFile: string): OracleProject[] {
  const projectFileDir = path.dirname(projectFile);
  const projectPaths: string[] = [];

  if (projectFile.endsWith(".sln")) {
    const solution = fs.readFileSync(projectFile, "utf8");
    for (const match of solution.matchAll(/^Project\("\{[^}]+\}"\)\s*=\s*"[^"]+",\s*"([^"]+\.csproj)"/gmu)) {
      projectPaths.push(path.resolve(projectFileDir, toPosix(match[1])));
    }
  } else {
    projectPaths.push(path.resolve(projectFile));
  }

  const byPath = new Map<string, OracleProject>();
  for (const projectPath of projectPaths) {
    byPath.set(projectPath, {
      name:       path.basename(projectPath, ".csproj"),
      directory:  toPosix(path.relative(projectFileDir, path.dirname(projectPath))) || ".",
      references: []
    });
  }

  for (const [projectPath, project] of byPath) {
    const csproj = fs.readFileSync(projectPath, "utf8");
    for (const match of csproj.matchAll(/<ProjectReference\s+Include="([^"]+)"/gu)) {
      const target = byPath.get(path.resolve(path.dirname(projectPath), toPosix(match[1])));
      if (target) {
        project.references.push(target.name);
      }
    }
    project.references.sort();
  }

  return Array.from(byPath.values()).sort((left, right) => left.name.localeCompare(right.name));
}

/** Project references are transitive in SDK-style projects: a project sees everything its references see. */
function visibleProjects(projects: OracleProject[], name: string): Set<string> {
  const byName  = new Map(projects.map((project) => [project.name, project]));
  const visible = new Set<string>();
  const pending = [name];
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (visible.has(current)) continue;
    visible.add(current);
    pending.push(...(byName.get(current)?.references ?? []));
  }
  return visible;
}

function projectOf(projects: OracleProject[], documentPath: string): OracleProject | undefined {
  const member = projects.find((project) => project.members?.includes(documentPath));
  if (member) return member;
  let best: OracleProject | undefined;
  for (const project of projects) {
    if (project.members) continue;
    const inside = project.directory === "." || documentPath.startsWith(`${project.directory}/`);
    if (inside && (!best || project.directory.length > best.directory.length)) {
      best = project;
    }
  }
  return best;
}

/** Cargo's conventional targets of the package at `packageDir`: the library owns every other file under `src/`; each binary, test, example and bench is its own crate that sees the library. */
export function cargoProjects(packageDir: string, files: string[]): OracleProject[] {
  const manifest = fs.readFileSync(path.join(packageDir, "Cargo.toml"), "utf8");
  const name     = (/^\[package\][^[]*?^\s*name\s*=\s*"([^"]+)"/msu.exec(manifest)?.[1] ?? path.basename(packageDir)).replace(/-/g, "_");
  const sources  = files.filter((file) => file.endsWith(".rs"));
  const isOwnRoot = (file: string): boolean =>
    file === "src/main.rs" || /^src\/bin\/[^/]+\.rs$/u.test(file) || /^src\/bin\/[^/]+\/main\.rs$/u.test(file) ||
    /^(tests|examples|benches)\/[^/]+\.rs$/u.test(file) || /^(tests|examples|benches)\/[^/]+\/main\.rs$/u.test(file);
  const hasLibrary = sources.includes("src/lib.rs");
  const projects: OracleProject[] = [];
  if (hasLibrary) {
    projects.push({ name, directory: "src", references: [], members: sources.filter((file) => file.startsWith("src/") && !isOwnRoot(file)) });
  }
  for (const root of sources.filter(isOwnRoot).sort()) {
    const members = root === "src/main.rs" && !hasLibrary ? sources.filter((file) => file.startsWith("src/") && !isOwnRoot(file) || file === root) : [root];
    projects.push({ name: `${name} ${root}`, directory: toPosix(path.dirname(root)), references: hasLibrary ? [name] : [], members });
  }
  return projects;
}

/** Derives the edges from an already-decoded index. Pure; the unit test drives it with plain objects. */
export function edgesFromIndex(index: ScipIndex, context: IndexContext): OracleEdges {
  const { projects } = context;
  const inside    = index.documents.filter((document) => !isOutside(toPosix(document.relative_path)));
  const documents = inside.map((document) => toPosix(document.relative_path)).sort();
  const outside   = index.documents.map((document) => toPosix(document.relative_path)).filter(isOutside).sort();

  const definitions = new Map<string, Set<string>>();
  for (const document of inside) {
    const documentPath = toPosix(document.relative_path);
    for (const occurrence of document.occurrences) {
      if ((occurrence.symbol_roles & DEFINITION_ROLE) === 0) continue;
      let holders = definitions.get(occurrence.symbol);
      if (!holders) {
        holders = new Set();
        definitions.set(occurrence.symbol, holders);
      }
      holders.add(documentPath);
    }
  }

  const edges           = new Map<string, OracleEdge>();
  const ambiguous: OracleAmbiguity[] = [];
  const seenAmbiguities = new Set<string>();

  for (const document of inside) {
    const from    = toPosix(document.relative_path);
    const visible = visibleProjects(projects, projectOf(projects, from)?.name ?? "");

    for (const occurrence of document.occurrences) {
      const symbol = occurrence.symbol;
      if ((occurrence.symbol_roles & DEFINITION_ROLE) !== 0 || symbol.startsWith("local ")) continue;
      const holders = definitions.get(symbol);
      if (!holders || holders.has(from)) continue;

      const own        = projectOf(projects, from)?.name ?? "";
      const candidates = Array.from(holders)
        .filter((holder) => visible.has(projectOf(projects, holder)?.name ?? ""))
        .filter((holder) => displaySymbol(symbol) !== CRATE_ROOT || (projectOf(projects, holder)?.name ?? "") === own)
        .sort();
      if (candidates.length === 0) continue;

      if (candidates.length > 1) {
        const key = `${from}|${symbol}`;
        if (!seenAmbiguities.has(key)) {
          seenAmbiguities.add(key);
          ambiguous.push({ from, symbol: displaySymbol(symbol), candidates });
        }
      }

      for (const to of candidates) {
        const key = `${from}|${to}`;
        let edge  = edges.get(key);
        if (!edge) {
          edge = { from, to, symbols: [] };
          edges.set(key, edge);
        }
        const shown = displaySymbol(symbol);
        if (!edge.symbols.includes(shown)) {
          edge.symbols.push(shown);
        }
      }
    }
  }

  const sortedEdges = Array.from(edges.values())
    .map((edge) => ({ ...edge, symbols: [...edge.symbols].sort() }))
    .sort((left, right) => left.from.localeCompare(right.from) || left.to.localeCompare(right.to));

  ambiguous.sort((left, right) => left.from.localeCompare(right.from) || left.symbol.localeCompare(right.symbol));

  return {
    tool:        context.tool ?? `${index.metadata.tool_info.name} ${index.metadata.tool_info.version}`,
    projectFile: context.projectFile,
    projects,
    documents,
    outside,
    edges:       sortedEdges,
    ambiguous
  };
}

/** Decodes an index file and derives its edges. */
export function convertScipIndex(indexBytes: Uint8Array, context: IndexContext): OracleEdges {
  return edgesFromIndex(scip.Index.deserialize(indexBytes), context);
}
