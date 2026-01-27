import { strict as assert } from "node:assert";
import { existsSync, promises as fs } from "node:fs";
import { createRequire } from "node:module";
import * as path from "node:path";

import {
  writeBenchmarkFixtureReport,
  writeBenchmarkResult,
  type EdgeRecord,
  type FixtureDiffReport,
  type FixtureTotalsSummary
} from "./utils/benchmarkRecorder";
import { getRepoRoot, resolveRepoPath } from "./utils/repoPaths";
type FixtureMaterialization =
  | { kind: "workspace"; workspacePath?: string }
  | {
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
    };

interface BenchmarkFixtureDefinition {
  id: string;
  label?: string;
  language?: string;
  path: string;
  modes?: string[];
  expected: string;
  inferred: string;
  materialization?: FixtureMaterialization;
  oracle?: {
    kind: string;
    root?: string;
    manualOverrides?: string;
  };
  thresholds?: {
    precision?: number;
    recall?: number;
  };
}

interface MaterializeResult {
  workspaceRoot: string;
  materialization: FixtureMaterialization | undefined;
  dispose?: () => Promise<void>;
}

interface OracleOverrideEntry {
  source: string;
  target: string;
  relation: string;
}

interface OracleOverrideConfig {
  manualEdges?: OracleOverrideEntry[];
}

interface OracleEdgeRecord {
  source: string;
  target: string;
  relation: string;
}

interface OracleEdge {
  source: string;
  target: string;
  relation: "imports" | "uses";
  provenance: "runtime-import" | "type-import";
}

interface OracleMergeResult {
  autoRecords: OracleEdgeRecord[];
  manualRecords: OracleEdgeRecord[];
  mergedRecords: OracleEdgeRecord[];
  missingManualEntries: OracleOverrideEntry[];
}

interface TypeScriptOracleModule {
  generateTypeScriptFixtureGraph(options: { fixtureRoot: string; include?: string[] }): OracleEdge[];
  mergeOracleEdges(edges: OracleEdge[], overrides?: OracleOverrideConfig): OracleMergeResult;
}

const REPO_ROOT = getRepoRoot(__dirname);
const FIXTURE_ROOT = resolveRepoPath("tests", "integration", "benchmarks", "fixtures");
const PRECISION_THRESHOLD = Number(process.env.BENCHMARK_PRECISION_THRESHOLD ?? "0.95");
const RECALL_THRESHOLD = Number(process.env.BENCHMARK_RECALL_THRESHOLD ?? "0.90");
const BENCHMARK_MODE = (process.env.BENCHMARK_MODE ?? "ast").toLowerCase();
const requireModule = createRequire(__filename);
const oracleModulePath = path.join(
  REPO_ROOT,
  "packages",
  "shared",
  "dist",
  "testing",
  "fixtureOracles",
  "typeScriptFixtureOracle.js"
);

if (!existsSync(oracleModulePath)) {
  throw new Error(
    `Expected TypeScript oracle at ${oracleModulePath}. Run npm run build before executing benchmarks.`
  );
}

const oracleModule = requireModule(oracleModulePath) as TypeScriptOracleModule;
const { generateTypeScriptFixtureGraph, mergeOracleEdges } = oracleModule;
const benchmarkManifestModule = requireModule(
  path.join(REPO_ROOT, "scripts", "fixture-tools", "benchmark-manifest.js")
) as {
  loadBenchmarkManifest(repoRoot: string): Promise<BenchmarkFixtureDefinition[]>;
};
const fixtureMaterializerModule = requireModule(
  path.join(REPO_ROOT, "scripts", "fixture-tools", "fixtureMaterializer.js")
) as {
  materializeFixture(
    repoRoot: string,
    fixture: BenchmarkFixtureDefinition,
    options?: { workspaceMode?: "persistent" | "ephemeral" }
  ): Promise<MaterializeResult>;
};
const { loadBenchmarkManifest } = benchmarkManifestModule;
const { materializeFixture } = fixtureMaterializerModule;

