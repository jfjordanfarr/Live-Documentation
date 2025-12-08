import * as fs from "node:fs/promises";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

import {
  ArtifactSeed,
  LinkEvidence,
  RelationshipHint,
  WorkspaceLinkContribution,
  WorkspaceLinkProvider
} from "@live-documentation/shared";

import {
  scanDirectory,
  shouldSkipPath,
  isLikelyBinaryFile
} from "./directoryScanner";
import { extractImportEvidences } from "./importEvidenceExtractor";
import {
  DEFAULT_CODE_EXTENSIONS,
  DEFAULT_DOC_EXTENSIONS,
  inferLanguage,
  inferDocLanguage,
  looksLikeDocsPath,
  inferDocumentLayer
} from "./languageInference";
import { extractLinkHints, extractPathReferenceHints, LinkHintContext } from "./linkHintExtractor";
import {
  extractMdmdDocumentDetails,
  createMdmdMetadataHints,
  extractDocumentSymbolReferences
} from "./mdmdParser";
import { extractExportedSymbols } from "./tsSymbolExtractor";

// Re-export types for consumers
export { ExportedSymbolKind, ExportedSymbolMetadata } from "./tsSymbolExtractor";
export { DocumentSymbolReferenceMetadata, MdmdDocumentDetails } from "./mdmdParser";
export { DEFAULT_CODE_EXTENSIONS, DEFAULT_DOC_EXTENSIONS } from "./languageInference";

interface WorkspaceIndexProviderOptions {
  rootPath: string;
  implementationGlobs?: string[];
  documentationGlobs?: string[];
  scriptGlobs?: string[];
  logger?: {
    info(message: string): void;
  };
}

/**
 * Lightweight workspace indexer that seeds implementation artifacts so markdown linkage heuristics
 * have viable candidates. Intended primarily for integration and dogfooding scenarios.
 */
