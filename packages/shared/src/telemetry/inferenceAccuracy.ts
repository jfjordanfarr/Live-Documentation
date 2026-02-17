import { normalizeFileUri } from "../uri/normalizeFileUri";

/**
 * Classification of an inference result against the ground-truth oracle.
 */
export type InferenceOutcome = "truePositive" | "falsePositive" | "falseNegative";

/**
 * Parameters for recording a single inference accuracy observation.
 */
export interface RecordOutcomeOptions {
  /** Identifier of the benchmark suite this observation belongs to. */
  benchmarkId: string;
  /** Classification of the inference result. */
  outcome: InferenceOutcome;
  /** Optional URI of the artifact involved. */
  artifactUri?: string;
  /** Optional identifier of the edge being evaluated. */
  edgeId?: string;
  /** Optional relationship kind (e.g. `"references"`, `"depends_on"`). */
  relation?: string;
  /** Observation weight; defaults to 1 when omitted. */
  weight?: number;
  /** Epoch-millisecond timestamp; defaults to `now()` when omitted. */
  at?: number;
}

/**
 * Configuration for the {@link InferenceAccuracyTracker}.
 */
export interface InferenceAccuracyTrackerOptions {
  /** Maximum number of recent samples retained in the ring buffer. */
  maxSamples?: number;
  /** Clock factory for deterministic timestamps in tests. */
  now?: () => number;
  /** Optional logger for non-fatal warnings. */
  logger?: {
    warn(message: string): void;
  };
}

/**
 * A single accuracy observation stored in the tracker's ring buffer.
 */
export interface AccuracySample {
  /** Benchmark suite identifier. */
  benchmarkId: string;
  /** Outcome classification. */
  outcome: InferenceOutcome;
  /** Normalised URI of the artifact, if provided. */
  artifactUri?: string;
  /** Edge identifier, if provided. */
  edgeId?: string;
  /** Relationship kind, if provided. */
  relation?: string;
  /** Observation weight (defaults to 1). */
  weight: number;
  /** ISO timestamp of when the observation was recorded. */
  recordedAtIso: string;
}

/**
 * Aggregate accuracy statistics: weighted totals plus standard
 * precision, recall, and F1 score (nullable when denominators are 0).
 */
export interface AccuracyTotals {
  /** Total weighted observations evaluated. */
  totalEvaluated: number;
  /** Weighted true positives. */
  truePositives: number;
  /** Weighted false positives. */
  falsePositives: number;
  /** Weighted false negatives. */
  falseNegatives: number;
  /** TP / (TP + FP), or `null` when the denominator is 0. */
  precision: number | null;
  /** TP / (TP + FN), or `null` when the denominator is 0. */
  recall: number | null;
  /** Harmonic mean of precision and recall, or `null`. */
  f1Score: number | null;
}

/** Per-benchmark accuracy breakdown extending {@link AccuracyTotals}. */
export interface BenchmarkAccuracySummary extends AccuracyTotals {
  benchmarkId: string;
}

/**
 * Complete accuracy snapshot returned by {@link InferenceAccuracyTracker.snapshot}.
 */
export interface InferenceAccuracySummary {
  /** Grand totals across all benchmarks. */
  totals: AccuracyTotals;
  /** Per-benchmark breakdowns, sorted by benchmark ID. */
  benchmarks: BenchmarkAccuracySummary[];
  /** Recent observation samples from the ring buffer. */
  samples: AccuracySample[];
}

type BenchmarkKey = string;

interface MutableTotals {
  totalEvaluated: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
}

const DEFAULT_MAX_SAMPLES = 200;

/**
 * Tracks inference accuracy metrics (precision, recall, F1) across
 * multiple benchmark suites with a bounded ring-buffer of recent samples.
 *
 * Used by the benchmark harness to accumulate per-edge TP/FP/FN outcomes
 * and produce aggregate accuracy reports.
 */
export class InferenceAccuracyTracker {
  private readonly now: () => number;
  private readonly logger?: InferenceAccuracyTrackerOptions["logger"];
  private readonly maxSamples: number;

  private readonly benchmarkTotals = new Map<BenchmarkKey, MutableTotals>();
  private readonly samples: AccuracySample[] = [];

  constructor(options: InferenceAccuracyTrackerOptions = {}) {
    this.maxSamples = Math.max(1, options.maxSamples ?? DEFAULT_MAX_SAMPLES);
    this.now = options.now ?? (() => Date.now());
    this.logger = options.logger;
  }

