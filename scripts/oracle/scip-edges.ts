/**
 * Turns a SCIP index into file-to-file edges, with nothing filtered.
 *
 * A reference occurrence in one document that resolves to a definition in another
 * document is an edge. scip-dotnet names a type by its innermost namespace only, so
 * two projects that both declare `Controllers.PaymentsController` produce the same
 * symbol; the solution's project references decide which definitions a document can
 * see. When more than one visible definition remains, every candidate becomes an edge
 * and the case is listed under `ambiguous`, so the reader sees it instead of a guess.
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
  tool:        string;
  projectFile: string;
  projects:    OracleProject[];
  documents:   string[];
  edges:       OracleEdge[];
  ambiguous:   OracleAmbiguity[];
}

/** SCIP's Definition role bit; the binding exposes the same value. */
const DEFINITION_ROLE = 1;
const SYMBOL_PREFIX   = "scip-dotnet nuget . . ";

function toPosix(value: string): string {
  return value.replace(/\\/g, "/");
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
  let best: OracleProject | undefined;
  for (const project of projects) {
    const inside = project.directory === "." || documentPath.startsWith(`${project.directory}/`);
    if (inside && (!best || project.directory.length > best.directory.length)) {
      best = project;
    }
  }
  return best;
}

function displaySymbol(symbol: string): string {
  return symbol.startsWith(SYMBOL_PREFIX) ? symbol.slice(SYMBOL_PREFIX.length) : symbol;
}

/** Derives the edges from an already-decoded index. Pure; the unit test drives it with plain objects. */
export function edgesFromIndex(index: ScipIndex, projects: OracleProject[], projectFile: string, tool?: string): OracleEdges {
  const documents = index.documents.map((document) => toPosix(document.relative_path)).sort();

  const definitions = new Map<string, Set<string>>();
  for (const document of index.documents) {
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

  for (const document of index.documents) {
    const from    = toPosix(document.relative_path);
    const visible = visibleProjects(projects, projectOf(projects, from)?.name ?? "");

    for (const occurrence of document.occurrences) {
      const symbol = occurrence.symbol;
      if ((occurrence.symbol_roles & DEFINITION_ROLE) !== 0 || symbol.startsWith("local ")) continue;
      const holders = definitions.get(symbol);
      if (!holders || holders.has(from)) continue;

      const candidates = Array.from(holders)
        .filter((holder) => visible.has(projectOf(projects, holder)?.name ?? ""))
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
    tool:        tool ?? `${index.metadata.tool_info.name} ${index.metadata.tool_info.version}`,
    projectFile: path.basename(projectFile),
    projects,
    documents,
    edges:       sortedEdges,
    ambiguous
  };
}

/** Decodes an index file and derives its edges. */
export function convertScipIndex(indexBytes: Uint8Array, projects: OracleProject[], projectFile: string, tool?: string): OracleEdges {
  return edgesFromIndex(scip.Index.deserialize(indexBytes), projects, projectFile, tool);
}
