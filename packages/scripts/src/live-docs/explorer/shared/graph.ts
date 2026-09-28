/**
 * The Explorer's view of the graph.
 *
 * @remarks
 * The Explorer client reads the derived graph index like every other consumer
 * and projects it into the node-and-link payload its views were written
 * against. The projection is one pure function, so the client runs it on the
 * bundle the static builder wrote. It keeps the shape the views expect, quirks
 * included, until the views read the graph directly.
 */
import { symbolName } from "@live-documentation/shared/live-docs/document";
import type { GraphEdge, GraphFile, LiveDocGraph } from "@live-documentation/shared/live-docs/graph";

import type {
    ExplorerDependencyReference,
    ExplorerGraphPayload,
    ExplorerLinkPayload,
    ExplorerNodePayload,
    ExplorerPublicSymbol,
    ExplorerTypeReference
} from "./types";

const ROLE_OF_KIND = {
    returns: "return",
    parameter: "parameter",
    extends: "extends",
    implements: "implements",
    constraint: "constraint"
} as const;

const ROLE_OF_LINE = {
    Returns: "return",
    Extends: "extends",
    Implements: "implements",
    Constraints: "constraint"
} as const;

const isReference = (edge: GraphEdge): boolean => edge.kind !== "import" && edge.kind !== "re-export";

/**
 * Projects the graph into the Explorer's node-and-link payload.
 */
export function explorerGraphOf(graph: LiveDocGraph): ExplorerGraphPayload {
    const links: ExplorerLinkPayload[] = [];
    const seen = new Set<string>();
    let missingDependencyCount = 0;

    const addLink = (
        source: string,
        target: string,
        kind: ExplorerLinkPayload["kind"],
        sourceSymbol?: string,
        targetSymbol?: string
    ): void => {
        if (source === target) {
            return;
        }
        const key = `${source}|${target}|${kind}|${sourceSymbol ?? ""}|${targetSymbol ?? ""}`;
        if (seen.has(key)) {
            return;
        }
        seen.add(key);
        links.push({ source, target, kind, sourceSymbol, targetSymbol });
    };

    const nodes: ExplorerNodePayload[] = Object.values(graph.files).map(file => {
        const nameOfSlug = new Map(file.symbols.map(symbol => [symbol.slug, symbolName(symbol)]));
        const dependencies: ExplorerDependencyReference[] = [];

        for (const edge of file.edges) {
            if (!isReference(edge)) {
                dependencies.push({
                    targetId: edge.to,
                    targetDocPath: edge.to ? graph.files[edge.to].docPath : undefined,
                    targetSymbol: edge.toSymbol,
                    label: edge.label,
                    raw: edge.link ?? edge.label,
                    resolved: edge.to !== undefined,
                    kind: "dependency"
                });
            } else if (edge.to && edge.to !== file.codePath) {
                const role = ROLE_OF_KIND[edge.kind as keyof typeof ROLE_OF_KIND];
                const sourceSymbol = nameOfSlug.get(edge.from) ?? edge.from ?? "";
                dependencies.push({
                    targetId: edge.to,
                    targetDocPath: graph.files[edge.to].docPath,
                    targetSymbol: edge.toSymbol,
                    sourceSymbol,
                    label: `${role}: ${edge.label}`,
                    raw: `${sourceSymbol} ${role} ${edge.label}`,
                    resolved: true,
                    kind: edge.kind === "extends" || edge.kind === "implements" ? edge.kind : "dependency"
                });
            }
        }

        const missingDependencies = dependencies.filter(reference => !reference.resolved);
        missingDependencyCount += missingDependencies.length;

        for (const reference of dependencies) {
            if (reference.resolved && reference.targetId) {
                addLink(file.codePath, reference.targetId, reference.kind, reference.sourceSymbol, reference.targetSymbol);
            }
        }

        return {
            id: file.codePath,
            name: file.codePath.slice(file.codePath.lastIndexOf("/") + 1),
            codePath: file.codePath,
            codeRelativePath: file.codePath,
            docPath: file.docPath,
            docRelativePath: file.docPath,
            archetype: file.archetype ?? "implementation",
            dependencies,
            dependents: file.inbound,
            missingDependencies,
            publicSymbols: file.symbols.map(symbolName),
            publicSymbolsExtended: publicSymbolsExtendedOf(file)
        };
    });

    // Type references become edges of their own kind, after every dependency edge:
    // the providing file is the target, the consuming symbol the source.
    for (const node of nodes) {
        for (const symbol of node.publicSymbolsExtended ?? []) {
            for (const reference of symbol.typeReferences ?? []) {
                if (!reference.isResolved || !reference.targetId) {
                    continue;
                }
                if (reference.role === "extends" || reference.role === "implements") {
                    continue;
                }
                addLink(node.id, reference.targetId, "type-reference", symbol.name, reference.typeName);
            }
        }
    }

    return {
        nodes,
        links,
        stats: {
            nodes: nodes.length,
            links: links.length,
            missingDependencies: missingDependencyCount
        }
    };
}

/**
 * Each symbol with its type references. A reference to another file is
 * resolved; a reference to a type of the same file, or to no doc, is not, which
 * is how the views tell a self-reference from a cross-file one. A bare type
 * name keeps its `[]` suffix, as the views were written to expect.
 */
function publicSymbolsExtendedOf(file: GraphFile): ExplorerPublicSymbol[] {
    const referenceEdges = file.edges.filter(isReference);
    let next = 0;
    return file.symbols.map(symbol => {
        const typeReferences: ExplorerTypeReference[] = [];
        for (const line of symbol.references) {
            const entries = line.role === "Parameters"
                ? line.parameters.flatMap(parameter => parameter.types.map(type => ({ type, role: "parameter" as const, parameterName: parameter.name })))
                : line.types.map(type => ({ type, role: ROLE_OF_LINE[line.role], parameterName: undefined }));
            for (const { type, role, parameterName } of entries) {
                if (!type.link) {
                    typeReferences.push({ typeName: `${type.name}${type.array ? "[]" : ""}`, role, parameterName, isResolved: false });
                    continue;
                }
                const edge = referenceEdges[next++];
                const targetId = edge.to !== undefined && edge.to !== file.codePath ? edge.to : undefined;
                typeReferences.push({
                    typeName: type.name,
                    role,
                    parameterName,
                    isResolved: targetId !== undefined,
                    targetId,
                    targetAnchor: edge.toSymbol
                });
            }
        }
        const name = symbolName(symbol);
        return typeReferences.length > 0 ? { name, typeReferences } : { name };
    });
}
