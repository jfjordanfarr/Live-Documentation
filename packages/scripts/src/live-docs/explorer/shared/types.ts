export type ExplorerLinkKind =
    | "dependency"
    | "extends"
    | "implements"
    | (string & { readonly __explorerLinkKindBrand?: never });

export interface ExplorerDependencyReference {
    targetId?: string;
    targetDocPath?: string;
    targetSymbol?: string;
    /** Symbol on this file that references the target */
    sourceSymbol?: string;
    label: string;
    raw: string;
    resolved: boolean;
    kind: ExplorerLinkKind;
}

/**
 * Represents a type reference for a public symbol, enabling type-aware navigation.
 *
 * @remarks
 * When a symbol's return type, parameter type, or inheritance clause references
 * a type defined in another Live Doc, we capture this information to enable
 * click-to-navigate in the Local Map view.
 */
export interface ExplorerTypeReference {
    /** The name of the referenced type (e.g., "Widget", "Config"). */
    typeName: string;
    /** The role of this type in the symbol's signature. */
    role: "return" | "parameter" | "extends" | "implements" | "constraint";
    /** For parameter types, the name of the parameter. */
    parameterName?: string;
    /** Whether this type resolves to a Live Doc in the workspace. */
    isResolved: boolean;
    /** The target node ID (code path) if resolved. */
    targetId?: string;
    /** The anchor slug within the target Live Doc. */
    targetAnchor?: string;
}

/**
 * Extended symbol information including type references.
 */
export interface ExplorerPublicSymbol {
    /** The symbol name. */
    name: string;
    /** Type references extracted from the symbol's signature. */
    typeReferences?: ExplorerTypeReference[];
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
    /** Simple symbol names for backward compatibility. */
    publicSymbols: string[];
    /** Extended symbol information with type references. */
    publicSymbolsExtended?: ExplorerPublicSymbol[];
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
    /** @deprecated Use authored instead. Kept for backward compatibility. */
    purpose: string;
    /** Full authored section markdown (Purpose, Notes, etc.) */
    authored: string;
    /** ISO timestamp when the Live Doc was generated */
    generatedAt?: string;
    publicSymbols: string[];
    dependencies: ExplorerDependencyReference[];
    dependents: string[];
    missingDependencies: ExplorerDependencyReference[];
    docRelativePath: string;
    codeRelativePath: string;
    symbolDocumentation: Record<string, unknown> | undefined;
}
