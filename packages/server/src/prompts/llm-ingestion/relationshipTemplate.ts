import { createHash } from "node:crypto";

import type { ArtifactLayer, LinkRelationshipKind } from "@live-documentation/shared";

export type ConfidenceLabel = "high" | "medium" | "low";

export interface PromptArtifactSummary {
  id: string;
  uri: string;
  layer: ArtifactLayer;
  title?: string;
  description?: string;
}

export interface PromptChunkSummary {
  id: string;
  startLine: number;
  endLine: number;
  hash: string;
  text: string;
  summary?: string;
}

export interface RelationshipPromptOptions {
  templateVersion?: string;
  rootArtifact: PromptArtifactSummary;
  knownArtifacts: PromptArtifactSummary[];
  chunks: PromptChunkSummary[];
  allowedRelationshipKinds: LinkRelationshipKind[];
  now?: () => Date;
}

export interface RenderedRelationshipPrompt {
  templateId: string;
  templateVersion: string;
  promptText: string;
  promptHash: string;
  issuedAt: string;
}

const TEMPLATE_ID = "live-documentation.llm-ingestion.v1";
const DEFAULT_TEMPLATE_VERSION = "2025-10-24";

export function renderRelationshipExtractionPrompt(
  options: RelationshipPromptOptions
): RenderedRelationshipPrompt {
  const templateVersion = options.templateVersion ?? DEFAULT_TEMPLATE_VERSION;
  const issuedAt = (options.now ?? (() => new Date()))().toISOString();

  const lines: string[] = [];
  lines.push(`# Task\n`);
  lines.push(
    "You analyse workspace artifacts and emit cross-file relationship candidates in JSON. Only emit relationships that the provided evidence supports."
  );
  lines.push("Use the allowed relationship kinds exactly as written; do not invent new kinds.");
  lines.push("Provide rationales that cite chunk ids so humans can audit the inference.\n");

  lines.push(`# Root Artifact\n`);
  lines.push(`- id: ${options.rootArtifact.id}`);
  lines.push(`- uri: ${options.rootArtifact.uri}`);
  lines.push(`- layer: ${options.rootArtifact.layer}`);
  if (options.rootArtifact.title) {
    lines.push(`- title: ${options.rootArtifact.title}`);
  }
  if (options.rootArtifact.description) {
    lines.push(`- description: ${options.rootArtifact.description}`);
  }
  lines.push("");

  if (options.knownArtifacts.length > 0) {
    lines.push(`# Known Artifacts\n`);
    for (const artifact of options.knownArtifacts) {
      const title = artifact.title ? ` (${artifact.title})` : "";
      lines.push(`- ${artifact.id}: ${artifact.uri}${title} [layer=${artifact.layer}]`);
    }
    lines.push("");
  }

  lines.push(`# Allowed Relationship Kinds\n`);
  lines.push(options.allowedRelationshipKinds.map(kind => `- ${kind}`).join("\n"));
  lines.push("");

  lines.push(`# Artifact Chunks\n`);
  for (const chunk of options.chunks) {
    lines.push(`## Chunk ${chunk.id}`);
    lines.push(`Lines: ${chunk.startLine}-${chunk.endLine}`);
    lines.push(`Hash: ${chunk.hash}`);
    if (chunk.summary) {
      lines.push(`Summary: ${chunk.summary}`);
    }
    lines.push("```");
    lines.push(chunk.text);
    lines.push("```");
    lines.push("");
  }

  lines.push(`# Output JSON schema\n`);
  lines.push("{");
  lines.push('  "metadata": {');
  lines.push(`    "templateId": "${TEMPLATE_ID}",`);
  lines.push(`    "templateVersion": "${templateVersion}"`);
  lines.push("  },");
  lines.push('  "relationships": [');
  lines.push(
    '    {"sourceId": "<artifact id>", "targetId": "<artifact id>", "relationship": "depends_on|implements|documents|references", "confidence": 0.0-1.0, "confidenceLabel": "high|medium|low", "rationale": "<why>", "supportingChunks": ["chunk-id", ...]}'
  );
  lines.push('  ]');
  lines.push("}");
  lines.push("");
  lines.push(
    "Return ONLY valid JSON. If no relationships are justified, respond with `{ \"metadata\": { ... }, \"relationships\": [] }`."
  );

  const promptText = lines.join("\n");
  const promptHash = createHash("sha256").update(promptText).digest("hex").slice(0, 16);

  return {
    templateId: TEMPLATE_ID,
    templateVersion,
    promptText,
    promptHash,
    issuedAt
  } satisfies RenderedRelationshipPrompt;
}

export const RELATIONSHIP_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["metadata", "relationships"],
  properties: {
    metadata: {
      type: "object",
      additionalProperties: false,
      required: ["templateId", "templateVersion"],
      properties: {
        templateId: { const: TEMPLATE_ID },
        templateVersion: { type: "string" }
      }
    },
    relationships: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sourceId", "targetId", "relationship"],
        properties: {
          sourceId: { type: "string", minLength: 1 },
          targetId: { type: "string", minLength: 1 },
          relationship: {
            type: "string",
            enum: ["documents", "implements", "depends_on", "references", "includes"]
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1
          },
          confidenceLabel: {
            type: "string",
            enum: ["high", "medium", "low"]
          },
          rationale: {
            type: "string"
          },
          supportingChunks: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    }
  }
} as const;
