import * as fs from "fs/promises";
import * as path from "path";

import {
    buildLiveDocGraph,
    type LiveDocGraphNode
} from "../../graph/liveDocGraph";
import type {
    ExplorerGraphPayload,
    ExplorerLinkPayload,
    ExplorerNodePayload
} from "../shared/types";

type TypeResolver = (token: string) => LiveDocGraphNode | undefined;

type InheritanceLinkKind = "extends" | "implements";

interface InheritanceLink {
    source: string;
    target: string;
    kind: InheritanceLinkKind;
}

export async function buildExplorerGraph(workspaceRoot: string): Promise<ExplorerGraphPayload> {
    const graph = await buildLiveDocGraph({ workspaceRoot });
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
                    targetSymbol: reference.targetSymbol
                });
            });

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
            symbolDocumentation: node.symbolDocumentation
        } satisfies ExplorerNodePayload;
    });

    const inheritanceLinks = await detectInheritance(nodes, workspaceRoot, resolveType);
    inheritanceLinks.forEach(link => addLink(link.source, link.target, link.kind));

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
        kind: InheritanceLinkKind | "dependency",
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
    const symbolLookup = new Map<string, LiveDocGraphNode>();
    const baseLookup = new Map<string, LiveDocGraphNode[]>();

    for (const node of nodes) {
        for (const symbol of node.publicSymbols) {
            if (!symbolLookup.has(symbol)) {
                symbolLookup.set(symbol, node);
            }
        }

        const baseName = path.basename(node.codePath, path.extname(node.codePath)).toLowerCase();
        if (!baseLookup.has(baseName)) {
            baseLookup.set(baseName, []);
        }
        baseLookup.get(baseName)!.push(node);
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

        for (const raw of matchTypeTokens(content, /class\s+[A-Za-z0-9_]+\s+extends\s+([^\n{]+)/g)) {
            const parentToken = raw.split(/implements/i)[0];
            const reference = sanitizeTypeToken(parentToken);
            if (!reference) {
                continue;
            }
            const target = resolveType(reference);
            if (!target) {
                continue;
            }
            const key = `${node.codePath}|${target.codePath}|extends`;
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            results.push({ source: node.codePath, target: target.codePath, kind: "extends" });
        }

        for (const raw of matchTypeTokens(content, /class\s+[A-Za-z0-9_]+\s+implements\s+([^\n{]+)/g)) {
            const segments = raw.split(",").map(segment => segment.trim()).filter(Boolean);
            for (const segment of segments) {
                const reference = sanitizeTypeToken(segment);
                if (!reference) {
                    continue;
                }
                const target = resolveType(reference);
                if (!target) {
                    continue;
                }
                const key = `${node.codePath}|${target.codePath}|implements`;
                if (seen.has(key)) {
                    continue;
                }
                seen.add(key);
                results.push({ source: node.codePath, target: target.codePath, kind: "implements" });
            }
        }

        for (const raw of matchTypeTokens(content, /interface\s+[A-Za-z0-9_]+\s+extends\s+([^\n{]+)/g)) {
            const segments = raw.split(",").map(segment => segment.trim()).filter(Boolean);
            for (const segment of segments) {
                const reference = sanitizeTypeToken(segment);
                if (!reference) {
                    continue;
                }
                const target = resolveType(reference);
                if (!target) {
                    continue;
                }
                const key = `${node.codePath}|${target.codePath}|extends`;
                if (seen.has(key)) {
                    continue;
                }
                seen.add(key);
                results.push({ source: node.codePath, target: target.codePath, kind: "extends" });
            }
        }
    }

    return results;
}

function matchTypeTokens(content: string, pattern: RegExp): string[] {
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