suite("T061: AST accuracy benchmark", () => {
  test("computes inference accuracy metrics against ground truth", async function () {
    this.timeout(10 * 60 * 1000); // Cloning vendor fixtures can exceed the default timeout
    this.slow(2 * 60 * 1000);
    const manifest = await loadBenchmarkManifest(REPO_ROOT);
    const fixtures = selectFixtures(manifest, BENCHMARK_MODE);

    if (fixtures.length === 0) {
      this.skip();
      return;
    }

    const trackerCtor = getInferenceAccuracyTracker();
    const tracker = new trackerCtor();
  const fixtureResults: FixtureDiffReport[] = [];

    for (const fixture of fixtures) {
      const { workspaceRoot, dispose } = await materializeFixture(REPO_ROOT, fixture, {
        workspaceMode: "ephemeral"
      });

      try {
        const comparison = await evaluateFixture(fixture, tracker, workspaceRoot);
        fixtureResults.push(comparison);
      } finally {
        if (dispose) {
          await dispose();
        }
      }
    }

    // Build a lookup map for per-fixture thresholds
    const fixtureById = new Map(fixtures.map(f => [f.id, f]));

    const failingFixtures = fixtureResults.filter(result => {
      const { precision, recall } = result.totals;
      const fixture = fixtureById.get(result.id);
      const precisionThreshold = fixture?.thresholds?.precision ?? PRECISION_THRESHOLD;
      const recallThreshold = fixture?.thresholds?.recall ?? RECALL_THRESHOLD;
      const precisionTooLow = precision !== null && precision < precisionThreshold;
      const recallTooLow = recall !== null && recall < recallThreshold;
      return precisionTooLow || recallTooLow;
    });

    if (failingFixtures.length > 0) {
      const lines = failingFixtures.map(result => {
        const { id, label, totals } = result;
        const fixture = fixtureById.get(id);
        const precisionThreshold = fixture?.thresholds?.precision ?? PRECISION_THRESHOLD;
        const recallThreshold = fixture?.thresholds?.recall ?? RECALL_THRESHOLD;
        const name = label ? `${id} (${label})` : id;
        return `${name}: precision=${renderMetric(totals.precision)} (threshold=${precisionThreshold}), recall=${renderMetric(totals.recall)} (threshold=${recallThreshold})`;
      });
      assert.fail(
        `One or more fixtures fell below precision/recall thresholds:
${lines.join("\n")}`
      );
    }

    const snapshot = tracker.snapshot({ reset: true });
    const totals = snapshot.totals;

    assert.ok(
      totals.precision !== null && totals.precision >= PRECISION_THRESHOLD,
      `Precision ${totals.precision ?? 0} fell below threshold ${PRECISION_THRESHOLD}`
    );
    assert.ok(
      totals.recall !== null && totals.recall >= RECALL_THRESHOLD,
      `Recall ${totals.recall ?? 0} fell below threshold ${RECALL_THRESHOLD}`
    );

    await writeBenchmarkFixtureReport("ast-accuracy", fixtureResults, {
      mode: BENCHMARK_MODE
    });

    await writeBenchmarkResult(
      "ast-accuracy",
      {
        mode: BENCHMARK_MODE,
        thresholds: {
          precision: PRECISION_THRESHOLD,
          recall: RECALL_THRESHOLD
        },
        totals,
        fixtures: fixtureResults
      },
      {
        mode: BENCHMARK_MODE
      }
    );
  });
});

