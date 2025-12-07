import type { LiveDocumentationConfig } from "@live-documentation/shared/config/liveDocumentationConfig";
import type {
  CoActivationEdge
} from "@live-documentation/shared/live-docs/analysis/coActivation";
import type { LiveDocRenderSection } from "@live-documentation/shared/live-docs/markdown";

// ─────────────────────────────────────────────────────────────────────────────
// Layer 3 Archetypes
// ─────────────────────────────────────────────────────────────────────────────

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

export interface GenerateSystemLiveDocsOptions {
  workspaceRoot: string;
  config?: LiveDocumentationConfig;
  dryRun?: boolean;
  logger?: SystemGeneratorLogger;
  now?: () => Date;
  outputDir?: string;
  cleanOutputDir?: boolean;
}

export interface SystemLiveDocWriteRecord {
  id: string;
  archetype: Layer3Archetype;
  docPath: string;
  change: "created" | "updated" | "unchanged";
}

export interface GeneratedSystemDocument {
  id: string;
  archetype: Layer3Archetype;
  relativePath: string;
  absolutePath: string;
  content: string;
  change: "created" | "updated" | "unchanged";
}

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

export interface SystemGeneratorLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan Types
// ─────────────────────────────────────────────────────────────────────────────

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

export interface SystemVirtualNode {
  key: string;
  label: string;
  archetype: "test-summary";
}

export interface NodeMetric {
  degree: number;
  strength: number;
  testCount: number;
  zScore: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Activation Summary Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanActivationSourceSummary {
  path: string;
  count: number;
}

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

export interface RunAllStageDescriptor {
  label: string;
  script: string;
}

export interface StageSequenceMapEntry {
  before: string[];
  after: string[];
}

export interface StageSequence {
  order: string[];
  map: Map<string, StageSequenceMapEntry>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rendering Context Types
// ─────────────────────────────────────────────────────────────────────────────

export type { LiveDocRenderSection };

export type { CoActivationEdge };
