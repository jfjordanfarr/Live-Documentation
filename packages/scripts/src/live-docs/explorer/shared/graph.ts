import * as path from "path";

import type { LiveDocumentationConfig } from "@live-documentation/shared/config/liveDocumentationConfig";
import type { ParsedTypeReference } from "@live-documentation/shared/live-docs/parse";

import type {
    ExplorerGraphPayload,
    ExplorerLinkPayload,
    ExplorerNodePayload,
    ExplorerPublicSymbol,
    ExplorerTypeReference
} from "./types";
import {
    buildLiveDocGraph,
    type LiveDocGraph,
    type LiveDocGraphNode
} from "../../graph/liveDocGraph";

type InheritanceLinkKind = "extends" | "implements";

/**
 * Builds the full Explorer graph payload from the Live Doc graph,
 * including nodes, dependency/inheritance links, and statistics.
 */
export async function buildExplorerGraph(
    workspaceRoot: string,
    config?: LiveDocumentationConfig
): Promise<ExplorerGraphPayload> {
    const graph = await buildLiveDocGraph({ workspaceRoot, config });
    const nodes = Array.from(graph.nodes.values());

    const links: ExplorerLinkPayload[] = [];
    const seenLinks = new Set<string>();
    let missingDependencyCount = 0;

    const nodePayloads: ExplorerNodePayload[] = nodes.map(node => {
        const dependents = Array.from(graph.inbound.get(node.codePath) ?? []);

        const dependencyReferences = node.rawDependencies.map<ExplorerNodePayload["dependencies"][number]>(dep => {
            const targetId = dep.codePath;
            const targetNode = targetId ? graph.nodes.get(targetId) : undefined;
            const resolved = Boolean(targetNode);
            const label = dep.label || targetId || dep.raw;
            const kind: InheritanceLinkKind | "dependency" =
                dep.role === "extends" ? "extends" :
                dep.role === "implements" ? "implements" :
                "dependency";
            return {
                targetId: targetId,
                targetDocPath: targetNode?.docPath ?? dep.docPath,
                targetSymbol: dep.anchor,
                sourceSymbol: dep.sourceAnchor,
                label,
                raw: dep.raw,
                resolved,
                kind
            };
        });

        const missingDependencies = dependencyReferences.filter(reference => !reference.resolved);
        missingDependencyCount += missingDependencies.length;

        dependencyReferences
            .filter(reference => reference.resolved && reference.targetId)
            .forEach(reference => {
                addLink(node.codePath, reference.targetId!, reference.kind as InheritanceLinkKind | "dependency", {
                    sourceSymbol: reference.sourceSymbol,
                    targetSymbol: reference.targetSymbol
                });
            });

        // Build extended symbol information with type references
        const publicSymbolsExtended = buildPublicSymbolsExtended(node, graph);

        return {
            id: node.codePath,
            name: path.basename(node.codePath),
            codePath: node.codePath,
            codeRelativePath: toRelativePath(workspaceRoot, node.codePath),
            docPath: node.docPath,
            docRelativePath: toRelativePath(workspaceRoot, node.docPath),
            archetype: node.archetype,
            dependencies: dependencyReferences,
            dependents,
            missingDependencies,
            publicSymbols: node.publicSymbols,
            publicSymbolsExtended,
            symbolDocumentation: node.symbolDocumentation
        } satisfies ExplorerNodePayload;
    });

    // Create edges for type references (param/return types that reference other files)
    // These enable connections to be drawn from the providing file to the consuming symbol
    // Note: extends/implements flow through rawDependencies above with correct link kinds
    for (const nodePayload of nodePayloads) {
        if (!nodePayload.publicSymbolsExtended) continue;
        
        for (const symbol of nodePayload.publicSymbolsExtended) {
            if (!symbol.typeReferences) continue;
            
            for (const typeRef of symbol.typeReferences) {
                if (!typeRef.isResolved || !typeRef.targetId) continue;
                
                // Skip extends/implements — they're routed through rawDependencies
                // with their own link kind (pink/gold styling in the visualizer)
                if (typeRef.role === "extends" || typeRef.role === "implements") continue;
                
                // Create an edge from the target file to this file
                // Direction: target provides the type, this file's symbol consumes it
                addLink(nodePayload.id, typeRef.targetId, "type-reference", {
                    sourceSymbol: symbol.name,
                    targetSymbol: typeRef.typeName
                });
            }
        }
    }

    return {
        nodes: nodePayloads,
        links,
        stats: {
            nodes: nodePayloads.length,
            links: links.length,
            missingDependencies: missingDependencyCount
        }
    } satisfies ExplorerGraphPayload;

    function addLink(
        source: string,
        target: string,
        kind: InheritanceLinkKind | "dependency" | "type-reference",
        metadata?: { sourceSymbol?: string; targetSymbol?: string }
    ) {
        if (source === target) {
            return;
        }
        if (!graph.nodes.has(source) || !graph.nodes.has(target)) {
            return;
        }
        const key = `${source}|${target}|${kind}|${metadata?.sourceSymbol ?? ""}|${metadata?.targetSymbol ?? ""}`;
        if (seenLinks.has(key)) {
            return;
        }
        seenLinks.add(key);
        links.push({
            source,
            target,
            kind,
            sourceSymbol: metadata?.sourceSymbol,
            targetSymbol: metadata?.targetSymbol
        });
    }
}

