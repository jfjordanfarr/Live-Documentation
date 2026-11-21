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
 * fails on either.
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
 * Holds the hand-verified edges the readers missed to the ledger: those it does not list, and its entries that are no
 * longer missed, because the readers now draw the edge or nobody asserts it any more. Either is a failure, so that the
 * ledger can only shrink truthfully.
 */
export function heldToLedger(missing: readonly HandVerifiedEdge[], ledger: readonly HandVerifiedMiss[]): { unlisted: HandVerifiedEdge[]; gone: HandVerifiedMiss[] } {
  const key = (edge: { from: string; to: string }): string => `${edge.from}|${edge.to}`;
  const listed = new Set(ledger.map(key));
  const missed = new Set(missing.map(key));
  return { unlisted: missing.filter((edge) => !listed.has(key(edge))), gone: ledger.filter((miss) => !missed.has(key(miss))) };
}

/** What the comparison found, bucket by bucket. */
export interface Report {
  fixture:  string;
  compiler: {
    tool:    string;
    found:   Array<{ from: string; to: string }>;
    missing: Array<{ from: string; to: string; symbols: string[] }>;
    extra:   Array<{ from: string; to: string }>;
  };
  handVerified?: {
    found:   HandVerifiedEdge[];
    missing: HandVerifiedEdge[];
    /** The missing edges the program's ledger does not list, and its entries no longer missed. */
    ledger:  { unlisted: HandVerifiedEdge[]; gone: HandVerifiedMiss[]; listed: HandVerifiedMiss[] };
  };
  /** Project references the compiler lists, as edges between project files, against what the project adapter found. */
  projects?: {
    found:   AdapterEdge[];
    missing: AdapterEdge[];
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

function dedupe(edges: AdapterEdge[]): AdapterEdge[] {
  const seen = new Map<string, AdapterEdge>();
  for (const edge of edges) seen.set(`${edge.from}|${edge.to}`, edge);
  return Array.from(seen.values()).sort((left, right) => left.from.localeCompare(right.from) || left.to.localeCompare(right.to));
}

function buildReport(fixtureDir: string, compiler: OracleEdges, handVerified: HandVerifiedEdges | undefined, misses: HandVerifiedMiss[], adapter: AdapterEdge[], unresolved: Report["unresolved"]): Report {
  const adapterKeys   = new Set(adapter.map((edge) => `${edge.from}|${edge.to}`));
  const compilerKeys  = new Set(compiler.edges.map((edge) => `${edge.from}|${edge.to}`));
  const compilerFiles = new Set(compiler.documents);

  const report: Report = {
    fixture:  path.relative(process.cwd(), fixtureDir),
    compiler: {
      tool:    compiler.tool,
      found:   compiler.edges.filter((edge) => adapterKeys.has(`${edge.from}|${edge.to}`)).map(({ from, to }) => ({ from, to })),
      missing: compiler.edges.filter((edge) => !adapterKeys.has(`${edge.from}|${edge.to}`)),
      extra:   adapter.filter((edge) => compilerFiles.has(edge.from) && compilerFiles.has(edge.to) && !compilerKeys.has(`${edge.from}|${edge.to}`))
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

  const projectFile = (project: { name: string; directory: string }) => path.posix.join(project.directory, `${project.name}.csproj`);
  const byName      = new Map(compiler.projects.map((project) => [project.name, project]));
  const references: AdapterEdge[] = [];
  for (const project of compiler.projects) {
    for (const reference of project.references) {
      const target = byName.get(reference);
      if (target) references.push({ from: projectFile(project), to: projectFile(target) });
    }
  }
  if (references.length > 0) {
    report.projects = {
      found:   references.filter((edge) => adapterKeys.has(`${edge.from}|${edge.to}`)),
      missing: references.filter((edge) => !adapterKeys.has(`${edge.from}|${edge.to}`))
    };
  }

  return report;
}

function printReport(report: Report): void {
  const lines: string[] = [];
  lines.push(`Oracle comparison for ${report.fixture}`);
  lines.push("");
  lines.push(`Compiler edges (${report.compiler.tool}): ${report.compiler.found.length} found, ${report.compiler.missing.length} missing, ${report.compiler.extra.length} extra`);
  for (const edge of report.compiler.missing) {
    lines.push(`  missing  ${edge.from} -> ${edge.to}`);
    lines.push(`           via ${edge.symbols.join(", ")}`);
  }
  for (const edge of report.compiler.extra) {
    lines.push(`  extra    ${edge.from} -> ${edge.to}`);
  }

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
    lines.push(`Project references: ${report.projects.found.length} found, ${report.projects.missing.length} missing`);
    for (const edge of report.projects.missing) {
      lines.push(`  missing  ${edge.from} -> ${edge.to}`);
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
  const handVerified = readHandVerifiedEdges(path.join(fixtureDir, "expected", "hand-verified-edges.json"), fixtureDir);
  const misses       = readHandVerifiedMisses(path.join(fixtureDir, "expected", "hand-verified-misses.json"), fixtureDir);
  const { edges, unresolved } = await adapterEdges(fixtureDir);
  return buildReport(fixtureDir, compiler, handVerified, misses, edges, unresolved);
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
