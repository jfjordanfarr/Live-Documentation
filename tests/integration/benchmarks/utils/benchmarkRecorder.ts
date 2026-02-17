import { promises as fs } from "node:fs";
import * as path from "node:path";

import { resolveRepoPath } from "./repoPaths";

const TMP_OUTPUT_ROOT = resolveRepoPath("AI-Agent-Workspace", "tmp", "benchmarks");
const VERSIONED_OUTPUT_ROOT = resolveRepoPath("reports", "benchmarks");

export interface EdgeRecord {
  source: string;
  target: string;
  relation?: string;
}

export interface FixtureTotalsSummary {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
}

export interface FixtureDiffReport {
  id: string;
  label?: string;
  language?: string;
  totals: FixtureTotalsSummary;
  truePositives: EdgeRecord[];
  falsePositives: EdgeRecord[];
  falseNegatives: EdgeRecord[];
}

interface BenchmarkResultOptions {
  mode?: string | null;
}

interface FixtureReportOptions {
  mode?: string | null;
  includePassing?: boolean;
}

export async function writeBenchmarkResult(
  name: string,
  payload: unknown,
  options?: BenchmarkResultOptions
): Promise<void> {
  const normalizedMode = normalizeMode(options?.mode ?? inferMode(payload));
  const sluggedMode = slugifyMode(normalizedMode);
  const tmpOutputDir = resolveOutputDir(process.env.BENCHMARK_OUTPUT_DIR ?? TMP_OUTPUT_ROOT);
  const versionedDir = path.join(VERSIONED_OUTPUT_ROOT, sluggedMode);
  const fileBaseName = sluggedMode === "default" ? `${name}.json` : `${name}.${sluggedMode}.json`;
  const tmpFilePath = path.join(tmpOutputDir, fileBaseName);
  const versionedFilePath = path.join(versionedDir, `${name}.json`);

  const record = {
    benchmark: name,
    mode: normalizedMode,
    recordedAt: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    data: payload
  };

  const content = JSON.stringify(record, null, 2);

  await fs.mkdir(tmpOutputDir, { recursive: true });
  await fs.writeFile(tmpFilePath, content, "utf8");

  await fs.mkdir(versionedDir, { recursive: true });
  await fs.writeFile(versionedFilePath, content, "utf8");
}

export async function writeBenchmarkFixtureReport(
  name: string,
  fixtures: FixtureDiffReport[],
  options?: FixtureReportOptions
): Promise<void> {
  const normalizedMode = normalizeMode(options?.mode);
  const sluggedMode = slugifyMode(normalizedMode);
  const baseDir = path.join(TMP_OUTPUT_ROOT, name, sluggedMode);
  const includePassing = options?.includePassing ?? true;

  await fs.rm(baseDir, { recursive: true, force: true });
  await fs.mkdir(baseDir, { recursive: true });

  const summary = {
    benchmark: name,
    mode: normalizedMode,
    generatedAt: new Date().toISOString(),
    fixtures: [] as Array<{
      id: string;
      label?: string;
      language?: string;
      totals: FixtureTotalsSummary;
      hasFailures: boolean;
      artifact: string;
    }>
  };

  for (const fixture of fixtures) {
    const hasFailures = fixture.falsePositives.length > 0 || fixture.falseNegatives.length > 0;
    if (!includePassing && !hasFailures) {
      continue;
    }

    const fixturePath = path.join(baseDir, `${fixture.id}.json`);
    const artifactRecord = {
      benchmark: name,
      mode: normalizedMode,
      fixture: fixture.id,
      label: fixture.label,
      language: fixture.language,
      totals: fixture.totals,
      hasFailures,
      truePositives: fixture.truePositives,
      falsePositives: fixture.falsePositives,
      falseNegatives: fixture.falseNegatives
    };

    await fs.writeFile(fixturePath, JSON.stringify(artifactRecord, null, 2), "utf8");

    summary.fixtures.push({
      id: fixture.id,
      label: fixture.label,
      language: fixture.language,
      totals: fixture.totals,
      hasFailures,
      artifact: path.basename(fixturePath)
    });
  }

  const indexPath = path.join(baseDir, "index.json");
  await fs.writeFile(indexPath, JSON.stringify(summary, null, 2), "utf8");
}

function resolveOutputDir(candidate: string): string {
  return path.resolve(candidate);
}

function normalizeMode(candidate?: string | null): string | null {
  if (!candidate) {
    return null;
  }
  const normalized = candidate.trim().toLowerCase();
  return normalized.length === 0 ? null : normalized;
}

function slugifyMode(mode?: string | null): string {
  const normalized = normalizeMode(mode);
  if (!normalized) {
    return "default";
  }
  return normalized.replace(/[^a-z0-9]+/g, "-");
}

function inferMode(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const value = (payload as { mode?: unknown }).mode;
    if (typeof value === "string") {
      return normalizeMode(value);
    }
  }
  return null;
}