/** Resolves a doc-relative path to an absolute, normalised file-system path. */
export function normalizeDocPath(workspaceRoot: string, targetPath: string): string {
    const absolute = path.isAbsolute(targetPath)
        ? targetPath
        : path.resolve(workspaceRoot, targetPath);
    return path.normalize(absolute);
}

function toRelativePath(workspaceRoot: string, absolutePath: string): string {
    const relative = path.relative(workspaceRoot, absolutePath);
    const normalized = relative.replace(/\\/g, "/");
    return normalized || ".";
}

/**
 * Builds extended symbol information with resolved type references.
 *
 * @param node The Live Doc graph node to process.
 * @param graph The full Live Doc graph for resolving type reference targets.
 * @returns Array of extended symbol objects with type references.
 */
function buildPublicSymbolsExtended(
    node: LiveDocGraphNode,
    graph: LiveDocGraph
): ExplorerPublicSymbol[] {
    const extended: ExplorerPublicSymbol[] = [];
    const docDir = path.dirname(node.docPath);

    for (const symbolName of node.publicSymbols) {
        const docEntry = node.symbolDocumentation[symbolName];
        const parsedTypeRefs = (docEntry as { typeReferences?: ParsedTypeReference[] })?.typeReferences;

        if (!parsedTypeRefs || parsedTypeRefs.length === 0) {
            // No type references — include symbol without extended info
            extended.push({ name: symbolName });
            continue;
        }

        // Convert ParsedTypeReference to ExplorerTypeReference, resolving targets
        const typeReferences: ExplorerTypeReference[] = parsedTypeRefs.map(ref => {
            let targetId: string | undefined;

            if (ref.isResolved && ref.targetDocPath) {
                // Join the relative doc path with the current doc's directory,
                // then normalize to collapse ../.. segments.
                // Use path.join (NOT path.resolve) to preserve relative paths.
                const joinedDocPath = path.join(docDir, ref.targetDocPath);
                const normalizedDocPath = path.normalize(joinedDocPath);
                
                // Try to resolve the doc path to a code path via the graph
                targetId = graph.docToCode.get(normalizedDocPath);

                // If not found with normalized path, try case-insensitive match on Windows
                if (!targetId) {
                    for (const [docPath, codePath] of graph.docToCode.entries()) {
                        if (path.normalize(docPath).toLowerCase() === normalizedDocPath.toLowerCase()) {
                            targetId = codePath;
                            break;
                        }
                    }
                }
            }

            return {
                typeName: ref.typeName,
                role: ref.role,
                parameterName: ref.parameterName,
                isResolved: ref.isResolved && Boolean(targetId),
                targetId,
                targetAnchor: ref.targetAnchor
            };
        });

        extended.push({
            name: symbolName,
            typeReferences
        });
    }

    return extended;
}
