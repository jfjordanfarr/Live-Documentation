import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import { z } from "zod";

import {
  COLLECT_WORKSPACE_SYMBOLS_REQUEST,
  type ArtifactSeed,
  type LinkEvidence,
  type RelationshipHint,
  type WorkspaceLinkContribution
} from "@live-documentation/shared";

const SUPPORTED_LANGUAGES = new Set([
  "typescript",
  "javascript",
  "typescriptreact",
  "javascriptreact",
  "ts",
  "js"
]);

const MAX_SYMBOLS_PER_FILE = 40;
const MAX_REFERENCES_PER_SYMBOL = 25;
const MAX_TOTAL_REFERENCES = 400;
const DEFAULT_MAX_SEEDS = 40;
const EVIDENCE_CONFIDENCE = 0.92;
const HINT_CONFIDENCE = 0.85;
const CREATED_BY = "workspace-symbols";

const ArtifactLayerSchema = z.enum(["vision", "requirements", "architecture", "implementation", "code"]);

const ArtifactSeedSchema: z.ZodType<ArtifactSeed> = z.object({
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

const CollectWorkspaceSymbolsParamsSchema = z.object({
  seeds: z.array(ArtifactSeedSchema),
  maxSeeds: z.number().int().positive().optional()
});

type SymbolBridgeParams = z.infer<typeof CollectWorkspaceSymbolsParamsSchema>;

interface SymbolBridgeSummary {
  filesAnalyzed: number;
  symbolsVisited: number;
  referencesResolved: number;
  durationMs: number;
}

interface SymbolBridgeResult {
  contribution: WorkspaceLinkContribution;
  summary: SymbolBridgeSummary;
}

interface SymbolEntry {
  name: string;
  position: vscode.Position;
  kind: vscode.SymbolKind;
}

export function registerSymbolBridge(client: LanguageClient): vscode.Disposable {
  const analyzer = new SymbolBridgeAnalyzer();

  const requestMethod = String(COLLECT_WORKSPACE_SYMBOLS_REQUEST);

  return client.onRequest(requestMethod, async (rawParams: unknown, token: vscode.CancellationToken) => {
    const params = CollectWorkspaceSymbolsParamsSchema.parse(rawParams);
    return analyzer.collect(params, token);
  });
}

export class SymbolBridgeAnalyzer {
  async collect(
    params: SymbolBridgeParams,
    token?: vscode.CancellationToken
  ): Promise<SymbolBridgeResult> {
    const start = Date.now();
    const eligibleSeeds = this.selectSeeds(params);
    const seedUris = new Set<string>(eligibleSeeds.map(seed => seed.uri));

    const additionalSeeds: ArtifactSeed[] = [];
    const additionalSeedUris = new Set<string>();
    const evidences: LinkEvidence[] = [];
    const hints: RelationshipHint[] = [];
    const visitedFiles = new Set<string>();
    const processedPairs = new Set<string>();

    let filesAnalyzed = 0;
    let symbolsVisited = 0;
    let referencesResolved = 0;

    for (const seed of eligibleSeeds) {
      if (token?.isCancellationRequested) {
        break;
      }

      const normalizedUri = normalizeUri(seed.uri);
      if (visitedFiles.has(normalizedUri)) {
        continue;
      }

      visitedFiles.add(normalizedUri);

      let document: vscode.TextDocument;
      try {
        document = await vscode.workspace.openTextDocument(vscode.Uri.parse(seed.uri));
      } catch (error) {
        console.warn(`[symbolBridge] Failed to open ${seed.uri}: ${describeError(error)}`);
        continue;
      }

      if (!SUPPORTED_LANGUAGES.has((document.languageId ?? seed.language ?? "").toLowerCase())) {
        continue;
      }

      filesAnalyzed += 1;

      let symbolEntries: SymbolEntry[];
      try {
        symbolEntries = await this.loadDocumentSymbols(document);
      } catch (error) {
        console.warn(`[symbolBridge] Failed to load symbols for ${seed.uri}: ${describeError(error)}`);
        continue;
      }

      for (const entry of symbolEntries) {
        if (token?.isCancellationRequested) {
          break;
        }

        symbolsVisited += 1;
        const references = await this.loadReferences(document.uri, entry.position);
        if (!references?.length) {
          continue;
        }

        let processedForSymbol = 0;
        for (const reference of references) {
          if (token?.isCancellationRequested) {
            break;
          }

          if (!isWorkspaceFile(reference.uri)) {
            continue;
          }

          const referenceUri = normalizeUri(reference.uri.toString());
          if (referenceUri === normalizedUri) {
            continue;
          }

          const pairKey = `${referenceUri}->${normalizedUri}`;
          if (processedPairs.has(pairKey)) {
            continue;
          }

          processedPairs.add(pairKey);
          processedForSymbol += 1;
          referencesResolved += 1;

          evidences.push({
            sourceUri: referenceUri,
            targetUri: normalizedUri,
            kind: "depends_on",
            confidence: EVIDENCE_CONFIDENCE,
            rationale: `Language server reference to ${entry.name}`,
            createdBy: CREATED_BY
          });

          hints.push({
            sourceUri: referenceUri,
            targetUri: normalizedUri,
            kind: "depends_on",
            confidence: HINT_CONFIDENCE,
            rationale: `Reference to ${entry.name}`
          });

          if (!seedUris.has(referenceUri) && !additionalSeedUris.has(referenceUri)) {
            const seedLanguage = await this.resolveLanguage(reference.uri);
            additionalSeeds.push({
              uri: referenceUri,
              layer: "code",
              language: seedLanguage ?? undefined
            });
            additionalSeedUris.add(referenceUri);
          }

          if (processedForSymbol >= MAX_REFERENCES_PER_SYMBOL) {
            break;
          }

          if (referencesResolved >= MAX_TOTAL_REFERENCES) {
            break;
          }
        }

        if (referencesResolved >= MAX_TOTAL_REFERENCES) {
          break;
        }
      }

      if (referencesResolved >= MAX_TOTAL_REFERENCES) {
        break;
      }
    }

    const contribution: WorkspaceLinkContribution = {
      seeds: additionalSeeds.length ? additionalSeeds : undefined,
      hints: hints.length ? hints : undefined,
      evidences: evidences.length ? evidences : undefined
    };

    const summary: SymbolBridgeSummary = {
      filesAnalyzed,
      symbolsVisited,
      referencesResolved,
      durationMs: Date.now() - start
    };

    return { contribution, summary };
  }

  private selectSeeds(
    params: SymbolBridgeParams
  ): ArtifactSeed[] {
    const limit = Math.max(1, params.maxSeeds ?? DEFAULT_MAX_SEEDS);
    const selected: ArtifactSeed[] = [];
    const seen = new Set<string>();

    for (const seed of params.seeds) {
      if (selected.length >= limit) {
        break;
      }

      const normalizedUri = normalizeUri(seed.uri);
      if (seen.has(normalizedUri)) {
        continue;
      }

      const language = seed.language?.toLowerCase();
      if (language && !SUPPORTED_LANGUAGES.has(language)) {
        continue;
      }

      seen.add(normalizedUri);
      selected.push({ ...seed, uri: normalizedUri });
    }

    return selected;
  }

  private async loadDocumentSymbols(document: vscode.TextDocument): Promise<SymbolEntry[]> {
    const result = await vscode.commands.executeCommand<(vscode.DocumentSymbol | vscode.SymbolInformation)[]>(
      "vscode.executeDocumentSymbolProvider",
      document.uri
    );

    return extractSymbols(result);
  }

  private async loadReferences(uri: vscode.Uri, position: vscode.Position): Promise<vscode.Location[] | undefined> {
    try {
      const references = await vscode.commands.executeCommand<vscode.Location[]>(
        "vscode.executeReferenceProvider",
        uri,
        position
      );
      return references ?? [];
    } catch (error) {
      console.warn(`[symbolBridge] Failed to load references for ${uri.toString()}: ${describeError(error)}`);
      return [];
    }
  }

  private async resolveLanguage(uri: vscode.Uri): Promise<string | undefined> {
    const existing = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
    if (existing) {
      return existing.languageId;
    }

    try {
      const document = await vscode.workspace.openTextDocument(uri);
      return document.languageId;
    } catch {
      return undefined;
    }
  }
}

function extractSymbols(
  result: (vscode.DocumentSymbol | vscode.SymbolInformation)[] | undefined
): SymbolEntry[] {
  if (!result || result.length === 0) {
    return [];
  }

  if (isDocumentSymbolArray(result)) {
    const entries: SymbolEntry[] = [];
    for (const symbol of result) {
      flattenDocumentSymbol(symbol, 0, entries);
    }
    return entries.slice(0, MAX_SYMBOLS_PER_FILE);
  }

  return (result as vscode.SymbolInformation[])
    .map(info => ({ name: info.name, position: info.location.range.start, kind: info.kind }))
    .filter(entry => shouldIncludeKind(entry.kind))
    .slice(0, MAX_SYMBOLS_PER_FILE);
}

function flattenDocumentSymbol(symbol: vscode.DocumentSymbol, depth: number, entries: SymbolEntry[]): void {
  if (depth === 0 && shouldIncludeKind(symbol.kind)) {
    entries.push({ name: symbol.name, position: symbol.selectionRange.start, kind: symbol.kind });
  }

  if (depth >= 1) {
    return;
  }

  for (const child of symbol.children) {
    flattenDocumentSymbol(child, depth + 1, entries);
  }
}

function shouldIncludeKind(kind: vscode.SymbolKind): boolean {
  switch (kind) {
    case vscode.SymbolKind.Class:
    case vscode.SymbolKind.Function:
    case vscode.SymbolKind.Method:
    case vscode.SymbolKind.Variable:
    case vscode.SymbolKind.Interface:
    case vscode.SymbolKind.Property:
    case vscode.SymbolKind.Enum:
    case vscode.SymbolKind.Namespace:
    case vscode.SymbolKind.Module:
      return true;
    default:
      return false;
  }
}

function isDocumentSymbolArray(
  value: (vscode.DocumentSymbol | vscode.SymbolInformation)[]
): value is vscode.DocumentSymbol[] {
  return value.length > 0 && value[0] instanceof vscode.DocumentSymbol;
}

function normalizeUri(uri: string): string {
  return vscode.Uri.parse(uri).toString();
}

function isWorkspaceFile(uri: vscode.Uri): boolean {
  if (uri.scheme !== "file") {
    return false;
  }

  if (uri.fsPath.includes("node_modules")) {
    return false;
  }

  return Boolean(vscode.workspace.getWorkspaceFolder(uri));
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
