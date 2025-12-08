import {
  DiagnosticStatus,
  DriftHistoryStatus,
  LinkRelationshipKind
} from "../domain/artifacts";

/**
 * Row shape for artifacts table.
 */
export interface ArtifactRow {
  id: string;
  uri: string;
  layer: string;
  language: string | null;
  owner: string | null;
  last_synchronized_at: string | null;
  hash: string | null;
  metadata: string | null;
}

/**
 * Row shape for links table.
 */
export interface LinkRow {
  id: string;
  source_id: string;
  target_id: string;
  kind: string;
  confidence: number;
  created_at: string;
  created_by: string;
}

/**
 * Row shape for llm_edge_provenance table.
 */
export interface LlmEdgeProvenanceRow {
  link_id: string;
  template_id: string;
  template_version: string;
  prompt_hash: string;
  model_id: string;
  issued_at: string;
  created_at: string;
  confidence_tier: string;
  calibrated_confidence: number;
  raw_confidence: number | null;
  diagnostics_eligible: number;
  shadowed: number;
  supporting_chunks: string | null;
  promotion_criteria: string | null;
  rationale: string | null;
}

/**
 * Row shape for diagnostics table.
 */
export interface DiagnosticRow {
  id: string;
  artifact_id: string;
  trigger_artifact_id: string;
  change_event_id: string | null;
  message: string;
  severity: string;
  status: string;
  created_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  link_ids: string | null;
  llm_assessment: string | null;
}

/**
 * Row shape for drift_history table.
 */
export interface DriftHistoryRow {
  id: string;
  diagnostic_id: string;
  change_event_id: string;
  trigger_artifact_id: string;
  target_artifact_id: string;
  status: string;
  severity: string;
  recorded_at: string;
  actor: string | null;
  notes: string | null;
  metadata: string | null;
}

/**
 * Row shape for drift history count aggregation.
 */
export interface DriftHistoryCountRow {
  status: string;
  count: number;
}

/**
 * Row shape for last acknowledgement query.
 */
export interface DriftHistoryAckRow {
  recorded_at: string;
  actor: string | null;
}

/**
 * Row shape for linked artifact queries (join result).
 */
export interface LinkedArtifactRow {
  link_id: string;
  link_kind: LinkRelationshipKind;
  link_confidence: number;
  source_id: string;
  target_id: string;
  artifact_id: string;
  artifact_uri: string;
  artifact_layer: string;
  artifact_language: string | null;
  artifact_owner: string | null;
  artifact_last_synchronized_at: string | null;
  artifact_hash: string | null;
  artifact_metadata: string | null;
}

/**
 * Summary of drift history for a change event.
 */
export interface DriftHistorySummary {
  changeEventId: string;
  totals: Record<DriftHistoryStatus, number>;
  lastAcknowledgedAt: string | null;
  lastAcknowledgedBy: string | null;
}

/**
 * Options for updating diagnostic status.
 */
export interface UpdateDiagnosticStatusOptions {
  id: string;
  status: DiagnosticStatus;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

/**
 * Options for finding diagnostic by change event.
 */
export interface FindDiagnosticByChangeEventOptions {
  changeEventId: string;
  artifactId: string;
  triggerArtifactId: string;
}

/**
 * Options for listing drift history.
 */
export interface ListDriftHistoryOptions {
  changeEventId?: string;
  targetArtifactId?: string;
  diagnosticId?: string;
  status?: DriftHistoryStatus;
  limit?: number;
}
