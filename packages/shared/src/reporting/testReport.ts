/**
 * Runtime environment metadata captured alongside benchmark results.
 */
export interface BenchmarkEnvironment {
  nodeVersion?: string | null;
  platform?: string | null;
  arch?: string | null;
  /** Allows arbitrary environment keys for forward compatibility. */
  [key: string]: string | null | undefined;
}

/**
 * A single benchmark measurement persisted to the versioned JSON archive
 * under `reports/benchmarks/<mode>/`.
 *
 * @typeParam TData - Shape of the benchmark-specific payload
 *  (e.g. {@link RebuildStabilityData}, {@link AstAccuracyData}).
 */
export interface BenchmarkRecord<TData = unknown> {
  /** Benchmark name (e.g. `"rebuild-stability"`, `"ast-accuracy"`). */
  benchmark: string;
  /** Optional mode qualifier (e.g. `"self-similarity"`, `"ast"`). */
  mode?: string | null;
  /** ISO timestamp of when this record was captured. */
  recordedAt: string;
  /** Environment snapshot at capture time. */
  environment: BenchmarkEnvironment;
  /** Benchmark-specific payload. */
  data: TData;
  /** Optional path to the source JSON file for audit trails. */
  sourcePath?: string;
}

/**
 * Metadata included in the report header.
 */
export interface TestReportContext {
  /** ISO timestamp of report generation. */
  generatedAt: string;
  /** Short git commit hash at generation time. */
  gitCommit: string;
  /** Current git branch, if available. */
  gitBranch?: string;
  /** Benchmark mode filter applied during generation. */
  benchmarkMode?: string;
}

/**
 * Payload for the `"rebuild-stability"` benchmark measuring graph rebuild
 * duration consistency across repeated iterations.
 */
export interface RebuildStabilityData {
  mode?: string;
  /** Workspace path that was rebuilt. */
  workspace: string;
  /** Number of rebuild iterations performed. */
  iterations: number;
  /** Individual iteration durations in milliseconds. */
  durationsMs: number[];
  /** Arithmetic mean of all durations. */
  averageDurationMs: number;
  /** Worst-case duration. */
  maxDurationMs: number;
  /** Whether any inter-iteration drift was detected. */
  driftDetected: boolean;
}

/**
 * Aggregate accuracy metrics for an AST-based inference benchmark.
 */
export interface AstAccuracyTotals {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
  totalEvaluated?: number;
}

/**
 * Per-fixture accuracy breakdown within an AST accuracy benchmark.
 */
export interface AstAccuracyFixture {
  /** Unique fixture identifier. */
  id: string;
  /** Optional human-readable label. */
  label?: string;
  /** Programming language of the fixture (e.g. `"typescript"`, `"ruby"`). */
  language?: string;
  /** Accuracy totals for this fixture. */
  totals: AstAccuracyTotals;
}

/**
 * Payload for the `"ast-accuracy"` benchmark comparing inferred edges
 * against ground-truth fixture oracles.
 */
export interface AstAccuracyData {
  mode?: string;
  /** Minimum acceptable precision and recall thresholds. */
  thresholds?: {
    precision?: number;
    recall?: number;
  };
  /** Aggregate totals across all fixtures. */
  totals: AstAccuracyTotals;
  /** Per-fixture accuracy breakdowns. */
  fixtures: AstAccuracyFixture[];
}

/** A titled section of markdown content within the test report. */
export interface ReportSection {
  title: string;
  body: string[];
}

/**
 * Renders a complete markdown test report from benchmark records.
 *
 * Dispatches each record to a benchmark-specific formatter
 * (`rebuild-stability`, `ast-accuracy`) or a generic JSON fallback,
 * and appends environment and artifact summary sections.
 *
 * @param context - Report metadata (timestamp, git info, mode).
 * @param benchmarks - Array of benchmark records to render.
 * @returns Complete markdown document as a string.
 */
