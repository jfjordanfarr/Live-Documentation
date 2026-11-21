#!/usr/bin/env node
/**
 * Compares what the shipped generator says about a fixture with what the oracle says.
 *
 * Runs the generator over a temporary copy of the fixture with the default
 * configuration, reads the dependency edges of the graph it wrote, and
 * lists every disagreement with `expected/compiler-edges.json` and, when present,
 * `expected/hand-verified-edges.json`. It prints a list, not a score, and it exits 0
 * either way: the list is the measurement.
 *
 * A hand-verified edge is a truth a person asserted, so each one the readers do
 * not draw is held to the program's ledger, `expected/hand-verified-misses.json`,
 * which names it with its cause: the report says which missing edges the ledger
 * does not list and which listed edges are now drawn, and the integration suite
 * fails on either. The compiler's missing and extra edges are held the same way
 * to the ledger of causes the sample programs share at their root
 * (`compiler-differences.json`), each cause a sentence over the edges it
 * explains, since one cause, such as C's header against the file that defines a
 * function, explains edges of several programs.
 *
 * Usage:
 *   npm run oracle:compare -- <fixture-dir> [--json]
 */
import * as fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { generateLiveDocs } from "@live-documentation/generator/generator";

import { readOracleEdges, readHandVerifiedEdges, rebasePath, type HandVerifiedEdge, type HandVerifiedEdges } from "./files";
import { copyFixture } from "./fixture";
import type { OracleEdges } from "./scip-edges";

interface AdapterEdge {
  from: string;
  to:   string;
}

/** A hand-verified edge the readers do not draw, as a program's ledger lists it: its ends and its cause, in a sentence a maintainer can act on. */
export interface HandVerifiedMiss {
  from:  string;
  to:    string;
  cause: string;
}

/** Reads a program's ledger of hand-verified misses, its paths relative to the ledger, into fixture-relative ones; empty when it keeps none. */
export function readHandVerifiedMisses(file: string, fixtureDir: string): HandVerifiedMiss[] {
  if (!fs.existsSync(file)) return [];
  const ledger = JSON.parse(fs.readFileSync(file, "utf8")) as { misses: HandVerifiedMiss[] };
  return ledger.misses.map((miss) => ({ ...miss, from: rebasePath(miss.from, path.dirname(file), fixtureDir), to: rebasePath(miss.to, path.dirname(file), fixtureDir) }));
}

/**
 * Holds the differences found to a ledger of them: those it does not list, and its entries no longer found, because a
 * reader now draws the edge, or no longer draws it, or nobody asserts it any more. Either is a failure, so that the
 * ledger can only shrink truthfully. An edge is told by its ends and, for the compiler's, by its side.
 */
export function heldToLedger<Found extends LedgerEdge, Listed extends LedgerEdge>(found: readonly Found[], ledger: readonly Listed[]): { unlisted: Found[]; gone: Listed[] } {
  const key = (edge: LedgerEdge): string => `${edge.side ?? ""}|${edge.from}|${edge.to}`;
  const listed = new Set(ledger.map(key));
  const seen   = new Set(found.map(key));
  return { unlisted: found.filter((edge) => !listed.has(key(edge))), gone: ledger.filter((entry) => !seen.has(key(entry))) };
}

interface LedgerEdge {
  from:  string;
  to:    string;
  side?: "missing" | "extra";
}

/** An edge the compiler records and the readers do not draw, or the reverse, in one sample program. */
export interface CompilerDifference extends LedgerEdge {
  program: string;
  side:    "missing" | "extra";
}

/**
 * A cause of differences with the compiler, as the sample programs' ledger (`compiler-differences.json`) states it:
 * what the reader does and what the compiler does, in a sentence; whether it is a gap the readers mean to close, a
 * difference of grain they may keep, or an edge beyond what the compiler sees; and the differences it explains.
 */
export interface CompilerCause {
  cause:       string;
  kind:        "gap" | "grain" | "beyond the compiler";
  differences: CompilerDifference[];
}

/** The ledger of differences with the compiler, kept once for every sample program at the root they share. */
export const COMPILER_LEDGER = "compiler-differences.json";