  /**
   * Records a single accuracy observation.
   *
   * @param options - Observation details including benchmark ID and outcome.
   * @throws If `benchmarkId` is empty.
   */
  recordOutcome(options: RecordOutcomeOptions): void {
    if (!options.benchmarkId) {
      throw new Error("benchmarkId is required");
    }

    const weight = typeof options.weight === "number" && Number.isFinite(options.weight) ? options.weight : 1;

    const canonicalArtifact = options.artifactUri ? normalizeFileUri(options.artifactUri) : undefined;

    const totals = this.getOrCreateTotals(options.benchmarkId);
    totals.totalEvaluated += weight;

    switch (options.outcome) {
      case "truePositive": {
        totals.truePositives += weight;
        break;
      }
      case "falsePositive": {
        totals.falsePositives += weight;
        break;
      }
      case "falseNegative": {
        totals.falseNegatives += weight;
        break;
      }
      default: {
        const exhaustive: never = options.outcome;
        if (this.logger) {
          this.logger.warn(`[inference-accuracy] Unrecognised outcome ${(exhaustive as string) ?? "unknown"}`);
        }
        return;
      }
    }

    const recordedAt = typeof options.at === "number" ? options.at : this.now();
    this.samples.push({
      benchmarkId: options.benchmarkId,
      outcome: options.outcome,
      artifactUri: canonicalArtifact,
      edgeId: options.edgeId,
      relation: options.relation,
      weight,
      recordedAtIso: new Date(recordedAt).toISOString()
    });

    if (this.samples.length > this.maxSamples) {
      this.samples.splice(0, this.samples.length - this.maxSamples);
    }
  }

  /**
   * Returns a snapshot of current accuracy statistics.
   *
   * @param options.reset - If `true`, clears all state after snapshotting.
   * @param options.maxSamples - Limits the number of samples in the snapshot.
   */
  snapshot(options: { reset?: boolean; maxSamples?: number } = {}): InferenceAccuracySummary {
    const summaries: BenchmarkAccuracySummary[] = [];
    let grandTotals: MutableTotals | null = null;

    for (const [benchmarkId, totals] of this.benchmarkTotals.entries()) {
      grandTotals = mergeTotals(grandTotals, totals);
      summaries.push({
        benchmarkId,
        ...calculateRatios(totals)
      });
    }

    const aggregate = grandTotals ?? createEmptyTotals();

    const limitedSamples = options.maxSamples
      ? this.samples.slice(Math.max(0, this.samples.length - options.maxSamples))
      : [...this.samples];

    const snapshot: InferenceAccuracySummary = {
      totals: calculateRatios(aggregate),
      benchmarks: summaries.sort((left, right) => left.benchmarkId.localeCompare(right.benchmarkId)),
      samples: limitedSamples
    };

    if (options.reset) {
      this.reset();
    }

    return snapshot;
  }

  /** Clears all accumulated totals and samples. */
  reset(): void {
    this.benchmarkTotals.clear();
    this.samples.length = 0;
  }

  private getOrCreateTotals(benchmarkId: BenchmarkKey): MutableTotals {
    let totals = this.benchmarkTotals.get(benchmarkId);
    if (!totals) {
      totals = createEmptyTotals();
      this.benchmarkTotals.set(benchmarkId, totals);
    }
    return totals;
  }
}

function createEmptyTotals(): MutableTotals {
  return {
    totalEvaluated: 0,
    truePositives: 0,
    falsePositives: 0,
    falseNegatives: 0
  };
}

function mergeTotals(current: MutableTotals | null, additional: MutableTotals): MutableTotals {
  if (!current) {
    return { ...additional };
  }
  current.totalEvaluated += additional.totalEvaluated;
  current.truePositives += additional.truePositives;
  current.falsePositives += additional.falsePositives;
  current.falseNegatives += additional.falseNegatives;
  return current;
}

function calculateRatios(totals: MutableTotals): AccuracyTotals {
  const precisionDenominator = totals.truePositives + totals.falsePositives;
  const recallDenominator = totals.truePositives + totals.falseNegatives;
  const precision = precisionDenominator > 0 ? totals.truePositives / precisionDenominator : null;
  const recall = recallDenominator > 0 ? totals.truePositives / recallDenominator : null;
  const f1Score = precision !== null && recall !== null && precision + recall > 0
    ? (2 * precision * recall) / (precision + recall)
    : null;

  return {
    totalEvaluated: totals.totalEvaluated,
    truePositives: totals.truePositives,
    falsePositives: totals.falsePositives,
    falseNegatives: totals.falseNegatives,
    precision,
    recall,
    f1Score
  };
}
