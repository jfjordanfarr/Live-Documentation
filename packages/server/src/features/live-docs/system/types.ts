import type { LiveDocumentationConfig } from "@live-documentation/shared/config/liveDocumentationConfig";
import type {
  CoActivationEdge
} from "@live-documentation/shared/live-docs/analysis/coActivation";
import type { LiveDocRenderSection } from "@live-documentation/shared/live-docs/markdown";

// ─────────────────────────────────────────────────────────────────────────────
// Layer 3 Archetypes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Discriminant for the six MDMD Layer 3 system document archetypes.
 *
 * Each archetype corresponds to a distinct analytical strategy in the
 * system generator's plan builders. The generator materialises one
 * document per archetype per detected cluster.
 *
 * @remarks
 * Extracted from the monolithic `generator.ts` on 2025-12-07 during the
 * decomposition into 10 capability modules.
 */
export type Layer3Archetype =
  | "component"
  | "interaction"
  | "data-model"
  | "workflow"
  | "integration"
  | "testing";

// ─────────────────────────────────────────────────────────────────────────────
// Generator Options & Results
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration for a system-layer Live Docs generation run.
 *
 * Supports dry-run mode, custom output directories, clean-before-write,
 * and a pluggable {@link SystemGeneratorLogger} for CLI/test integration.
 */
export interface GenerateSystemLiveDocsOptions {
  workspaceRoot: string;
  config?: LiveDocumentationConfig;
  dryRun?: boolean;
  logger?: SystemGeneratorLogger;
  now?: () => Date;
  outputDir?: string;
  cleanOutputDir?: boolean;
}

/**
 * Record-level summary of a single system document write, used for
 * aggregate counting in the generator result.
 */
export interface SystemLiveDocWriteRecord {
  id: string;
  archetype: Layer3Archetype;
  docPath: string;
  change: "created" | "updated" | "unchanged";
}

/**
 * Full representation of a generated system document, including its
 * rendered markdown content and filesystem paths.
 *
 * Consumed by the CLI to write documents and by tests to assert on
 * generated content without touching the filesystem.
 */
export interface GeneratedSystemDocument {
  id: string;
  archetype: Layer3Archetype;
  relativePath: string;
  absolutePath: string;
  content: string;
  change: "created" | "updated" | "unchanged";
}

/**
 * Aggregated result of a system-layer generation run.
 *
 * The CLI (`npm run live-docs:system`) and integration tests consume
 * this to report processed/written/skipped/deleted counts and to
 * access the full list of generated documents.
 */
export interface SystemLiveDocGeneratorResult {
  processed: number;
  written: number;
  skipped: number;
  deleted: number;
  files: SystemLiveDocWriteRecord[];
  deletedFiles: string[];
  documents: GeneratedSystemDocument[];
  outputDir?: string;
}

/**
 * Pluggable logger interface for system generation, enabling both
 * CLI console output and silent test execution.
 */
export interface SystemGeneratorLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A plan describing a single system-layer document to materialise.
 *
 * Each plan builder (component, interaction, workflow, testing,
 * co-activation) produces one or more `SystemDocPlan`s. The generator
 * orchestrator then renders each plan into a markdown document.
 *
 * `componentPaths` lists the workspace artifacts that belong to this
 * cluster, `edgeTuples` captures the dependency edges between them,
 * and the optional `activation` summary provides statistical
 * significance data from co-activation analysis.
 */
export interface SystemDocPlan {
  id: string;
  archetype: Layer3Archetype;
  slug: string;
  titleSuffix: string;
  componentPaths: string[];
  edgeTuples: Array<{ from: string; to: string }>;
  virtualNodes?: SystemVirtualNode[];
  activation?: PlanActivationSummary;
  nodeMetrics?: Record<string, NodeMetric>;
}

/**
 * A synthetic node injected into a system document plan for concepts
 * that don't map to a single file (e.g. aggregated test summaries).
 */
export interface SystemVirtualNode {
  key: string;
  label: string;
  archetype: "test-summary";
}

/**
 * Per-node metrics within a system document cluster, computed from
 * the co-activation graph.
 */
export interface NodeMetric {
  degree: number;
  strength: number;
  testCount: number;
  zScore: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Activation Summary Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A test or dependency source contributing to a cluster's activation,
 * with the number of edges it participates in.
 */
export interface PlanActivationSourceSummary {
  path: string;
  count: number;
}

/**
 * A single co-activation edge with statistical significance metadata.
 *
 * `pValue` and `qValue` (Benjamini-Hochberg FDR-corrected) indicate
 * whether the shared-test count between `source` and `target` is
 * statistically significant given the workspace baseline.
 */
export interface PlanActivationEdgeSummary {
  source: string;
  target: string;
  weight: number;
  testSources: string[];
  dependencySources: string[];
  sharedTestCount: number;
  pValue: number | null;
  qValue: number | null;
}

/**
 * Cluster-level statistical significance summary, comparing observed
 * edge density against the expected density under a null model.
 *
 * `clusterPValue` and `clusterQValue` quantify whether the cluster's
 * internal co-activation is stronger than chance.
 */
export interface PlanActivationSignificanceSummary {
  edgeAlpha: number;
  clusterAlpha: number;
  clusterPValue: number;
  clusterQValue: number;
  clusterDensity: number;
  expectedEdgeCount: number;
  observedEdgeCount: number;
  selectedEdgeCount: number;
}

/**
 * Complete activation summary for a system document plan's cluster.
 *
 * Aggregates member coverage, edge statistics, top components by
 * z-score, top edges by weight, and the contributing test/dependency
 * sources. Used by the rendering pipeline to produce the
 * "Activation" section of system-layer Live Docs.
 */
export interface PlanActivationSummary {
  clusterId: string;
  memberCount: number;
  coveredMembers: number;
  coverageRatio: number;
  totalWeight: number;
  averageWeight: number;
  edgeCount: number;
  topComponents: Array<{ path: string; strength: number; degree: number; testCount: number; zScore: number }>;
  topEdges: PlanActivationEdgeSummary[];
  topTestSources: PlanActivationSourceSummary[];
  topDependencySources: PlanActivationSourceSummary[];
  significance?: PlanActivationSignificanceSummary;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Sequence Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single stage descriptor parsed from `run-all.ts`, describing
 * a named pipeline stage and its npm script.
 */
export interface RunAllStageDescriptor {
  label: string;
  script: string;
}

/**
 * DAG adjacency entry for a single stage, listing which stages must
 * run before and after it.
 */
export interface StageSequenceMapEntry {
  before: string[];
  after: string[];
}

/**
 * The complete stage execution DAG extracted from `run-all.ts`.
 *
 * `order` is a topological sort of stage names; `map` provides the
 * adjacency list (before/after) for each stage.
 */
export interface StageSequence {
  order: string[];
  map: Map<string, StageSequenceMapEntry>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rendering Context Types
// ─────────────────────────────────────────────────────────────────────────────

export type { LiveDocRenderSection };

export type { CoActivationEdge };