/** Reads the ledger of causes; empty when there is none. */
export function readCompilerCauses(file: string): CompilerCause[] {
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as { causes: CompilerCause[] }).causes : [];
}

/** A sample program's name, `<language>/<program>`, and the ledger of causes at the root of the sample programs. */
function sampleProgram(fixtureDir: string): { program: string; ledger: string } {
  const language = path.dirname(fixtureDir);
  return { program: `${path.basename(language)}/${path.basename(fixtureDir)}`, ledger: path.join(path.dirname(language), COMPILER_LEDGER) };
}

/** What the comparison found, bucket by bucket. */
export interface Report {
  fixture:  string;
  compiler: {
    tool:    string;
    found:   Array<{ from: string; to: string }>;
    missing: Array<{ from: string; to: string; symbols: string[] }>;
    extra:   Array<{ from: string; to: string }>;
    /** The missing and extra edges no cause of the ledger lists, its entries for this program no longer found, and each edge's cause. */
    ledger:  { unlisted: CompilerDifference[]; gone: CompilerDifference[]; causeOf: Record<string, CompilerCause> };
  };
  handVerified?: {
    found:   HandVerifiedEdge[];
    missing: HandVerifiedEdge[];
    /** The missing edges the program's ledger does not list, and its entries no longer missed. */
    ledger:  { unlisted: HandVerifiedEdge[]; gone: HandVerifiedMiss[]; listed: HandVerifiedMiss[] };
  };
  /**
   * Project references the compiler lists, as edges between the manifests standing in the projects' folders, against
   * what the project adapter found; a reference between projects with no manifest of their own in the fixture (Cargo's
   * targets, whose folder is the crate root's) has no file to be drawn between and is listed apart, by the projects' names.
   */
  projects?: {
    found:    AdapterEdge[];
    missing:  AdapterEdge[];
    unplaced: AdapterEdge[];
  };
  beyondCompiler: AdapterEdge[];
  unresolved:     Array<{ from: string; raw: string }>;
}

