/**
 * The four progressive MDMD documentation layers, plus `"code"` for
 * raw implementation artifacts.
 *
 * Values align with the Membrane Design MarkDown (MDMD) layering
 * convention defined in copilot-instructions:
 *
 * - `"vision"` — Layer 1: what we're trying to accomplish
 * - `"requirements"` — Layer 2: what must be done
 * - `"architecture"` — Layer 3: how it will be accomplished
 * - `"implementation"` — Layer 4: what has been accomplished so far
 * - `"code"` — raw source files tracked by Live Documentation
 *
 * Created 2025-10-16 (commit `6bccf94`).
 */
export type ArtifactLayer =
  | "vision"
  | "requirements"
  | "architecture"
  | "implementation"
  | "code";

/**
 * A single tracked workspace artifact in the knowledge graph.
 *
 * Every file the system discovers — code, documentation, config, asset —
 * becomes a `KnowledgeArtifact`.  The {@link id} is typically a
 * workspace-relative path, and {@link layer} classifies it within the
 * MDMD hierarchy.
 *
 * @remarks
 * Originally created 2025-10-16 (commit `6bccf94`).  The `hash` and
 * `lastSynchronizedAt` fields were added 2025-10-26 for incremental
 * sync support but are currently unused — they remain as forward hooks
 * for the planned diffing pipeline.
 */
export interface KnowledgeArtifact {
  id: string;
  uri: string;
  layer: ArtifactLayer;
  language?: string;
  owner?: string;
  lastSynchronizedAt?: string;
  hash?: string;
  metadata?: Record<string, unknown>;
}

/**
 * The set of relationship kinds between two knowledge artifacts.
 *
 * Used by {@link LinkRelationship} and downstream edge resolution in
 * both the Live Documentation generator and the fallback heuristic
 * inference pipeline.
 */
export type LinkRelationshipKind =
  | "documents"
  | "implements"
  | "depends_on"
  | "references"
  | "includes";

/**
 * A directed edge between two {@link KnowledgeArtifact}s in the
 * knowledge graph.
 *
 * Edges are created by the LLM ingestion pipeline, the fallback
 * heuristic inference engine, or by explicit link declarations in
 * Live Documentation markdown.
 *
 * @remarks
 * Created 2025-10-16 (commit `6bccf94`).  The `confidence` field
 * ranges 0–1 and is set by the creating pipeline (LLM calibrator,
 * heuristic scorer, or 1.0 for explicit declarations).
 */
export interface LinkRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  kind: LinkRelationshipKind;
  confidence: number;
  createdAt: string;
  createdBy: string;
}