async function evaluateFixture(
  fixture: BenchmarkFixtureDefinition,
  tracker: TrackerInstance,
  workspaceRoot: string
): Promise<FixtureDiffReport> {
  const root = path.join(FIXTURE_ROOT, fixture.path);
  const expected = await loadEdges(path.join(FIXTURE_ROOT, fixture.expected));

  await verifyTypeScriptOracleAlignment({
    fixture,
    expectedEdges: expected,
    fixtureRoot: root,
    workspaceRoot
  });

  const inferred = await loadEdges(path.join(FIXTURE_ROOT, fixture.inferred));

  const expectedMap = new Map<string, EdgeRecord>();
  const inferredSet = new Set<string>();

  for (const edge of expected) {
    expectedMap.set(edgeKey(edge), edge);
  }

  for (const edge of inferred) {
    inferredSet.add(edgeKey(edge));
  }

  const falseNegatives: EdgeRecord[] = [];
  const falsePositives: EdgeRecord[] = [];
  const truePositives: EdgeRecord[] = [];

  for (const edge of expected) {
    const key = edgeKey(edge);
    if (inferredSet.has(key)) {
      tracker.recordOutcome({
        benchmarkId: fixture.id,
        outcome: "truePositive",
        artifactUri: edge.source,
        relation: edge.relation
      });
      truePositives.push(edge);
    } else {
      tracker.recordOutcome({
        benchmarkId: fixture.id,
        outcome: "falseNegative",
        artifactUri: edge.source,
        relation: edge.relation
      });
      falseNegatives.push(edge);
    }
  }

  for (const edge of inferred) {
    const key = edgeKey(edge);
    if (!expectedMap.has(key)) {
      tracker.recordOutcome({
        benchmarkId: fixture.id,
        outcome: "falsePositive",
        artifactUri: edge.source,
        relation: edge.relation
      });
      falsePositives.push(edge);
    }
  }

  const totals = calculateTotals(
    truePositives.length,
    falsePositives.length,
    falseNegatives.length
  );

  return {
    id: fixture.id,
    label: fixture.label,
    language: fixture.language,
    totals,
    truePositives,
    falsePositives,
    falseNegatives
  };
}

async function verifyTypeScriptOracleAlignment(options: {
  fixture: BenchmarkFixtureDefinition;
  expectedEdges: EdgeRecord[];
  fixtureRoot: string;
  workspaceRoot: string;
}): Promise<void> {
  const { fixture, expectedEdges, fixtureRoot, workspaceRoot } = options;
  const oracleConfig = fixture.oracle;
  if (!oracleConfig || oracleConfig.kind.toLowerCase() !== "typescript") {
    return;
  }

  const overridesPath = path.join(
    fixtureRoot,
    oracleConfig.manualOverrides ?? "oracle.overrides.json"
  );
  const overrides = await readOracleOverrides(overridesPath);
  const oracleRoot = path.resolve(workspaceRoot, oracleConfig.root ?? ".");
  const autoEdges = generateTypeScriptFixtureGraph({ fixtureRoot: oracleRoot });
  const merge = mergeOracleEdges(autoEdges, overrides);

  const expectedKeySet = new Set(expectedEdges.map(edgeKey));
  const mergedRecords = merge.mergedRecords.map(toEdgeRecord);
  const mergedKeySet = new Set(mergedRecords.map(edgeKey));

  const additions = mergedRecords.filter(record => !expectedKeySet.has(edgeKey(record)));
  const removals = expectedEdges.filter(record => !mergedKeySet.has(edgeKey(record)));

  if (additions.length > 0 || removals.length > 0) {
    const message = renderOracleMismatchMessage(fixture.id, additions, removals, overridesPath);
    throw new Error(message);
  }

  if (merge.missingManualEntries.length > 0) {
    const missing = merge.missingManualEntries
      .map(entry => `${entry.source} → ${entry.target} (#${entry.relation})`)
      .join(", ");
    throw new Error(
      `Manual override entries missing for fixture ${fixture.id}: ${missing}. Update ${overridesPath} or adjust the oracle configuration.`
    );
  }
}

async function readOracleOverrides(filePath: string): Promise<OracleOverrideConfig | undefined> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error(`Override file must be an object: ${filePath}`);
    }
    return parsed as OracleOverrideConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

function toEdgeRecord(record: OracleEdgeRecord): EdgeRecord {
  return {
    source: record.source,
    target: record.target,
    relation: record.relation
  };
}

