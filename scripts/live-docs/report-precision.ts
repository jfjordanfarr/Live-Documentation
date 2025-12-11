#!/usr/bin/env node
import { glob } from "glob";
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  LIVE_DOCUMENTATION_FILE_EXTENSION,
  normalizeLiveDocumentationConfig
} from "@live-documentation/shared/config/liveDocumentationConfig";
import { parseLiveDocMarkdown } from "@live-documentation/shared/live-docs/parse";

import { __testUtils } from "../../packages/server/src/features/live-docs/generator";

const {
  collectExportedSymbols,
  collectDependencies,
  inferScriptKind
} = __testUtils;

const MIN_SYMBOL_PRECISION = 0.9;
const MIN_DEPENDENCY_RECALL = 0.8;
// Per-file floor: targets internal modules where symbol extraction may
// incorrectly mark non-exported helpers as public symbols.
// Set at 75% to surface extraction bugs for remediation.
const MIN_PER_FILE_SYMBOL_PRECISION = 0.75;

interface ComparisonMetrics {
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
  f1: number;
}

interface FileMetrics {
  sourcePath: string;
  symbols: ComparisonMetrics;
  dependencies: ComparisonMetrics;
}

interface Report {
  generatedAt: string;
  workspaceRoot: string;
  summary: {
    symbols: ComparisonMetrics;
    dependencies: ComparisonMetrics;
  };
  files: FileMetrics[];
  skipped: string[];
}

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const config = normalizeLiveDocumentationConfig({
    ...DEFAULT_LIVE_DOCUMENTATION_CONFIG
  });

  const docGlob = path.join(
    config.root,
    config.baseLayer,
    "**",
    `*${LIVE_DOCUMENTATION_FILE_EXTENSION}`
  );
  const docs = await glob(docGlob, {
    cwd: workspaceRoot,
    absolute: true,
    nodir: true,
    windowsPathsNoEscape: true
  });

  if (docs.length === 0) {
    console.error("No Live Docs found; generate them before running the precision report.");
    process.exit(1);
    return;
  }

  const files: FileMetrics[] = [];
  const skipped: string[] = [];

  let symbolsAggregate = initializeMetrics();
  let dependenciesAggregate = initializeMetrics();

  for (const docAbsolutePath of docs) {
    const content = await fs.readFile(docAbsolutePath, "utf8");
    const parsedDoc = parseLiveDocMarkdown(content, docAbsolutePath, workspaceRoot, config);
    if (!parsedDoc) {
      skipped.push(relativize(workspaceRoot, docAbsolutePath));
      continue;
    }

    const sourceAbsolutePath = path.resolve(workspaceRoot, parsedDoc.sourcePath);
    if (!SUPPORTED_EXTENSIONS.has(path.extname(sourceAbsolutePath))) {
      skipped.push(parsedDoc.sourcePath);
      continue;
    }

    let sourceContent: string;
    try {
      sourceContent = await fs.readFile(sourceAbsolutePath, "utf8");
    } catch {
      skipped.push(parsedDoc.sourcePath);
      continue;
    }

    const scriptKind = inferScriptKind(path.extname(sourceAbsolutePath).toLowerCase());
    const sourceFile = ts.createSourceFile(
      sourceAbsolutePath,
      sourceContent,
      ts.ScriptTarget.Latest,
      true,
      scriptKind
    );

    const analyzerSymbols = new Set(
      collectExportedSymbols(sourceFile).map((entry) => entry.name)
    );

    const analyzerDependenciesRaw = await collectDependencies({
      sourceFile,
      absolutePath: sourceAbsolutePath,
      workspaceRoot
    });
    const analyzerDependencies = new Set(
      analyzerDependenciesRaw.map((entry) => entry.resolvedPath ?? entry.specifier)
    );

    const docSymbols = new Set(parsedDoc.publicSymbols);
    const docDependencies = new Set(
      parsedDoc.dependencies.map((entry) => entry.codePath ?? entry.raw)
    );

    const symbolsMetrics = compareSets(analyzerSymbols, docSymbols);
    const dependencyMetrics = compareSets(analyzerDependencies, docDependencies);

    files.push({
      sourcePath: parsedDoc.sourcePath,
      symbols: symbolsMetrics,
      dependencies: dependencyMetrics
    });

    symbolsAggregate = accumulateMetrics(symbolsAggregate, symbolsMetrics);
    dependenciesAggregate = accumulateMetrics(dependenciesAggregate, dependencyMetrics);
  }

  const summarySymbols = finalizeMetrics(symbolsAggregate);
  const summaryDependencies = finalizeMetrics(dependenciesAggregate);

  const report: Report = {
    generatedAt: new Date().toISOString(),
    workspaceRoot,
    summary: {
      symbols: summarySymbols,
      dependencies: summaryDependencies
    },
    files: files.map((entry) => ({
      sourcePath: entry.sourcePath,
      symbols: finalizeMetrics(entry.symbols),
      dependencies: finalizeMetrics(entry.dependencies)
    })),
    skipped
  };

  const outputPath = path.join(
    workspaceRoot,
    "reports",
    "benchmarks",
    "live-docs",
    "precision.json"
  );
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Live Docs precision report written to", relativize(workspaceRoot, outputPath));
  console.log(
    `Symbols — precision ${(summarySymbols.precision * 100).toFixed(2)}%, recall ${(summarySymbols.recall * 100).toFixed(2)}%`
  );
  console.log(
    `Dependencies — precision ${(summaryDependencies.precision * 100).toFixed(2)}%, recall ${(summaryDependencies.recall * 100).toFixed(2)}%`
  );

  const thresholdFailures: string[] = [];
  if (summarySymbols.precision < MIN_SYMBOL_PRECISION) {
    thresholdFailures.push(
      `Symbol precision ${summarySymbols.precision.toFixed(3)} fell below ${MIN_SYMBOL_PRECISION.toFixed(3)}`
    );
  }
  if (summaryDependencies.recall < MIN_DEPENDENCY_RECALL) {
    thresholdFailures.push(
      `Dependency recall ${summaryDependencies.recall.toFixed(3)} fell below ${MIN_DEPENDENCY_RECALL.toFixed(3)}`
    );
  }

  // Per-file precision floor: flag files with non-trivial symbol counts that fall below threshold
  const perFileFailures = report.files
    .filter((file) => {
      // Only enforce threshold when the file has symbols to measure (TP + FP + FN > 0)
      const totalRelevant = file.symbols.tp + file.symbols.fp + file.symbols.fn;
      return totalRelevant > 0 && file.symbols.precision < MIN_PER_FILE_SYMBOL_PRECISION;
    })
    .map((file) => `${file.sourcePath}: ${(file.symbols.precision * 100).toFixed(1)}%`);

  if (perFileFailures.length > 0) {
    thresholdFailures.push(
      `${perFileFailures.length} file(s) fell below per-file symbol precision floor (${(MIN_PER_FILE_SYMBOL_PRECISION * 100).toFixed(0)}%):\n    ${perFileFailures.slice(0, 10).join("\n    ")}${perFileFailures.length > 10 ? `\n    ... and ${perFileFailures.length - 10} more` : ""}`
    );
  }

  if (thresholdFailures.length > 0) {
    console.error("\nLive Docs precision thresholds not met:");
    for (const failure of thresholdFailures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }
}

