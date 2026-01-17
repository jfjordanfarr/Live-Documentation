import type { KnowledgeArtifact } from "@live-documentation/shared/domain/artifacts";
import type { RelationshipHint } from "@live-documentation/shared/inference/fallbackInference";

export type RippleHint = RelationshipHint & {
  depth?: number;
  path?: string[];
};

export interface RippleImpact {
  target: KnowledgeArtifact;
  hint: RippleHint;
}
