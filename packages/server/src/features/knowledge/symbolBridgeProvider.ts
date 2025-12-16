import { Connection } from "vscode-languageserver/node";
import { z } from "zod";

import {
  COLLECT_WORKSPACE_SYMBOLS_REQUEST,
  CollectWorkspaceSymbolsParams,
  type WorkspaceLinkProvider
} from "@live-documentation/shared";

interface SymbolBridgeProviderOptions {
  connection: Connection;
  logger?: {
    info(message: string): void;
    warn(message: string): void;
  };
  maxSeeds?: number;
}

export function createSymbolBridgeProvider(options: SymbolBridgeProviderOptions): WorkspaceLinkProvider {
  return {
    id: "workspace-symbols",
    label: "Workspace Symbol Bridge",
    async collect(context) {
      if (!context.seeds.length) {
        return null;
      }

      const params: CollectWorkspaceSymbolsParams = {
        seeds: context.seeds,
        maxSeeds: options.maxSeeds
      };

      try {
        const sendCollectSymbolsRequest = options.connection.sendRequest.bind(
          options.connection
        ) as (
          type: string,
          parameters: CollectWorkspaceSymbolsParams
        ) => Promise<unknown>;

        const requestIdentifier = String(COLLECT_WORKSPACE_SYMBOLS_REQUEST);
        const rawResult = await sendCollectSymbolsRequest(requestIdentifier, params);

        if (!rawResult) {
          options.logger?.warn?.(
            `[symbol-bridge] Request returned no contribution for ${context.seeds.length} seed(s)`
          );
          return null;
        }

        let parsed: z.infer<typeof CollectWorkspaceSymbolsResultSchema>;
        try {
          parsed = CollectWorkspaceSymbolsResultSchema.parse(rawResult);
        } catch (error) {
          options.logger?.warn?.(
            `[symbol-bridge] Invalid contribution payload: ${describeParseError(error)}`
          );
          throw error;
        }

        if (parsed.summary) {
          options.logger?.info?.(
            `[symbol-bridge] analyzed ${parsed.summary.filesAnalyzed} file(s), ` +
              `${parsed.summary.symbolsVisited} symbol(s), ` +
              `${parsed.summary.referencesResolved} reference(s)`
          );
        }

        const contribution = parsed.contribution;
        return {
          seeds: contribution.seeds,
          hints: contribution.hints,
          evidences: contribution.evidences
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        options.logger?.warn?.(`[symbol-bridge] request failed: ${message}`);
        throw error;
      }
    }
  };
}

const ArtifactLayerSchema = z.enum(["vision", "requirements", "architecture", "implementation", "code"]);
const LinkRelationshipKindSchema = z.enum([
  "documents",
  "implements",
  "depends_on",
  "references",
  "includes"
]);

const ArtifactSeedSchema = z.object({
  id: z.string().optional(),
  uri: z.string(),
  layer: ArtifactLayerSchema,
  language: z.string().optional(),
  owner: z.string().optional(),
  hash: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  lastSynchronizedAt: z.string().optional(),
  content: z.string().optional()
});

const RelationshipHintSchema = z.object({
  sourceUri: z.string(),
  targetUri: z.string(),
  kind: LinkRelationshipKindSchema.optional(),
  confidence: z.number().optional(),
  rationale: z.string().optional()
});

const LinkEvidenceSchema = z.object({
  sourceUri: z.string(),
  targetUri: z.string(),
  kind: LinkRelationshipKindSchema.optional(),
  confidence: z.number().optional(),
  rationale: z.string().optional(),
  createdBy: z.string().optional()
});

const WorkspaceLinkContributionSchema = z.object({
  seeds: z.array(ArtifactSeedSchema).optional(),
  hints: z.array(RelationshipHintSchema).optional(),
  evidences: z.array(LinkEvidenceSchema).optional()
});

const CollectWorkspaceSymbolsResultSchema = z.object({
  contribution: WorkspaceLinkContributionSchema,
  summary: z
    .object({
      filesAnalyzed: z.number(),
      symbolsVisited: z.number(),
      referencesResolved: z.number(),
      durationMs: z.number()
    })
    .optional()
});

function describeParseError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues
      .map(issue => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join(", ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
