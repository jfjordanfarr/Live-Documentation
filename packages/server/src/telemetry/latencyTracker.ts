import { LatencyChangeKind, LatencySample, LatencySummary } from "@live-documentation/shared/contracts/telemetry";

import { normalizeFileUri } from "../features/utils/uri";

export interface LatencyTrackerOptions {
  now?: () => number;
  thresholdMs?: number;
  maxSamples?: number;
  logger?: {
    warn(message: string): void;
    info?(message: string): void;
  };
}

interface ActiveChange {
  changeEventId: string;
  changeType: LatencyChangeKind;
  artifactId?: string;
  uri: string;
  queuedAt: number;
  persistedAt: number;
}

interface TypeTotals {
  total: number;
  completed: number;
  sumDurations: number;
  maxDuration: number;
}

type LatencyTypeSummary = LatencySummary["byType"][LatencyChangeKind];

const DEFAULT_THRESHOLD_MS = 2500;
const DEFAULT_MAX_SAMPLES = 200;

export class LatencyTracker {
  private readonly now: () => number;
  private readonly thresholdMs: number;
  private readonly maxSamples: number;
  private readonly logger?: LatencyTrackerOptions["logger"];

  private readonly pendingStarts = new Map<string, number[]>();
  private readonly activeChanges = new Map<string, ActiveChange>();
  private readonly completedSamples: LatencySample[] = [];

  private diagnosticsEmitted = 0;
  private readonly typeTotals: Record<LatencyChangeKind, TypeTotals> = {
    document: { total: 0, completed: 0, sumDurations: 0, maxDuration: 0 },
    code: { total: 0, completed: 0, sumDurations: 0, maxDuration: 0 }
  };

  constructor(options: LatencyTrackerOptions = {}) {
    this.now = options.now ?? (() => Date.now());
    this.thresholdMs = options.thresholdMs ?? DEFAULT_THRESHOLD_MS;
    this.maxSamples = Math.max(1, options.maxSamples ?? DEFAULT_MAX_SAMPLES);
    this.logger = options.logger;
  }

  recordEnqueue(uri: string, at?: number): void {
    const canonical = normalizeFileUri(uri);
    const stamp = typeof at === "number" ? at : this.now();
    if (!this.pendingStarts.has(canonical)) {
      this.pendingStarts.set(canonical, [stamp]);
      return;
    }

    this.pendingStarts.get(canonical)!.push(stamp);
  }

  registerPersisted(params: {
    changeEventId: string;
    uri: string;
    changeType: LatencyChangeKind;
    artifactId?: string;
    at?: number;
  }): void {
    const canonical = normalizeFileUri(params.uri);
    const queue = this.pendingStarts.get(canonical);
    const queuedAt = queue && queue.length > 0 ? queue.shift()! : this.now();
    if (queue && queue.length === 0) {
      this.pendingStarts.delete(canonical);
    }

    const persistedAt = typeof params.at === "number" ? params.at : this.now();

    const existing = this.activeChanges.get(params.changeEventId);
    if (existing) {
      if (this.logger) {
        this.logger.warn(
          `[latency] duplicate persisted change ${params.changeEventId}; overwriting previous record`
        );
      }
    }

    this.activeChanges.set(params.changeEventId, {
      changeEventId: params.changeEventId,
      changeType: params.changeType,
      artifactId: params.artifactId,
      uri: canonical,
      queuedAt,
      persistedAt
    });

    this.typeTotals[params.changeType].total += 1;
  }

  complete(params: { changeEventId: string; diagnosticsEmitted: number; at?: number }): void {
    const record = this.activeChanges.get(params.changeEventId);
    if (!record) {
      if (this.logger) {
        this.logger.warn(
          `[latency] missing active change for ${params.changeEventId}; skipping completion`
        );
      }
      return;
    }

    const publishedAt = typeof params.at === "number" ? params.at : this.now();
    const duration = Math.max(0, publishedAt - record.queuedAt);

    const sample: LatencySample = {
      changeEventId: record.changeEventId,
      changeType: record.changeType,
      diagnosticsEmitted: params.diagnosticsEmitted,
      queuedAt: new Date(record.queuedAt).toISOString(),
      persistedAt: new Date(record.persistedAt).toISOString(),
      publishedAt: new Date(publishedAt).toISOString(),
      durationMs: duration
    };

    this.completedSamples.push(sample);
    if (this.completedSamples.length > this.maxSamples) {
      this.completedSamples.shift();
    }

    this.diagnosticsEmitted += params.diagnosticsEmitted;

    const totals = this.typeTotals[record.changeType];
    totals.completed += 1;
    totals.sumDurations += duration;
    totals.maxDuration = Math.max(totals.maxDuration, duration);

    this.activeChanges.delete(params.changeEventId);
  }

  discardQueuedChange(uri: string): void {
    const canonical = normalizeFileUri(uri);
    const queue = this.pendingStarts.get(canonical);
    if (!queue || queue.length === 0) {
      return;
    }

    queue.shift();
    if (queue.length === 0) {
      this.pendingStarts.delete(canonical);
    }
  }

  snapshot(options: { reset?: boolean; maxSamples?: number } = {}): LatencySummary {
    const completedDurations = this.completedSamples.map(sample => sample.durationMs);
    const averageLatencyMs = calculateAverage(completedDurations);
    const maxLatencyMs = completedDurations.length > 0 ? Math.max(...completedDurations) : null;
    const p95LatencyMs = calculatePercentile(completedDurations, 0.95);

    const byType: LatencySummary["byType"] = {
      document: buildTypeSummary(this.typeTotals.document),
      code: buildTypeSummary(this.typeTotals.code)
    };

    const sampleLimit = Math.min(options.maxSamples ?? 10, this.completedSamples.length);

    const summary: LatencySummary = {
      totalChanges: this.typeTotals.document.total + this.typeTotals.code.total,
      completedChanges: this.typeTotals.document.completed + this.typeTotals.code.completed,
      inFlightChanges: this.activeChanges.size,
      queuedChanges: Array.from(this.pendingStarts.values()).reduce((sum, queue) => sum + queue.length, 0),
      diagnosticsEmitted: this.diagnosticsEmitted,
      averageLatencyMs,
      maxLatencyMs,
      p95LatencyMs,
      thresholdMs: this.thresholdMs,
      byType,
      recentSamples: this.completedSamples.slice(Math.max(0, this.completedSamples.length - sampleLimit))
    };

    if (options.reset) {
      this.reset();
    }

    return summary;
  }

  reset(): void {
    this.pendingStarts.clear();
    this.activeChanges.clear();
    this.completedSamples.length = 0;
    this.diagnosticsEmitted = 0;
    this.typeTotals.document = { total: 0, completed: 0, sumDurations: 0, maxDuration: 0 };
    this.typeTotals.code = { total: 0, completed: 0, sumDurations: 0, maxDuration: 0 };
  }
}

function buildTypeSummary(totals: TypeTotals): LatencySummary["byType"][LatencyChangeKind] {
  return {
    total: totals.total,
    completed: totals.completed,
    averageLatencyMs: totals.completed > 0 ? totals.sumDurations / totals.completed : null,
    maxLatencyMs: totals.completed > 0 ? totals.maxDuration : null
  } satisfies LatencyTypeSummary;
}

function calculateAverage(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function calculatePercentile(values: number[], percentile: number): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const rank = percentile * (sorted.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  const weight = rank - lower;
  if (upper >= sorted.length) {
    return sorted[sorted.length - 1];
  }
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}
