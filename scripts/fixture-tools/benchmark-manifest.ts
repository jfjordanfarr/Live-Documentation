import { glob } from "glob";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import * as path from "node:path";

export interface FixtureSummary {
  scope?: string;
  intent?: string;
  notes?: string[];
}

export interface FixtureProvenance {
  kind: "vendor" | "synthetic" | "generated";
  repository?: string;
  commit?: string;
  license?: string;
  url?: string;
  retrievedAt?: string;
  ref?: string;
}

export interface FixtureIntegritySpec {
  algorithm: "sha256";
  generatedAt?: string;
  basePath?: string;
  paths?: string[];
  rootHash: string;
  fileSet?: FixtureFileSetSpec;
  fileCount?: number;
}

export interface BenchmarkFixtureDefinition {
  id: string;
  label?: string;
  language?: string;
  path: string;
  modes?: string[];
  expected: string;
  inferred: string;
  summary?: FixtureSummary;
  provenance?: FixtureProvenance;
  integrity?: FixtureIntegritySpec;
  materialization?: FixtureMaterialization;
}

export interface IntegrityDigest {
  algorithm: "sha256";
  rootHash: string;
  fileCount: number;
  files: Array<{ path: string; hash: string }>;
}

export interface FixtureFileSetSpec {
  include: string[];
  exclude?: string[];
}

export type FixtureMaterialization =
  | {
      kind: "workspace";
      workspacePath?: string;
    }
  | FixtureGitMaterialization;

export interface FixtureGitMaterialization {
  kind: "git";
  repository: string;
  remote?: string;
  ref?: string;
  commit: string;
  subdirectory?: string;
  sparsePaths?: string[];
  include: string[];
  exclude?: string[];
  entryPoints?: string[];
}

export const BENCHMARK_MANIFEST_SEGMENTS = [
  "tests",
  "integration",
  "benchmarks",
  "fixtures",
  "fixtures.manifest.json"
] as const;

export async function loadBenchmarkManifest(repoRoot: string): Promise<BenchmarkFixtureDefinition[]> {
  const manifestPath = path.join(repoRoot, ...BENCHMARK_MANIFEST_SEGMENTS);
  const raw = await fs.readFile(manifestPath, "utf8");
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return parsed as BenchmarkFixtureDefinition[];
  }

  if (parsed && Array.isArray((parsed as { fixtures?: unknown }).fixtures)) {
    return (parsed as { fixtures: BenchmarkFixtureDefinition[] }).fixtures;
  }

  throw new Error("Benchmark fixture manifest must be an array");
}

export async function computeIntegrityDigest(
  repoRoot: string,
  fixture: BenchmarkFixtureDefinition,
  workspaceRootOverride?: string
): Promise<IntegrityDigest> {
  const spec = fixture.integrity;
  if (!spec) {
    throw new Error(`Fixture ${fixture.id} does not declare integrity metadata.`);
  }
  if (spec.algorithm !== "sha256") {
    throw new Error(`Unsupported integrity algorithm '${spec.algorithm}' for fixture ${fixture.id}.`);
  }

  const fixtureRoot = workspaceRootOverride
    ? path.resolve(workspaceRootOverride)
    : path.join(
        repoRoot,
        "tests",
        "integration",
        "benchmarks",
        "fixtures",
        fixture.path
      );

  const basePath = spec.basePath ? normalizeRelative(spec.basePath) : ".";
  const normalizedPaths = await resolveIntegrityPaths(fixtureRoot, basePath, spec);
  const fileHashes: Array<{ path: string; hash: string }> = [];

  for (const relPath of normalizedPaths) {
    const filePath = path.join(fixtureRoot, basePath, relPath);
    let content = await fs.readFile(filePath);
    // Normalize line endings to LF for platform-independent hashing
    content = Buffer.from(content.toString("utf8").replace(/\r\n/g, "\n"));
    const digest = createHash("sha256").update(content).digest("hex");
    fileHashes.push({ path: relPath, hash: digest });
  }

  const aggregate = createHash("sha256");
  const sorted = [...fileHashes].sort((a, b) => a.path.localeCompare(b.path));
  for (const { path: relPath, hash } of sorted) {
    aggregate.update(`${relPath}:${hash}\n`);
  }

  if (typeof spec.fileCount === "number" && spec.fileCount !== fileHashes.length) {
    throw new Error(
      `Integrity file count mismatch for fixture ${fixture.id}. Expected ${spec.fileCount} but resolved ${fileHashes.length}.`
    );
  }

  return {
    algorithm: spec.algorithm,
    rootHash: aggregate.digest("hex"),
    fileCount: fileHashes.length,
    files: fileHashes
  };
}

export function normalizeRelative(candidate: string): string {
  return candidate.replace(/\\/g, "/");
}

function normalizePaths(paths: string[]): string[] {
  const seen = new Set<string>();
  return paths.map(pathCandidate => {
    const normalized = normalizeRelative(pathCandidate);
    if (seen.has(normalized)) {
      throw new Error(`Duplicate integrity path detected: ${normalized}`);
    }
    seen.add(normalized);
    return normalized;
  });
}

async function resolveIntegrityPaths(
  fixtureRoot: string,
  basePath: string,
  spec: FixtureIntegritySpec
): Promise<string[]> {
  if (spec.fileSet) {
    const include = spec.fileSet.include.map(pattern => normalizeRelative(pattern));
    const exclude = (spec.fileSet.exclude ?? []).map(pattern => normalizeRelative(pattern));
    const cwd = path.join(fixtureRoot, basePath);
    const matches = await glob(include, {
      cwd,
      ignore: exclude,
      nodir: true,
      dot: false,
      windowsPathsNoEscape: true
    });
    return normalizePaths(matches.sort((a, b) => a.localeCompare(b)));
  }

  if (spec.paths && spec.paths.length > 0) {
    return normalizePaths(spec.paths);
  }

  throw new Error(
    `Integrity spec for fixture does not declare fileSet or explicit paths.`
  );
}
