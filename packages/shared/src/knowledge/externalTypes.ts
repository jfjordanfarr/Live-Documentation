/**
 * External data types for consuming LSIF, SCIP, or other external knowledge feeds.
 * These are Data Transfer Objects (DTOs) - pure type definitions with no dependencies.
 */

import type { ArtifactLayer, LinkRelationshipKind } from "../domain/artifacts";

export interface ExternalArtifact {
  id: string;
  uri: string;
  layer: ArtifactLayer;
  language?: string;
  owner?: string;
  lastSynchronizedAt?: string;
  hash?: string;
  metadata?: Record<string, unknown>;
}

export interface ExternalLink {
  id?: string;
  sourceId: string;
  targetId: string;
  kind: LinkRelationshipKind;
  confidence?: number;
  createdAt?: string;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

export interface ExternalSnapshot {
  id?: string;
  label: string;
  createdAt?: string;
  artifacts: ExternalArtifact[];
  links: ExternalLink[];
  metadata?: Record<string, unknown>;
}

export type StreamEventKind =
  | "artifact-upsert"
  | "artifact-remove"
  | "link-upsert"
  | "link-remove";

export interface ExternalStreamEvent {
  kind: StreamEventKind;
  sequenceId: string;
  detectedAt: string;
  artifact?: ExternalArtifact;
  artifactId?: string;
  link?: ExternalLink;
  linkId?: string;
  metadata?: Record<string, unknown>;
}

export interface StreamCheckpoint {
  lastSequenceId: string;
  updatedAt: string;
}