function renderOracleMismatchMessage(
  fixtureId: string,
  additions: EdgeRecord[],
  removals: EdgeRecord[],
  overridesPath: string
): string {
  const lines = [`TypeScript oracle divergence detected for fixture ${fixtureId}.`];
  if (additions.length > 0) {
    lines.push(
      `Oracle-only edges (${additions.length}): ${formatEdgeSamples(additions)}`
    );
  }
  if (removals.length > 0) {
    lines.push(
      `Edges missing from oracle (${removals.length}): ${formatEdgeSamples(removals)}`
    );
  }
  lines.push(
    `Run 'npm run fixtures:regenerate -- --fixture ${fixtureId}' to refresh expected.json and review overrides at ${overridesPath}.`
  );
  return lines.join("\n");
}

function formatEdgeSamples(records: EdgeRecord[]): string {
  const samples = records.slice(0, 5).map(record => `${record.source} → ${record.target} (#${record.relation})`);
  return samples.join("; ");
}

function selectFixtures(
  manifest: BenchmarkFixtureDefinition[],
  mode: string
): BenchmarkFixtureDefinition[] {
  if (mode === "all") {
    return manifest;
  }

  return manifest.filter(entry => {
    const modes = entry.modes?.map(candidate => candidate.toLowerCase()) ?? [];
    return modes.includes(mode);
  });
}

async function loadEdges(filePath: string): Promise<EdgeRecord[]> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Edge fixture must be an array: ${filePath}`);
  }
  return parsed.map(entry => normalizeEdge(entry));
}

function normalizeEdge(entry: EdgeRecord): EdgeRecord {
  if (!entry || typeof entry.source !== "string" || typeof entry.target !== "string") {
    throw new Error("Edge entries must include 'source' and 'target'");
  }
  return {
    source: normalizePath(entry.source),
    target: normalizePath(entry.target),
    relation: entry.relation ?? "default"
  };
}

function edgeKey(edge: EdgeRecord): string {
  return `${edge.source}→${edge.target}#${edge.relation ?? "default"}`;
}

function normalizePath(candidate: string): string {
  return candidate.replace(/\\/g, "/");
}

function calculateTotals(
  truePositives: number,
  falsePositives: number,
  falseNegatives: number
): FixtureTotalsSummary {
  const precision = ratio(truePositives, truePositives + falsePositives);
  const recall = ratio(truePositives, truePositives + falseNegatives);
  const f1Score = computeF1(precision, recall);

  return {
    truePositives,
    falsePositives,
    falseNegatives,
    precision,
    recall,
    f1Score
  };
}

function ratio(numerator: number, denominator: number): number | null {
  if (denominator === 0) {
    return null;
  }
  return numerator / denominator;
}

function computeF1(precision: number | null, recall: number | null): number | null {
  if (precision === null || recall === null || precision + recall === 0) {
    return null;
  }
  return (2 * precision * recall) / (precision + recall);
}

function renderMetric(value: number | null): string {
  if (value === null) {
    return "n/a";
  }
  return value.toFixed(3);
}

type TrackerCtor = new (...args: any[]) => TrackerInstance;

interface TrackerInstance {
  recordOutcome(options: {
    benchmarkId: string;
    outcome: "truePositive" | "falsePositive" | "falseNegative";
    artifactUri?: string;
    relation?: string;
  }): void;
  snapshot(options?: { reset?: boolean }): {
    totals: {
      precision: number | null;
      recall: number | null;
      f1Score: number | null;
    };
  };
}

let cachedTracker: TrackerCtor | undefined;

function getInferenceAccuracyTracker(): TrackerCtor {
  if (cachedTracker) {
    return cachedTracker;
  }

  const modulePath = path.join(REPO_ROOT, "packages", "shared", "dist", "telemetry", "inferenceAccuracy.js");
  if (!existsSync(modulePath)) {
    throw new Error(
      `Expected inference accuracy tracker at ${modulePath}. Run npm run build before integration benchmarks.`
    );
  }

  const trackerModule = requireModule(modulePath) as { InferenceAccuracyTracker?: TrackerCtor };
  if (!trackerModule?.InferenceAccuracyTracker) {
    throw new Error(`Module at ${modulePath} does not export InferenceAccuracyTracker`);
  }

  cachedTracker = trackerModule.InferenceAccuracyTracker;
  return cachedTracker;
}