export function buildTestReportMarkdown(
  context: TestReportContext,
  benchmarks: BenchmarkRecord[]
): string {
  const lines: string[] = [];
  lines.push("# Test Report");
  lines.push("");
  lines.push(`- **Generated:** ${context.generatedAt}`);
  lines.push(`- **Git commit:** ${context.gitCommit}`);
  if (context.gitBranch) {
    lines.push(`- **Git branch:** ${context.gitBranch}`);
  }
  if (context.benchmarkMode) {
    lines.push(`- **Benchmark mode:** ${context.benchmarkMode}`);
  }
  lines.push("");

  const sections = buildBenchmarkSections(benchmarks);
  lines.push("## Benchmarks");
  lines.push("");
  if (sections.length === 0) {
    lines.push("_No benchmark results found. Run benchmarks with --report to capture data._");
  } else {
    for (const section of sections) {
      lines.push(`### ${section.title}`);
      lines.push("");
      lines.push(...section.body);
      if (!section.body.at(-1)) {
        lines.push("");
      } else {
        lines.push("");
      }
    }
  }

  const environmentSummary = summariseEnvironments(benchmarks);
  if (environmentSummary.length > 0) {
    lines.push("## Environment Summary");
    lines.push("");
    lines.push(...environmentSummary);
    lines.push("");
  }

  if (benchmarks.length > 0) {
    lines.push("## Benchmark Artifacts");
    lines.push("");
    for (const record of benchmarks) {
      const suffix = record.sourcePath ? ` (${record.sourcePath})` : "";
        const modeTag = record.mode ? ` [mode: ${record.mode}]` : "";
        lines.push(`- ${record.benchmark}${modeTag} — recorded ${record.recordedAt}${suffix}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function buildBenchmarkSections(records: BenchmarkRecord[]): ReportSection[] {
  return records
    .map(record => {
      switch (record.benchmark) {
        case "rebuild-stability":
          return buildRebuildStabilitySection(record as BenchmarkRecord<RebuildStabilityData>);
        case "ast-accuracy":
          return buildAstAccuracySection(record as BenchmarkRecord<AstAccuracyData>);
        default:
          return buildGenericSection(record);
      }
    })
    .filter((value): value is ReportSection => value !== null);
}

function buildRebuildStabilitySection(record: BenchmarkRecord<RebuildStabilityData>): ReportSection {
  const data = record.data;
  const durations = Array.isArray(data.durationsMs) ? data.durationsMs : [];
  const formattedDurations = durations.map(value => `${value.toFixed(0)} ms`).join(", ");

  const body: string[] = [];
  if (data.mode) {
    body.push(`- **Mode:** ${data.mode}`);
  }
  body.push(`- **Workspace:** ${data.workspace}`);
  body.push(`- **Iterations:** ${data.iterations}`);
  if (durations.length > 0) {
    body.push(`- **Durations:** ${formattedDurations}`);
  }
  body.push(`- **Average duration:** ${data.averageDurationMs.toFixed(2)} ms`);
  body.push(`- **Max duration:** ${data.maxDurationMs.toFixed(2)} ms`);
  body.push(`- **Drift detected:** ${data.driftDetected ? "Yes" : "No"}`);

  return {
    title: "Rebuild Stability",
    body
  };
}

function buildAstAccuracySection(record: BenchmarkRecord<AstAccuracyData>): ReportSection {
  const data = record.data;
  const body: string[] = [];

  if (data.mode) {
    body.push(`- **Mode:** ${data.mode}`);
  }
  if (data.thresholds) {
    const precision = data.thresholds.precision ?? null;
    const recall = data.thresholds.recall ?? null;
    body.push(
      `- **Thresholds:** precision ${formatPercentage(precision)}, recall ${formatPercentage(recall)}`
    );
  }

  body.push("- **Totals:**");
  body.push("");
  body.push(renderTotalsTable(data.totals));
  body.push("");

  if (Array.isArray(data.fixtures) && data.fixtures.length > 0) {
    body.push("- **Fixtures:**");
    body.push("");
    body.push(renderFixtureTable(data.fixtures));
    body.push("");
  }

  return {
    title: "AST Accuracy",
    body
  };
}

function buildGenericSection(record: BenchmarkRecord): ReportSection {
  const body: string[] = [];
  body.push("```");
  body.push(JSON.stringify(record.data, null, 2));
  body.push("```");
  return {
    title: record.benchmark,
    body
  };
}

function renderTotalsTable(totals: AstAccuracyTotals): string {
  const headers = ["TP", "FP", "FN", "Precision", "Recall", "F1"];
  const values = [
    totals.truePositives,
    totals.falsePositives,
    totals.falseNegatives,
    formatPercentage(totals.precision),
    formatPercentage(totals.recall),
    formatPercentage(totals.f1Score)
  ];

  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "-").join(" | ")} |`,
    `| ${values.join(" | ")} |`
  ].join("\n");
}

function renderFixtureTable(fixtures: AstAccuracyFixture[]): string {
  const headers = ["Fixture", "Language", "TP", "FP", "FN", "Precision", "Recall", "F1"];
  const lines = fixtures.map(fixture => {
    const name = fixture.label ?? fixture.id;
    const language = fixture.language ?? "—";
    const totals = fixture.totals;
    return [
      name,
      language,
      totals.truePositives,
      totals.falsePositives,
      totals.falseNegatives,
      formatPercentage(totals.precision),
      formatPercentage(totals.recall),
      formatPercentage(totals.f1Score)
    ].join(" | ");
  });

  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "-").join(" | ")} |`,
    ...lines.map(line => `| ${line} |`)
  ].join("\n");
}

function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "n/a";
  }
  return `${(value * 100).toFixed(1)}%`;
}

function summariseEnvironments(records: BenchmarkRecord[]): string[] {
  if (records.length === 0) {
    return [];
  }

  const merged: Record<string, Set<string>> = {};
  for (const record of records) {
    for (const [key, value] of Object.entries(record.environment ?? {})) {
      if (!value) {
        continue;
      }
      if (!merged[key]) {
        merged[key] = new Set();
      }
      merged[key].add(value);
    }
  }

  const entries = Object.entries(merged).sort(([left], [right]) => left.localeCompare(right));
  if (entries.length === 0) {
    return [];
  }

  return entries.map(([key, values]) => `- **${key}:** ${Array.from(values).join(", ")}`);
}