async function adapterEdges(fixtureDir: string): Promise<{ edges: AdapterEdge[]; unresolved: Report["unresolved"] }> {
  const workDir = copyFixture(fixtureDir, "oracle-compare-");
  try {
    const config = normalizeLiveDocumentationConfig();
    await generateLiveDocs({
      workspaceRoot: workDir,
      config,
      logger:        { info: () => undefined, warn: () => undefined, error: (message) => console.error(message) }
    });

    const graph = await readLiveDocGraph({ workspaceRoot: workDir, config });
    const edges: AdapterEdge[]          = [];
    const unresolved: Report["unresolved"] = [];
    for (const file of Object.values(graph.files)) {
      for (const edge of file.edges) {
        if (edge.kind !== "import" && edge.kind !== "re-export") continue;
        if (edge.to) {
          edges.push({ from: file.codePath, to: edge.to });
        } else {
          unresolved.push({ from: file.codePath, raw: edge.label });
        }
      }
    }
    return { edges: dedupe(edges), unresolved };
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

/** The file names of a project's manifest, by language: a .NET project file, Cargo's, npm's, Maven's, Gradle's, Go's, Python's. */
const MANIFEST = /^(?:.+\.(?:csproj|vbproj|fsproj)|Cargo\.toml|package\.json|pom\.xml|build\.gradle(?:\.kts)?|go\.mod|pyproject\.toml)$/u;

/**
 * The manifest standing in a compiler project's folder, fixture-relative: the project file named for it, or else the
 * folder's one manifest. None when the folder holds none, as for a Cargo target, whose folder is its crate root's.
 */
function manifestOf(fixtureDir: string, project: { name: string; directory: string }): string | undefined {
  const folder = path.join(fixtureDir, project.directory);
  if (!fs.existsSync(folder)) return undefined;
  const manifests = fs.readdirSync(folder).filter((name) => MANIFEST.test(name));
  const named     = manifests.find((name) => name.slice(0, name.lastIndexOf(".")) === project.name && /proj$/u.test(name));
  const found     = named ?? (manifests.length === 1 ? manifests[0] : undefined);
  return found === undefined ? undefined : path.posix.join(project.directory.replace(/\\/gu, "/"), found);
}

function dedupe(edges: AdapterEdge[]): AdapterEdge[] {
  const seen = new Map<string, AdapterEdge>();
  for (const edge of edges) seen.set(`${edge.from}|${edge.to}`, edge);
  return Array.from(seen.values()).sort((left, right) => left.from.localeCompare(right.from) || left.to.localeCompare(right.to));
}

interface Expectations {
  compiler:     OracleEdges;
  handVerified: HandVerifiedEdges | undefined;
  misses:       HandVerifiedMiss[];
  program:      string;
  causes:       CompilerCause[];
}

function buildReport(fixtureDir: string, expectations: Expectations, adapter: AdapterEdge[], unresolved: Report["unresolved"]): Report {
  const { compiler, handVerified, misses, program, causes } = expectations;
  const adapterKeys   = new Set(adapter.map((edge) => `${edge.from}|${edge.to}`));
  const compilerKeys  = new Set(compiler.edges.map((edge) => `${edge.from}|${edge.to}`));
  const compilerFiles = new Set(compiler.documents);

  const missing = compiler.edges.filter((edge) => !adapterKeys.has(`${edge.from}|${edge.to}`));
  const extra   = adapter.filter((edge) => compilerFiles.has(edge.from) && compilerFiles.has(edge.to) && !compilerKeys.has(`${edge.from}|${edge.to}`));
  const listed  = causes.flatMap((cause) => cause.differences.filter((difference) => difference.program === program).map((difference) => ({ difference, cause })));
  const differences: CompilerDifference[] = [
    ...missing.map(({ from, to }) => ({ program, side: "missing" as const, from, to })),
    ...extra.map(({ from, to }) => ({ program, side: "extra" as const, from, to }))
  ];
  const report: Report = {
    fixture:  path.relative(process.cwd(), fixtureDir),
    compiler: {
      tool:    compiler.tool,
      found:   compiler.edges.filter((edge) => adapterKeys.has(`${edge.from}|${edge.to}`)).map(({ from, to }) => ({ from, to })),
      missing,
      extra,
      ledger:  {
        ...heldToLedger(differences, listed.map((entry) => entry.difference)),
        causeOf: Object.fromEntries(listed.map((entry) => [`${entry.difference.side}|${entry.difference.from}|${entry.difference.to}`, entry.cause]))
      }
    },
    beyondCompiler: adapter.filter((edge) => !(compilerFiles.has(edge.from) && compilerFiles.has(edge.to))),
    unresolved
  };

  if (handVerified) {
    const missing = handVerified.edges.filter((edge) => !adapterKeys.has(`${edge.from}|${edge.to}`));
    report.handVerified = {
      found:   handVerified.edges.filter((edge) => adapterKeys.has(`${edge.from}|${edge.to}`)),
      missing,
      ledger:  { ...heldToLedger(missing, misses), listed: misses }
    };
  }

  const byName     = new Map(compiler.projects.map((project) => [project.name, project]));
  const references: AdapterEdge[] = [];
  const unplaced: AdapterEdge[]   = [];
  for (const project of compiler.projects) {
    for (const reference of project.references) {
      const target = byName.get(reference);
      if (!target) continue;
      const from = manifestOf(fixtureDir, project);
      const to   = manifestOf(fixtureDir, target);
      if (from && to && from !== to) references.push({ from, to });
      else unplaced.push({ from: project.name, to: target.name });
    }
  }
  if (references.length + unplaced.length > 0) {
    report.projects = {
      found:   references.filter((edge) => adapterKeys.has(`${edge.from}|${edge.to}`)),
      missing: references.filter((edge) => !adapterKeys.has(`${edge.from}|${edge.to}`)),
      unplaced
    };
  }

  return report;
}

function printReport(report: Report): void {
  const lines: string[] = [];
  lines.push(`Oracle comparison for ${report.fixture}`);
  lines.push("");
  const { ledger: causes } = report.compiler;
  const because = (side: "missing" | "extra", edge: { from: string; to: string }): string => {
    const cause = causes.causeOf[`${side}|${edge.from}|${edge.to}`];
    return cause ? `           because (${cause.kind}) ${cause.cause}` : "           not in the ledger";
  };
  lines.push(`Compiler edges (${report.compiler.tool}): ${report.compiler.found.length} found, ${report.compiler.missing.length} missing, ${report.compiler.extra.length} extra, ${causes.unlisted.length} of them in no cause of the ledger, ${causes.gone.length} listed and no longer found`);
  for (const edge of report.compiler.missing) {
    lines.push(`  missing  ${edge.from} -> ${edge.to}`);
    lines.push(`           via ${edge.symbols.join(", ")}`);
    lines.push(because("missing", edge));
  }
  for (const edge of report.compiler.extra) {
    lines.push(`  extra    ${edge.from} -> ${edge.to}`);
    lines.push(because("extra", edge));
  }
  for (const difference of causes.gone) lines.push(`  listed and no longer found  ${difference.side} ${difference.from} -> ${difference.to}`);

  if (report.handVerified) {
    const { ledger } = report.handVerified;
    lines.push("");
    lines.push(`Hand-verified edges: ${report.handVerified.found.length} found, ${report.handVerified.missing.length} missing, ${ledger.unlisted.length} of them not in the ledger, ${ledger.gone.length} listed and no longer missing`);
    for (const edge of report.handVerified.missing) {
      const cause = ledger.listed.find((miss) => miss.from === edge.from && miss.to === edge.to)?.cause;
      lines.push(`  missing  ${edge.from} -> ${edge.to}${edge.remote ? "  (remote)" : ""}`);
      lines.push(`           via ${edge.via}`);
      lines.push(cause ? `           because ${cause}` : "           not in the ledger");
    }
    for (const miss of ledger.gone) lines.push(`  listed and no longer missing  ${miss.from} -> ${miss.to}`);
  }

  if (report.projects) {
    lines.push("");
    lines.push(`Project references: ${report.projects.found.length} found, ${report.projects.missing.length} missing, ${report.projects.unplaced.length} between projects with no manifest of their own`);
    for (const edge of report.projects.missing) {
      lines.push(`  missing  ${edge.from} -> ${edge.to}`);
    }
    for (const edge of report.projects.unplaced) {
      lines.push(`  no file  ${edge.from} -> ${edge.to}`);
    }
  }

  if (report.beyondCompiler.length > 0) {
    lines.push("");
    lines.push(`Adapter edges outside the compiler's view (${report.beyondCompiler.length}):`);
    for (const edge of report.beyondCompiler) {
      lines.push(`  ${edge.from} -> ${edge.to}`);
    }
  }

  if (report.unresolved.length > 0) {
    lines.push("");
    lines.push(`Adapter dependencies that resolved to no file (${report.unresolved.length}):`);
    for (const entry of report.unresolved) {
      lines.push(`  ${entry.from}: ${entry.raw}`);
    }
  }

  console.log(lines.join("\n"));
}

/** Runs the generator over a copy of the fixture and reports its disagreements with the oracle files. */
export async function compareFixture(fixtureDir: string): Promise<Report> {
  const compiler = readOracleEdges(path.join(fixtureDir, "expected", "compiler-edges.json"), fixtureDir);
  if (!compiler) {
    throw new Error(`no expected/compiler-edges.json under ${fixtureDir}; run oracle:index first`);
  }
  const handVerified        = readHandVerifiedEdges(path.join(fixtureDir, "expected", "hand-verified-edges.json"), fixtureDir);
  const misses              = readHandVerifiedMisses(path.join(fixtureDir, "expected", "hand-verified-misses.json"), fixtureDir);
  const { program, ledger } = sampleProgram(fixtureDir);
  const { edges, unresolved } = await adapterEdges(fixtureDir);
  return buildReport(fixtureDir, { compiler, handVerified, misses, program, causes: readCompilerCauses(ledger) }, edges, unresolved);
}

async function main(): Promise<void> {
  const args       = process.argv.slice(2);
  const json       = args.includes("--json");
  const fixtureArg = args.find((arg) => !arg.startsWith("--"));
  if (!fixtureArg || args.includes("--help") || args.includes("-h")) {
    console.log("Usage: npm run oracle:compare -- <fixture-dir> [--json]");
    process.exit(fixtureArg ? 0 : 1);
  }

  const report = await compareFixture(path.resolve(fixtureArg));

  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
