import { glob } from "glob";
import * as fs from "node:fs/promises";
import path from "node:path";

import { normalizeWorkspacePath } from "@live-documentation/shared/tooling/pathUtils";

/**
 * Classification of how a piece of evidence was gathered.
 *
 * - `"unit"` / `"integration"` / `"benchmark"` — automated test suites
 * - `"manual"` — evidence waiver supplied by a human reviewer
 */
export type EvidenceKind = "unit" | "integration" | "benchmark" | "manual";

/**
 * A single coverage metric (e.g. statement coverage) expressed as
 * a numerator/denominator pair and a pre-computed percentage.
 */
export interface CoverageRatio {
  covered: number;
  total: number;
  percent: number;
}

/**
 * Aggregated code-coverage metrics from a test provider's
 * `coverage-summary.json` output (Istanbul/v8 format).
 */
export interface CoverageSummary {
  statements?: CoverageRatio;
  branches?: CoverageRatio;
  functions?: CoverageRatio;
  lines?: CoverageRatio;
}

/**
 * A single piece of evidence that an implementation file is tested.
 *
 * Populated from the targets manifest (`coverage/live-docs/targets.json`),
 * from coverage-summary files, or from manual evidence waivers.
 */
export interface ImplementationEvidenceItem {
  suite: string;
  kind: EvidenceKind;
  testPath?: string;
  summary?: CoverageSummary;
  notes?: string;
}

/**
 * Evidence record for a test file, listing the implementation files
 * it targets and any supporting fixtures it depends on.
 */
export interface TestEvidenceItem {
  suite: string;
  kind: EvidenceKind;
  targets: string[];
  fixtures: string[];
}

/**
 * Complete workspace-wide evidence snapshot assembled from coverage summaries,
 * target manifests, and evidence waivers.
 *
 * Consumed by the Live Docs generator to populate `Observed Evidence` sections
 * on implementation-archetype docs and `Targets` / `Supporting Fixtures` sections
 * on test-archetype docs. Currently feeds 67+ Live Doc files in this workspace.
 */
export interface EvidenceSnapshot {
  implementationEvidence: Map<string, ImplementationEvidenceItem[]>;
  testEvidence: Map<string, TestEvidenceItem>;
}

interface EvidenceLogger {
  info?(message: string): void;
  warn?(message: string): void;
}

interface LoadEvidenceOptions {
  workspaceRoot: string;
  logger?: EvidenceLogger;
}

/**
 * Assembles a workspace-wide evidence snapshot by loading:
 *
 * 1. **Coverage summaries** — Istanbul/v8 `coverage-summary.json` files under `coverage/`
 * 2. **Targets manifest** — `targets.json` mapping test files to the implementations they verify
 * 3. **Evidence waivers** — `evidence-waivers.json` for manually-reviewed files that lack automated tests
 *
 * The snapshot is consumed once per `generateLiveDocs()` invocation.
 *
 * @param options - Workspace root and optional logger for diagnostic messages.
 */
export async function loadEvidenceSnapshot(
  options: LoadEvidenceOptions
): Promise<EvidenceSnapshot> {
  const coverageSummaries = await loadCoverageSummaries(options);
  const targetsManifest = await loadTargetsManifest(options);
  const waivers = await loadEvidenceWaivers(options);

  const implementationEvidence = new Map<string, ImplementationEvidenceItem[]>();
  const testEvidence = new Map<string, TestEvidenceItem>();

  if (targetsManifest) {
    for (const suiteEntry of targetsManifest.suites) {
      for (const test of suiteEntry.tests) {
        const normalizedTestPath = normalizeWorkspacePath(test.path);
        const evidenceItem: TestEvidenceItem = {
          suite: suiteEntry.suite,
          kind: suiteEntry.kind,
          targets: test.targets.map((target) => normalizeWorkspacePath(target)),
          fixtures: (test.fixtures ?? []).map((fixture) => normalizeWorkspacePath(fixture))
        };
        testEvidence.set(normalizedTestPath, evidenceItem);

        for (const rawTarget of test.targets) {
          const target = normalizeWorkspacePath(rawTarget);
          const list = implementationEvidence.get(target) ?? [];
          list.push({
            suite: suiteEntry.suite,
            kind: suiteEntry.kind,
            testPath: normalizedTestPath,
            summary: lookupCoverageSummary(coverageSummaries, options.workspaceRoot, target)
          });
          implementationEvidence.set(target, list);
        }
      }
    }
  }

  // If we have coverage summaries for implementations that are not referenced in the manifest,
  // still record a synthetic entry so Observed Evidence reflects available coverage.
  for (const [normalizedPath, summary] of coverageSummaries.entries()) {
    const existing = implementationEvidence.get(normalizedPath);
    if (existing && existing.length > 0) {
      continue;
    }
    if (!summary) {
      continue;
    }
    implementationEvidence.set(normalizedPath, [
      {
        suite: summary.provider,
        kind: summary.kind,
        summary: summary.coverage
      }
    ]);
  }

  for (const [normalizedPath, entries] of waivers.entries()) {
    const list = implementationEvidence.get(normalizedPath) ?? [];
    list.push(...entries);
    implementationEvidence.set(normalizedPath, list);
  }

  return {
    implementationEvidence,
    testEvidence
  };
}

