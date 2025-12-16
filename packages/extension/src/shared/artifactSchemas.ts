import { z } from "zod";

export const ArtifactLayerSchema = z.enum([
  "vision",
  "requirements",
  "architecture",
  "implementation",
  "code"
]);

export type ArtifactLayer = z.infer<typeof ArtifactLayerSchema>;

export const KnowledgeArtifactSchema = z.object({
  id: z.string(),
  uri: z.string().min(1),
  layer: ArtifactLayerSchema,
  language: z.string().optional(),
  owner: z.string().optional(),
  lastSynchronizedAt: z.string().optional(),
  hash: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export type KnowledgeArtifact = z.infer<typeof KnowledgeArtifactSchema>;

export const LinkRelationshipKindSchema = z.enum([
  "documents",
  "implements",
  "depends_on",
  "references",
  "includes"
]);

export type LinkRelationshipKind = z.infer<typeof LinkRelationshipKindSchema>;
