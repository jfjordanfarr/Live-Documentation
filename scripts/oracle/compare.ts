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
 * Usage:
 *   npm run oracle:compare -- <fixture-dir> [--json]
 */
import * as fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  LIVE_DOCUMENTATION_DEFAULT_GLOBS,
  normalizeLiveDocumentationConfig
} from "@live-documentation/engine/config/liveDocumentationConfig";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { generateLiveDocs } from "@live-documentation/generator/generator";

import { copyFixture } from "./fixture";
import type { OracleEdges } from "./scip-edges";

interface HandVerifiedEdge {
  from:    string;
  to:      string;
  via:     string;
  remote?: boolean;
}

interface HandVerifiedEdges {
  edges: HandVerifiedEdge[];
}

interface AdapterEdge {
  from: string;
  to:   string;
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
  };
  beyondCompiler: AdapterEdge[];
  unresolved:     Array<{ from: string; raw: string }>;
}

/** The default globs anchor on this workspace's layout; a fixture is its own workspace, so keep only the extensions. */
function fixtureGlobs(): string[] {
  const extensions = new Set(LIVE_DOCUMENTATION_DEFAULT_GLOBS.map((pattern) => pattern.slice(pattern.lastIndexOf("/") + 1)));
  return Array.from(extensions).map((suffix) => `**/${suffix}`);
}

function readJson<T>(filePath: string): T | undefined {
  return fs.existsSync(filePath) ? (JSON.parse(fs.readFileSync(filePath, "utf8")) as T) : undefined;
}

async function adapterEdges(fixtureDir: string): Promise<{ edges: AdapterEdge[]; unresolved: Report["unresolved"] }> {
  const workDir = copyFixture(fixtureDir, "oracle-compare-");
  try {
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: fixtureGlobs() });
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

function buildReport(fixtureDir: string, compiler: OracleEdges, handVerified: HandVerifiedEdges | undefined, adapter: AdapterEdge[], unresolved: Report["unresolved"]): Report {
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
    report.handVerified = {
      found:   handVerified.edges.filter((edge) => adapterKeys.has(`${edge.from}|${edge.to}`)),
      missing: handVerified.edges.filter((edge) => !adapterKeys.has(`${edge.from}|${edge.to}`))
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
    lines.push("");
    lines.push(`Hand-verified edges: ${report.handVerified.found.length} found, ${report.handVerified.missing.length} missing`);
    for (const edge of report.handVerified.missing) {
      lines.push(`  missing  ${edge.from} -> ${edge.to}${edge.remote ? "  (remote)" : ""}`);
      lines.push(`           via ${edge.via}`);
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
  const compiler = readJson<OracleEdges>(path.join(fixtureDir, "expected", "compiler-edges.json"));
  if (!compiler) {
    throw new Error(`no expected/compiler-edges.json under ${fixtureDir}; run oracle:index first`);
  }
  const handVerified = readJson<HandVerifiedEdges>(path.join(fixtureDir, "expected", "hand-verified-edges.json"));
  const { edges, unresolved } = await adapterEdges(fixtureDir);
  return buildReport(fixtureDir, compiler, handVerified, edges, unresolved);
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