const SUPPORTED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs"
]);

function initializeMetrics(): ComparisonMetrics {
  return {
    tp: 0,
    fp: 0,
    fn: 0,
    precision: 0,
    recall: 0,
    f1: 0
  };
}

function compareSets(expected: Set<string>, actual: Set<string>): ComparisonMetrics {
  const tp = new Set<string>();
  const fp = new Set<string>();
  const fn = new Set<string>();

  for (const value of actual) {
    if (expected.has(value)) {
      tp.add(value);
    } else {
      fp.add(value);
    }
  }

  for (const value of expected) {
    if (!actual.has(value)) {
      fn.add(value);
    }
  }

  return {
    tp: tp.size,
    fp: fp.size,
    fn: fn.size,
    precision: 0,
    recall: 0,
    f1: 0
  };
}

function accumulateMetrics(target: ComparisonMetrics, delta: ComparisonMetrics): ComparisonMetrics {
  target.tp += delta.tp;
  target.fp += delta.fp;
  target.fn += delta.fn;
  return target;
}

function finalizeMetrics(metrics: ComparisonMetrics): ComparisonMetrics {
  const precision = metrics.tp + metrics.fp === 0 ? 1 : metrics.tp / (metrics.tp + metrics.fp);
  const recall = metrics.tp + metrics.fn === 0 ? 1 : metrics.tp / (metrics.tp + metrics.fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return {
    tp: metrics.tp,
    fp: metrics.fp,
    fn: metrics.fn,
    precision,
    recall,
    f1
  };
}

function relativize(root: string, absolute: string): string {
  return path.relative(root, absolute).split(path.sep).join("/");
}

main().catch((error) => {
  console.error("live-docs:report failed");
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
});