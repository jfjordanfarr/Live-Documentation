import {
  ArtifactRow,
  DiagnosticRow,
  DriftHistoryRow,
  LinkRow,
  LlmEdgeProvenanceRow
} from "./graphStore.types";
import {
  DiagnosticRecord,
  DiagnosticStatus,
  DriftHistoryEntry,
  DriftHistoryStatus,
  KnowledgeArtifact,
  LinkRelationship,
  LinkRelationshipKind,
  LlmAssessment,
  LlmEdgeProvenance
} from "../domain/artifacts";

/**
 * Maps a database row to a KnowledgeArtifact domain object.
 */
export function mapArtifactRow(row: ArtifactRow): KnowledgeArtifact {
  return {
    id: row.id,
    uri: row.uri,
    layer: row.layer as KnowledgeArtifact["layer"],
    language: row.language ?? undefined,
    owner: row.owner ?? undefined,
    lastSynchronizedAt: row.last_synchronized_at ?? undefined,
    hash: row.hash ?? undefined,
    metadata: parseMetadata(row.metadata)
  };
}

/**
 * Maps a database row to a LinkRelationship domain object.
 */
export function mapLinkRow(row: LinkRow): LinkRelationship {
  return {
    id: row.id,
    sourceId: row.source_id,
    targetId: row.target_id,
    kind: row.kind as LinkRelationshipKind,
    confidence: row.confidence,
    createdAt: row.created_at,
    createdBy: row.created_by
  } satisfies LinkRelationship;
}

/**
 * Maps a database row to an LlmEdgeProvenance domain object.
 */
export function mapLlmEdgeProvenanceRow(row: LlmEdgeProvenanceRow): LlmEdgeProvenance {
  return {
    linkId: row.link_id,
    templateId: row.template_id,
    templateVersion: row.template_version,
    promptHash: row.prompt_hash,
    modelId: row.model_id,
    issuedAt: row.issued_at,
    createdAt: row.created_at,
    confidenceTier: normalizeTier(row.confidence_tier),
    calibratedConfidence: row.calibrated_confidence,
    rawConfidence: typeof row.raw_confidence === "number" ? row.raw_confidence : undefined,
    diagnosticsEligible: row.diagnostics_eligible === 1,
    shadowed: row.shadowed === 1,
    supportingChunks: parseStringArray(row.supporting_chunks),
    promotionCriteria: parseStringArray(row.promotion_criteria),
    rationale: row.rationale ?? undefined
  } satisfies LlmEdgeProvenance;
}

/**
 * Maps a database row to a DiagnosticRecord domain object.
 */
export function mapDiagnosticRow(row: DiagnosticRow): DiagnosticRecord {
  return {
    id: row.id,
    artifactId: row.artifact_id,
    triggerArtifactId: row.trigger_artifact_id,
    changeEventId: row.change_event_id ?? "",
    message: row.message,
    severity: row.severity as DiagnosticRecord["severity"],
    status: row.status as DiagnosticStatus,
    createdAt: row.created_at,
    acknowledgedAt: row.acknowledged_at ?? undefined,
    acknowledgedBy: row.acknowledged_by ?? undefined,
    linkIds: parseLinkIds(row.link_ids),
    llmAssessment: parseLlmAssessment(row.llm_assessment)
  };
}

/**
 * Maps a database row to a DriftHistoryEntry domain object.
 */
export function mapDriftHistoryRow(row: DriftHistoryRow): DriftHistoryEntry {
  return {
    id: row.id,
    diagnosticId: row.diagnostic_id,
    changeEventId: row.change_event_id,
    triggerArtifactId: row.trigger_artifact_id,
    targetArtifactId: row.target_artifact_id,
    status: row.status as DriftHistoryStatus,
    severity: row.severity as DriftHistoryEntry["severity"],
    recordedAt: row.recorded_at,
    actor: row.actor ?? undefined,
    notes: row.notes ?? undefined,
    metadata: parseMetadata(row.metadata)
  };
}

/**
 * Parses a JSON string into a metadata record.
 */
export function parseMetadata(value: string | null): Record<string, unknown> | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

/**
 * Parses a JSON string into an array of link IDs.
 */
export function parseLinkIds(value: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Parses a JSON string into an LlmAssessment object.
 */
export function parseLlmAssessment(value: string | null): LlmAssessment | undefined {
  if (!value) {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }

  if (!parsed || typeof parsed !== "object") {
    return undefined;
  }

  const record = parsed as Record<string, unknown>;
  const summary = typeof record.summary === "string" ? record.summary : undefined;
  const confidence = typeof record.confidence === "number" ? record.confidence : undefined;
  const recommendedRaw = Array.isArray(record.recommendedActions)
    ? record.recommendedActions.filter((item): item is string => typeof item === "string")
    : [];

  if (!summary || confidence === undefined) {
    return undefined;
  }

  const normalized: LlmAssessment = {
    summary,
    confidence: Math.max(0, Math.min(1, confidence)),
    recommendedActions: recommendedRaw.slice(0, 10)
  };

  if (typeof record.generatedAt === "string") {
    normalized.generatedAt = record.generatedAt;
  }

  const model = record.model;
  if (model && typeof model === "object") {
    const modelRecord = model as Record<string, unknown>;
    const id = typeof modelRecord.id === "string" ? modelRecord.id : undefined;
    if (id) {
      normalized.model = {
        id,
        name: typeof modelRecord.name === "string" ? modelRecord.name : undefined,
        vendor: typeof modelRecord.vendor === "string" ? modelRecord.vendor : undefined,
        family: typeof modelRecord.family === "string" ? modelRecord.family : undefined,
        version: typeof modelRecord.version === "string" ? modelRecord.version : undefined
      };
    }
  }

  if (typeof record.promptHash === "string") {
    normalized.promptHash = record.promptHash;
  }

  if (typeof record.rawResponse === "string") {
    normalized.rawResponse = record.rawResponse;
  }

  if (record.tags && typeof record.tags === "object") {
    const tags = record.tags as Record<string, unknown>;
    const cleaned: Record<string, string> = {};
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value === "string") {
        cleaned[key] = value;
      }
    }
    if (Object.keys(cleaned).length > 0) {
      normalized.tags = cleaned;
    }
  }

  return normalized;
}

/**
 * Normalizes a confidence tier string to a valid tier value.
 */
export function normalizeTier(tier: string): "high" | "medium" | "low" {
  const normal = tier.toLowerCase();
  if (normal === "high" || normal === "medium" || normal === "low") {
    return normal;
  }
  return "low";
}

/**
 * Parses a JSON string into a string array.
 */
export function parseStringArray(value: string | null): string[] | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return undefined;
    }
    return (parsed as unknown[]).filter((item): item is string => typeof item === "string");
  } catch {
    return undefined;
  }
}