interface TargetsManifest {
  version: number;
  suites: Array<{
    suite: string;
    kind: EvidenceKind;
    tests: Array<{
      path: string;
      targets: string[];
      fixtures?: string[];
    }>;
  }>;
}

interface CoverageEntry {
  coverage: CoverageSummary;
  provider: string;
  kind: EvidenceKind;
}

async function loadTargetsManifest(
  options: LoadEvidenceOptions
): Promise<TargetsManifest | undefined> {
  const candidates = [
    path.join(options.workspaceRoot, "coverage", "live-docs", "targets.json"),
    path.join(options.workspaceRoot, "data", "live-docs", "targets.json")
  ];

  for (const manifestPath of candidates) {
    try {
      const raw = await fs.readFile(manifestPath, "utf8");
      const parsed = JSON.parse(raw) as TargetsManifest;
      if (!Array.isArray(parsed.suites)) {
        throw new Error("targets manifest missing suites array");
      }
      return parsed;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        continue;
      }
      options.logger?.warn?.(
        `Live Docs evidence: failed to read targets manifest (${manifestPath}) — ${(error as Error).message}`
      );
    }
  }

  options.logger?.info?.(
    "Live Docs evidence: targets manifest not found (searched coverage/live-docs/targets.json, data/live-docs/targets.json)"
  );
  return undefined;
}

interface EvidenceWaiverFile {
  version: number;
  waivers: Array<{
    sourcePath: string;
    reason: string;
    suite?: string;
  }>;
}

async function loadEvidenceWaivers(
  options: LoadEvidenceOptions
): Promise<Map<string, ImplementationEvidenceItem[]>> {
  const waiversPath = path.join(options.workspaceRoot, "data", "live-docs", "evidence-waivers.json");
  const map = new Map<string, ImplementationEvidenceItem[]>();

  try {
    const raw = await fs.readFile(waiversPath, "utf8");
    const parsed = JSON.parse(raw) as EvidenceWaiverFile;
    if (!Array.isArray(parsed.waivers)) {
      throw new Error("waivers file missing waivers array");
    }

    for (const entry of parsed.waivers) {
      if (!entry || typeof entry.sourcePath !== "string" || typeof entry.reason !== "string") {
        continue;
      }

      const normalizedPath = normalizeWorkspacePath(entry.sourcePath);
      const records = map.get(normalizedPath) ?? [];
      records.push({
        suite: entry.suite ?? "Manual Review",
        kind: "manual",
        notes: entry.reason
      });
      map.set(normalizedPath, records);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      options.logger?.warn?.(
        `Live Docs evidence: failed to read waivers manifest — ${(error as Error).message}`
      );
    }
  }

  return map;
}

async function loadCoverageSummaries(
  options: LoadEvidenceOptions
): Promise<Map<string, CoverageEntry | undefined>> {
  const map = new Map<string, CoverageEntry | undefined>();
  const summaryGlobs = ["coverage/**/coverage-summary.json", "coverage/coverage-summary.json"];

  const seen = new Set<string>();
  for (const pattern of summaryGlobs) {
    const matches = await glob(pattern, {
      cwd: options.workspaceRoot,
      absolute: true,
      nodir: true,
      windowsPathsNoEscape: true
    });
    for (const match of matches) {
      if (seen.has(match)) {
        continue;
      }
      seen.add(match);
      await ingestCoverageSummary(map, match, options);
    }
  }

  return map;
}

