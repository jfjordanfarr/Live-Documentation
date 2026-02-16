import type { ArtifactLayer } from "../../domain/artifacts";

/**
 * Returns `true` when the artifact layer represents a documentation tier
 * (vision, requirements, architecture) rather than code.
 *
 * Used by document-oriented heuristics (e.g. markdown) to restrict matching
 * to non-code artifacts.
 */
export function isDocumentLayer(layer: ArtifactLayer): boolean {
  return layer === "vision" || layer === "requirements" || layer === "architecture";
}

/**
 * Returns `true` when the artifact layer represents a code tier
 * (implementation or code). Used by language heuristics to restrict
 * matching to source files.
 */
export function isImplementationLayer(layer: ArtifactLayer): boolean {
  return layer === "implementation" || layer === "code";
}
