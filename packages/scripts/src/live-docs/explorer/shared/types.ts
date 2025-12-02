export type ExplorerLinkKind =
    | "dependency"
    | "extends"
    | "implements"
    | (string & { readonly __explorerLinkKindBrand?: never });

export interface ExplorerDependencyReference {
    targetId?: string;
    targetDocPath?: string;
    targetSymbol?: string;
    label: string;
    raw: string;
    resolved: boolean;
    kind: ExplorerLinkKind;
}

export interface ExplorerNodePayload {
    id: string;
    name: string;
    codePath: string;
    codeRelativePath: string;
    docPath: string;
    docRelativePath: string;
    archetype: string;
    dependencies: ExplorerDependencyReference[];
    dependents: string[];
    missingDependencies: ExplorerDependencyReference[];
    publicSymbols: string[];
    symbolDocumentation: Record<string, unknown> | undefined;
}

export interface ExplorerLinkPayload {
    source: string | { id: string };
    target: string | { id: string };
    kind: ExplorerLinkKind;
    sourceSymbol?: string;
    targetSymbol?: string;
}

export interface ExplorerGraphStats {
    nodes: number;
    links: number;
    missingDependencies: number;
}

export interface ExplorerGraphPayload {
    nodes: ExplorerNodePayload[];
    links: ExplorerLinkPayload[];
    stats: ExplorerGraphStats;
}

export interface ExplorerDetailPayload {
    archetype: string;
    purpose: string;
    publicSymbols: string[];
    dependencies: ExplorerDependencyReference[];
    dependents: string[];
    missingDependencies: ExplorerDependencyReference[];
    docRelativePath: string;
    codeRelativePath: string;
    symbolDocumentation: Record<string, unknown> | undefined;
}