async function ingestCoverageSummary(
  accumulator: Map<string, CoverageEntry | undefined>,
  absolutePath: string,
  options: LoadEvidenceOptions
): Promise<void> {
  try {
    const raw = await fs.readFile(absolutePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const files = Object.entries(parsed).filter(([key]) => key !== "total");
    const provider = inferProviderLabel(absolutePath);
    const kind = inferEvidenceKind(provider);

    for (const [filePath, summary] of files) {
      if (!isCoverageSummaryRecord(summary)) {
        continue;
      }
      const normalized = normalizeCoveragePath(options.workspaceRoot, filePath);
      const coverage = normalizeCoverageSummary(summary);
      const existing = accumulator.get(normalized);
      if (existing) {
        accumulator.set(normalized, mergeCoverageEntries(existing, {
          provider,
          kind,
          coverage
        }));
      } else {
        accumulator.set(normalized, {
          provider,
          kind,
          coverage
        });
      }
    }
  } catch (error) {
    options.logger?.warn?.(
      `Live Docs evidence: failed to parse coverage summary ${absolutePath} — ${(error as Error).message}`
    );
  }
}

function normalizeCoveragePath(workspaceRoot: string, filePath: string): string {
  const absoluteCandidate = path.isAbsolute(filePath)
    ? filePath
    : path.join(workspaceRoot, filePath);
  const relative = path.relative(workspaceRoot, absoluteCandidate);
  return normalizeWorkspacePath(relative);
}

function mergeCoverageEntries(
  existing: CoverageEntry,
  incoming: CoverageEntry
): CoverageEntry {
  return {
    provider: existing.provider,
    kind: existing.kind,
    coverage: mergeCoverageSummaries(existing.coverage, incoming.coverage)
  };
}

function mergeCoverageSummaries(
  left: CoverageSummary,
  right: CoverageSummary
): CoverageSummary {
  return {
    statements: mergeCoverageRatio(left.statements, right.statements),
    branches: mergeCoverageRatio(left.branches, right.branches),
    functions: mergeCoverageRatio(left.functions, right.functions),
    lines: mergeCoverageRatio(left.lines, right.lines)
  };
}

function mergeCoverageRatio(
  left?: CoverageRatio,
  right?: CoverageRatio
): CoverageRatio | undefined {
  if (!left) return right;
  if (!right) return left;
  const total = Math.max(left.total, right.total);
  const covered = Math.max(left.covered, right.covered);
  const percent = total === 0 ? 100 : (covered / total) * 100;
  return {
    total,
    covered,
    percent
  };
}

function lookupCoverageSummary(
  summaries: Map<string, CoverageEntry | undefined>,
  workspaceRoot: string,
  normalizedPath: string
): CoverageSummary | undefined {
  const entry = summaries.get(normalizedPath);
  if (entry) {
    return entry.coverage;
  }

  const absolute = path.join(workspaceRoot, normalizedPath);
  const fallbackKey = normalizeWorkspacePath(absolute);
  return summaries.get(fallbackKey)?.coverage;
}

function normalizeCoverageSummary(summary: CoverageSummaryRecord): CoverageSummary {
  return {
    statements: normalizeCoverageRatio(summary.statements),
    branches: normalizeCoverageRatio(summary.branches),
    functions: normalizeCoverageRatio(summary.functions),
    lines: normalizeCoverageRatio(summary.lines)
  };
}

function normalizeCoverageRatio(record?: CoverageRatioRecord): CoverageRatio | undefined {
  if (!record) {
    return undefined;
  }
  const total = typeof record.total === "number" ? record.total : 0;
  const covered = typeof record.covered === "number" ? record.covered : 0;
  const percent = total === 0 ? 0 : (covered / total) * 100;
  return {
    total,
    covered,
    percent
  };
}

function inferProviderLabel(summaryPath: string): string {
  const lower = summaryPath.toLowerCase();
  if (lower.includes("vitest")) {
    return "Vitest";
  }
  if (lower.includes("pytest")) {
    return "pytest";
  }
  if (lower.includes("dotnet")) {
    return "dotnet";
  }
  return "Tests";
}

function inferEvidenceKind(provider: string): EvidenceKind {
  const lower = provider.toLowerCase();
  if (lower.includes("benchmark")) {
    return "benchmark";
  }
  if (lower.includes("integration")) {
    return "integration";
  }
  return "unit";
}

interface CoverageSummaryRecord {
  statements?: CoverageRatioRecord;
  branches?: CoverageRatioRecord;
  functions?: CoverageRatioRecord;
  lines?: CoverageRatioRecord;
}

interface CoverageRatioRecord {
  total?: number;
  covered?: number;
}

function isCoverageSummaryRecord(value: unknown): value is CoverageSummaryRecord {
  if (!value || typeof value !== "object") {
    return false;
  }
  return true;
}