import * as fs from "fs/promises";
import * as path from "path";

import type { LiveDocumentationConfig } from "@live-documentation/shared/config/liveDocumentationConfig";
import { isBarrelFilePath } from "@live-documentation/shared/live-docs/coreUtils";
import type { ParsedTypeReference } from "@live-documentation/shared/live-docs/parse";

import {
    buildLiveDocGraph,
    type LiveDocGraph,
    type LiveDocGraphNode
} from "../../graph/liveDocGraph";
import type {
    ExplorerGraphPayload,
    ExplorerLinkPayload,
    ExplorerNodePayload,
    ExplorerPublicSymbol,
    ExplorerTypeReference
} from "../shared/types";

type TypeResolver = (token: string) => LiveDocGraphNode | undefined;

type InheritanceLinkKind = "extends" | "implements";

interface InheritanceLink {
    source: string;
    target: string;
    kind: InheritanceLinkKind;
    /** The class/interface name that extends/implements */
    sourceSymbol?: string;
    /** The parent type name being extended/implemented */
    targetSymbol?: string;
}

export async function buildExplorerGraph(
    workspaceRoot: string,
    config?: LiveDocumentationConfig
): Promise<ExplorerGraphPayload> {
    const graph = await buildLiveDocGraph({ workspaceRoot, config });
    const nodes = Array.from(graph.nodes.values());
    const resolveType = createTypeResolver(nodes);

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
            return {
                targetId: targetId,
                targetDocPath: targetNode?.docPath ?? dep.docPath,
                targetSymbol: dep.anchor,
                sourceSymbol: dep.sourceAnchor,
                label,
                raw: dep.raw,
                resolved,
                kind: "dependency"
            };
        });

        const missingDependencies = dependencyReferences.filter(reference => !reference.resolved);
        missingDependencyCount += missingDependencies.length;

        dependencyReferences
            .filter(reference => reference.resolved && reference.targetId)
            .forEach(reference => {
                addLink(node.codePath, reference.targetId!, "dependency", {
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
    for (const nodePayload of nodePayloads) {
        if (!nodePayload.publicSymbolsExtended) continue;
        
        for (const symbol of nodePayload.publicSymbolsExtended) {
            if (!symbol.typeReferences) continue;
            
            for (const typeRef of symbol.typeReferences) {
                if (!typeRef.isResolved || !typeRef.targetId) continue;
                
                // Skip extends/implements - they're handled separately with pink/gold styling
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

    const inheritanceLinks = await detectInheritance(nodes, workspaceRoot, resolveType);
    inheritanceLinks.forEach(link => addLink(link.source, link.target, link.kind, {
        sourceSymbol: link.sourceSymbol,
        targetSymbol: link.targetSymbol
    }));

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

function createTypeResolver(nodes: LiveDocGraphNode[]): TypeResolver {
    // Map symbol name → all nodes that export it (for later prioritization)
    const symbolCandidates = new Map<string, LiveDocGraphNode[]>();
    const baseLookup = new Map<string, LiveDocGraphNode[]>();

    for (const node of nodes) {
        for (const symbol of node.publicSymbols) {
            if (!symbolCandidates.has(symbol)) {
                symbolCandidates.set(symbol, []);
            }
            symbolCandidates.get(symbol)!.push(node);
        }

        const baseName = path.basename(node.codePath, path.extname(node.codePath)).toLowerCase();
        if (!baseLookup.has(baseName)) {
            baseLookup.set(baseName, []);
        }
        baseLookup.get(baseName)!.push(node);
    }

    // Pre-compute the best candidate for each symbol (prefer non-barrel files)
    const symbolLookup = new Map<string, LiveDocGraphNode>();
    for (const [symbol, candidates] of symbolCandidates) {
        // Prefer non-barrel files over barrel files
        const nonBarrel = candidates.filter(n => !isBarrelFilePath(n.codePath));
        const best = nonBarrel.length > 0 ? nonBarrel[0] : candidates[0];
        symbolLookup.set(symbol, best);
    }

    return token => {
        const sanitized = sanitizeTypeToken(token);
        if (!sanitized) {
            return undefined;
        }

        const bySymbol = symbolLookup.get(sanitized);
        if (bySymbol) {
            return bySymbol;
        }

        const baseMatches = baseLookup.get(sanitized.toLowerCase());
        if (!baseMatches || baseMatches.length === 0) {
            return undefined;
        }

        if (baseMatches.length === 1) {
            return baseMatches[0];
        }

        return (
            baseMatches.find(candidate => {
                const base = path.basename(candidate.codePath, path.extname(candidate.codePath));
                return base === sanitized;
            }) ?? baseMatches[0]
        );
    };
}

async function detectInheritance(
    nodes: LiveDocGraphNode[],
    workspaceRoot: string,
    resolveType: TypeResolver
): Promise<InheritanceLink[]> {
    const results: InheritanceLink[] = [];
    const seen = new Set<string>();

    for (const node of nodes) {
        const absolutePath = path.isAbsolute(node.codePath)
            ? node.codePath
            : path.resolve(workspaceRoot, node.codePath);

        let content: string;
        try {
            content = await fs.readFile(absolutePath, "utf8");
        } catch {
            continue;
        }

        // Match: class ClassName extends ParentType [implements ...]
        for (const match of matchTypeTokensWithCapture(content, /class\s+([A-Za-z0-9_]+)\s+extends\s+([^\n{]+)/g)) {
            const [className, parentClause] = match;
            const parentToken = parentClause.split(/implements/i)[0];
            const reference = sanitizeTypeToken(parentToken);
            if (!reference) {
                continue;
            }
            const target = resolveType(reference);
            if (!target) {
                continue;
            }
            const key = `${node.codePath}|${target.codePath}|extends|${className}|${reference}`;
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            results.push({
                source: node.codePath,
                target: target.codePath,
                kind: "extends",
                sourceSymbol: className,
                targetSymbol: reference
            });
        }

        // Match: class ClassName implements Interface1, Interface2
        for (const match of matchTypeTokensWithCapture(content, /class\s+([A-Za-z0-9_]+)\s+(?:extends\s+[^\n{]+\s+)?implements\s+([^\n{]+)/g)) {
            const [className, implementsClause] = match;
            const segments = implementsClause.split(",").map(segment => segment.trim()).filter(Boolean);
            for (const segment of segments) {
                const reference = sanitizeTypeToken(segment);
                if (!reference) {
                    continue;
                }
                const target = resolveType(reference);
                if (!target) {
                    continue;
                }
                const key = `${node.codePath}|${target.codePath}|implements|${className}|${reference}`;
                if (seen.has(key)) {
                    continue;
                }
                seen.add(key);
                results.push({
                    source: node.codePath,
                    target: target.codePath,
                    kind: "implements",
                    sourceSymbol: className,
                    targetSymbol: reference
                });
            }
        }

        // Match: interface InterfaceName extends Parent1, Parent2
        for (const match of matchTypeTokensWithCapture(content, /interface\s+([A-Za-z0-9_]+)\s+extends\s+([^\n{]+)/g)) {
            const [interfaceName, extendsClause] = match;
            const segments = extendsClause.split(",").map(segment => segment.trim()).filter(Boolean);
            for (const segment of segments) {
                const reference = sanitizeTypeToken(segment);
                if (!reference) {
                    continue;
                }
                const target = resolveType(reference);
                if (!target) {
                    continue;
                }
                const key = `${node.codePath}|${target.codePath}|extends|${interfaceName}|${reference}`;
                if (seen.has(key)) {
                    continue;
                }
                seen.add(key);
                results.push({
                    source: node.codePath,
                    target: target.codePath,
                    kind: "extends",
                    sourceSymbol: interfaceName,
                    targetSymbol: reference
                });
            }
        }
    }

    return results;
}

function _matchTypeTokens(content: string, pattern: RegExp): string[] {
    const tokens: string[] = [];
    const regex = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
        const candidate = match[1];
        if (!candidate) {
            continue;
        }
        tokens.push(candidate);
    }
    return tokens;
}

/**
 * Like matchTypeTokens, but captures two groups: [group1, group2] for each match.
 * Used for patterns like /class\s+(\w+)\s+extends\s+(.+)/ where we need both the class name and parent.
 */
function matchTypeTokensWithCapture(content: string, pattern: RegExp): Array<[string, string]> {
    const results: Array<[string, string]> = [];
    const regex = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
        const group1 = match[1];
        const group2 = match[2];
        if (!group1 || !group2) {
            continue;
        }
        results.push([group1, group2]);
    }
    return results;
}

function sanitizeTypeToken(raw: string): string | undefined {
    if (!raw) {
        return undefined;
    }
    let candidate = raw.trim();
    if (!candidate) {
        return undefined;
    }
    candidate = candidate.replace(/implements.+/i, "");
    candidate = candidate.replace(/[<{(].*$/, "");
    candidate = candidate.replace(/[^A-Za-z0-9_.]/g, "");
    if (!candidate) {
        return undefined;
    }
    const segments = candidate.split(".");
    const tail = segments[segments.length - 1];
    return tail ? tail : undefined;
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