export function createWorkspaceIndexProvider(options: WorkspaceIndexProviderOptions): WorkspaceLinkProvider {
  const normalizedRoot = path.resolve(options.rootPath);

  return {
    id: "workspace-index",
    label: "Workspace Implementation Index",
    async collect(): Promise<WorkspaceLinkContribution> {
      const seeds: ArtifactSeed[] = [];
      const hints: RelationshipHint[] = [];
      const evidences: LinkEvidence[] = [];
      const implTargets = options.implementationGlobs ?? ["src"];
      const docTargets = options.documentationGlobs ?? [
        "docs",
        "specs",
        "templates",
        "config",
        ".mdmd",
        ".live-documentation",
        "README.md"
      ];
      const scriptTargets = options.scriptGlobs ?? ["scripts"];

      // Implementation/code
      for (const target of implTargets) {
        const absolute = path.resolve(normalizedRoot, target);
        await scanDirectory(absolute, async (filePath) => {
          if (shouldSkipPath(filePath)) return;
          const ext = path.extname(filePath).toLowerCase();
          if (!DEFAULT_CODE_EXTENSIONS.has(ext)) return;

          try {
            if (await isLikelyBinaryFile(filePath)) return;
            const content = await fs.readFile(filePath, "utf8");
            const uri = pathToFileURL(filePath).toString();

            const exportedSymbols = extractExportedSymbols(filePath, content);
            const metadata: Record<string, unknown> | undefined = exportedSymbols.length
              ? { exportedSymbols }
              : undefined;

            seeds.push({
              uri,
              layer: "code",
              language: inferLanguage(filePath),
              content,
              metadata
            });

            const context: LinkHintContext = {
              content,
              sourceFile: filePath,
              sourceUri: uri,
              workspaceRoot: normalizedRoot
            };

            const directiveHints = await extractLinkHints(context);
            hints.push(...directiveHints);

            const pathHints = await extractPathReferenceHints(context);
            hints.push(...pathHints);

            const importEvidences = await extractImportEvidences({
              content,
              sourceFile: filePath,
              sourceUri: uri,
              workspaceRoot: normalizedRoot
            });
            evidences.push(...importEvidences);
          } catch {
            // ignore
          }
        });
      }

      // Documentation/templates (as requirements layer)
      for (const target of docTargets) {
        const absolute = path.resolve(normalizedRoot, target);
        await scanDirectory(absolute, async (filePath) => {
          if (shouldSkipPath(filePath)) return;
          const ext = path.extname(filePath).toLowerCase();
          if (!DEFAULT_DOC_EXTENSIONS.has(ext) && !looksLikeDocsPath(filePath)) return;

          try {
            if (await isLikelyBinaryFile(filePath)) return;
            const content = await fs.readFile(filePath, "utf8");
            const uri = pathToFileURL(filePath).toString();

            const mdmdDetails = extractMdmdDocumentDetails(content);
            const symbolReferences = extractDocumentSymbolReferences(content, mdmdDetails);

            const metadataParts: Record<string, unknown> = {};
            if (symbolReferences.length) {
              metadataParts.symbolReferences = symbolReferences;
            }

            if (
              mdmdDetails.layer ||
              mdmdDetails.identifier ||
              mdmdDetails.identifiers.length ||
              mdmdDetails.codePaths.length ||
              mdmdDetails.exports.length ||
              mdmdDetails.sectionSymbols.length
            ) {
              metadataParts.mdmd = {
                layer: mdmdDetails.layer,
                identifier: mdmdDetails.identifier,
                identifiers: mdmdDetails.identifiers,
                codePaths: mdmdDetails.codePaths,
                exports: mdmdDetails.exports,
                sectionSymbols: mdmdDetails.sectionSymbols
              };
            }

            const metadata = Object.keys(metadataParts).length > 0 ? metadataParts : undefined;

            seeds.push({
              uri,
              layer: inferDocumentLayer(mdmdDetails.layer, filePath),
              language: inferDocLanguage(filePath),
              content,
              metadata
            });

            const context: LinkHintContext = {
              content,
              sourceFile: filePath,
              sourceUri: uri,
              workspaceRoot: normalizedRoot
            };

            const directiveHints = await extractLinkHints(context);
            hints.push(...directiveHints);

            const pathHints = await extractPathReferenceHints(context);
            hints.push(...pathHints);

            const metadataHints = await createMdmdMetadataHints(mdmdDetails, context);
            hints.push(...metadataHints);
          } catch {
            // ignore
          }
        });
      }

      // Scripts (outside src) as code
      for (const target of scriptTargets) {
        const absolute = path.resolve(normalizedRoot, target);
        await scanDirectory(absolute, async (filePath) => {
          if (shouldSkipPath(filePath)) return;
          const ext = path.extname(filePath).toLowerCase();
          if (!DEFAULT_CODE_EXTENSIONS.has(ext)) return;

          try {
            if (await isLikelyBinaryFile(filePath)) return;
            const content = await fs.readFile(filePath, "utf8");
            const uri = pathToFileURL(filePath).toString();

            const exportedSymbols = extractExportedSymbols(filePath, content);
            const metadata: Record<string, unknown> | undefined = exportedSymbols.length
              ? { exportedSymbols }
              : undefined;

            seeds.push({
              uri,
              layer: "code",
              language: inferLanguage(filePath),
              content,
              metadata
            });

            const pathHints = await extractPathReferenceHints({
              content,
              sourceFile: filePath,
              sourceUri: uri,
              workspaceRoot: normalizedRoot
            });
            hints.push(...pathHints);

            const importEvidences = await extractImportEvidences({
              content,
              sourceFile: filePath,
              sourceUri: uri,
              workspaceRoot: normalizedRoot
            });
            evidences.push(...importEvidences);
          } catch {
            // ignore
          }
        });
      }

      const allTargets = [...implTargets, ...docTargets, ...scriptTargets];
      options.logger?.info(
        `[workspace-index] collected ${seeds.length} seed(s), ${hints.length} hint(s), and ${evidences.length} evidence link(s) from ${allTargets.join(",")}`
      );
      return { seeds, hints, evidences };
    }
  };
}
