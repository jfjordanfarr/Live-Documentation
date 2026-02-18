/**
 * Benchmark fixture manifest: schema, loader, and integrity verification.
 *
 * Created 2025-11-02 (commit `d86df63`) to drive the clone-based fixture
 * materialisation pipeline. Extended 2025-12-14 for cross-platform integrity
 * hashing (CRLF normalisation), 2026-01-14 for Rosetta Stone fixtures +
 * per-fixture threshold overrides, and 2026-01-15 for the JSON adapter
 * path migration.
 *
 * The canonical manifest file lives at
 * `tests/integration/benchmarks/fixtures/fixtures.manifest.json`.
 *
 * @module
 */

import { glob } from "glob";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import * as path from "node:path";

/** Optional human-written blurb attached to a benchmark fixture definition. */
export interface FixtureSummary {
  scope?: string;
  intent?: string;
  notes?: string[];
}

/**
 * Source-of-truth metadata describing where a fixture's source code
 * was obtained from (vendor repo, synthetic generation, etc.).
 */
export interface FixtureProvenance {
  kind: "vendor" | "synthetic" | "generated";
  repository?: string;
  commit?: string;
  license?: string;
  url?: string;
  retrievedAt?: string;
  ref?: string;
}

/**
 * Declarative integrity specification for a fixture.
 *
 * Used by {@link computeIntegrityDigest} to hash the fixture's source
 * files and compare against the recorded `rootHash`. Files are resolved
 * via either an explicit `paths` list or a `fileSet` glob specification.
 */
export interface FixtureIntegritySpec {
  algorithm: "sha256";
  generatedAt?: string;
  basePath?: string;
  paths?: string[];
  rootHash: string;
  fileSet?: FixtureFileSetSpec;
  fileCount?: number;
}

/**
 * Per-fixture precision/recall threshold overrides.
 * Allows stress-test fixtures to have lower thresholds than the global defaults.
 */
export interface FixtureThresholds {
  /** Minimum acceptable precision (0.0 to 1.0). If omitted, uses global threshold. */
  precision?: number;
  /** Minimum acceptable recall (0.0 to 1.0). If omitted, uses global threshold. */
  recall?: number;
}

/**
 * Oracle configuration for expected.json regeneration and validation.
 */
export interface OracleConfig {
  /** Type of oracle (e.g., "typescript", "python") */
  kind: string;
  /** Optional root path within fixture for oracle analysis */
  root?: string;
  /** Full fixture-relative path to manual overrides JSON (e.g., "typescript/basic/oracle.overrides.json") */
  manualOverrides?: string;
}

/**
 * Top-level definition for a single benchmark fixture in the manifest.
 * Carries identity, paths, oracle config, integrity spec, and optional
 * threshold overrides.
 */
export interface BenchmarkFixtureDefinition {
  /** Unique identifier for this fixture (e.g., "ts-basic", "go-rosetta") */
  id: string;
  /** Human-readable label for reporting */
  label?: string;
  /** Programming language of the fixture (e.g., "typescript", "go") */
  language?: string;
  /** Fixture-relative path within FIXTURE_ROOT (e.g., "typescript/basic") */
  path: string;
  /** Benchmark modes this fixture participates in */
  modes?: string[];
  /** Full fixture-relative path to expected.json (e.g., "typescript/basic/expected.json") */
  expected: string;
  /** Full fixture-relative path to inferred.json (e.g., "typescript/basic/inferred.json") */
  inferred: string;
  summary?: FixtureSummary;
  provenance?: FixtureProvenance;
  integrity?: FixtureIntegritySpec;
  materialization?: FixtureMaterialization;
  /** Oracle configuration for expected.json regeneration. */
  oracle?: OracleConfig;
  /** Per-fixture threshold overrides. Allows stress-test fixtures to pass with lower metrics. */
  thresholds?: FixtureThresholds;
}

/**
 * Return type of {@link computeIntegrityDigest}, carrying the per-file
 * hashes and the aggregate root hash for a single fixture.
 */
export interface IntegrityDigest {
  algorithm: "sha256";
  rootHash: string;
  fileCount: number;
  files: Array<{ path: string; hash: string }>;
}

/**
 * Glob-based file selection for integrity hashing and materialisation.
 * Used by {@link FixtureIntegritySpec} and {@link FixtureGitMaterialization}.
 */
export interface FixtureFileSetSpec {
  include: string[];
  exclude?: string[];
}

/**
 * Discriminated union describing how a fixture's source code is
 * materialised on disk — either already present in the workspace
 * (`"workspace"`) or cloned from a git repository (`"git"`).
 */
export type FixtureMaterialization =
  | {
      kind: "workspace";
      workspacePath?: string;
    }
  | FixtureGitMaterialization;

/**
 * Git-based materialisation spec used by `fixtureMaterializer.ts`
 * to clone, sparse-checkout, and pin a vendor fixture at a specific
 * commit.
 */
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

/**
 * Path segments from repo root to the canonical fixture manifest file.
 * Joined with `path.join` by {@link loadBenchmarkManifest} and consumers
 * like `regenerate-benchmarks.ts`.
 */
export const BENCHMARK_MANIFEST_SEGMENTS = [
  "tests",
  "integration",
  "benchmarks",
  "fixtures",
  "fixtures.manifest.json"
] as const;

/**
 * Loads and parses the benchmark fixture manifest from disk.
 *
 * Accepts either a bare JSON array or an object with a `fixtures` key
 * (the latter was used in an earlier manifest schema revision).
 */
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

/**
 * Computes a deterministic SHA-256 integrity digest for a fixture.
 *
 * Source files are resolved from the fixture's {@link FixtureIntegritySpec}
 * (via `fileSet` globs or explicit `paths`). Line endings are normalised
 * to LF before hashing to ensure cross-platform reproducibility
 * (fix added 2025-12-14, commit `bf1c7ca`).
 *
 * @returns An {@link IntegrityDigest} whose `rootHash` can be compared
 *          against the manifest's declared `integrity.rootHash`.
 */
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

/** Normalises backslashes to forward slashes for platform-agnostic path comparison. */
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
