/**
 * Core type definitions for Live Documentation analysis.
 *
 * @remarks
 * This module contains all interfaces and type aliases used across the
 * Live Documentation system. These types describe symbols, dependencies,
 * type references, documentation structures, and analysis results.
 *
 * @module
 */

// ============================================================================
// Source Analysis Result Types
// ============================================================================

/**
 * Result of analyzing a source file for symbols and dependencies.
 */
export interface SourceAnalysisResult {
  symbols: PublicSymbolEntry[];
  dependencies: DependencyEntry[];
  reExportedSymbols?: ReExportedSymbolInfo[];
}

// ============================================================================
// Symbol Location & Index Types
// ============================================================================

/**
 * Represents a resolved symbol location in the Live Documentation workspace.
 *
 * @remarks
 * This interface maps a symbol name to its Live Doc file path and anchor,
 * enabling cross-Live-Doc linking when type references are rendered.
 *
 * @see WorkspaceSymbolIndex
 */
export interface ResolvedSymbolLocation {
  /**
   * Workspace-relative path to the Live Doc file (e.g., ".live-documentation/source/src/types.ts.md").
   */
  liveDocPath: string;

  /**
   * Workspace-relative path to the source file (e.g., "src/types.ts").
   */
  sourcePath: string;

  /**
   * The anchor slug for the symbol within the Live Doc (e.g., "symbol-widget").
   */
  anchor: string;

  /**
   * The kind of symbol (e.g., "class", "interface", "type", "function").
   */
  kind: string;
}

/**
 * A workspace-wide index mapping symbol names to their Live Doc locations.
 *
 * @remarks
 * This index is built during Live Doc generation by collecting all exported
 * symbols from all tracked files. It enables type reference resolution:
 * when a symbol's return type or parameter type is a type defined elsewhere
 * in the workspace, we can render it as a link to that type's Live Doc.
 *
 * The index supports multiple symbols with the same name (from different files)
 * by storing an array of locations. Resolution prefers exact matches and
 * falls back to qualified name matching when ambiguous.
 *
 * @example
 * ```typescript
 * const index: WorkspaceSymbolIndex = new Map([
 *   ["Widget", [{ liveDocPath: ".live-documentation/source/src/types.ts.md", sourcePath: "src/types.ts", anchor: "symbol-widget", kind: "interface" }]],
 *   ["processWidget", [{ liveDocPath: ".live-documentation/source/src/core.ts.md", sourcePath: "src/core.ts", anchor: "symbol-processwidget", kind: "function" }]]
 * ]);
 * ```
 *
 * @see ResolvedSymbolLocation
 * @see buildWorkspaceSymbolIndex
 */
export type WorkspaceSymbolIndex = Map<string, ResolvedSymbolLocation[]>;

// ============================================================================
// Type Reference Types
// ============================================================================

/**
 * Represents a type reference extracted from a symbol's signature.
 *
 * @remarks
 * Type references capture the relationship between a symbol and the types it uses,
 * enabling cross-Live-Doc linking when those types are defined in other workspace files.
 * This powers the "type-aware symbol linking" feature in the Explorer's Local Map.
 *
 * @see PublicSymbolEntry.typeReferences
 * @see collectTypeReferences
 */
export interface TypeReference {
  /**
   * The name of the referenced type as it appears in the source code.
   * For qualified names like `Foo.Bar`, this contains the full path.
   */
  name: string;

  /**
   * The role this type plays in the symbol's signature.
   * - `return`: The function/method return type
   * - `parameter`: A function/method parameter type
   * - `extends`: A class/interface extension
   * - `implements`: An interface implementation
   * - `property`: A property/field type (for classes/interfaces)
   * - `generic-constraint`: A generic type parameter constraint (e.g., `T extends Widget`)
   * - `type-argument`: A generic type argument (e.g., `Promise<Widget>`)
   */
  role:
    | "return"
    | "parameter"
    | "extends"
    | "implements"
    | "property"
    | "generic-constraint"
    | "type-argument";

  /**
   * For parameter types, the name of the parameter this type belongs to.
   */
  parameterName?: string;

  /**
   * For type arguments, the index position in the generic type (e.g., 0 for first argument).
   */
  argumentIndex?: number;

  /**
   * Whether this type appears in a union (e.g., `Widget | Error`).
   */
  isUnionMember?: boolean;

  /**
   * Whether this type appears in an intersection (e.g., `Widget & Serializable`).
   */
  isIntersectionMember?: boolean;

  /**
   * Whether this type is wrapped in an array (e.g., `Widget[]`).
   */
  isArrayElement?: boolean;

  /**
   * Whether this type is wrapped in a Promise (e.g., `Promise<Widget>`).
   */
  isPromiseResolution?: boolean;
}

// ============================================================================
// Public Symbol Types
// ============================================================================

/**
 * Describes a public symbol exported from a source file.
 *
 * @remarks
 * This interface captures the essential metadata for each exported symbol,
 * including its name, kind, location, documentation, and type references.
 * The `typeReferences` field enables cross-Live-Doc linking when types
 * are defined in other workspace files.
 *
 * @see collectExportedSymbols
 * @see TypeReference
 */
export interface PublicSymbolEntry {
  /** The symbol's exported name. */
  name: string;

  /** The kind of symbol (function, class, interface, type, enum, const, etc.). */
  kind: string;

  /** Whether this is a default export. */
  isDefault?: boolean;

  /** Whether this is a type-only export. */
  isTypeOnly?: boolean;

  /** Source location where the symbol is defined. */
  location?: LocationInfo;

  /** Extracted documentation from JSDoc, XML comments, docstrings, etc. */
  documentation?: SymbolDocumentation;

  /** Fully qualified name for nested/namespaced symbols. */
  qualifiedName?: string;

  /**
   * Type references extracted from the symbol's signature.
   *
   * @remarks
   * For functions, this includes return types and parameter types.
   * For classes, this includes extends/implements clauses and property types.
   * For interfaces, this includes extends clauses and property types.
   * For type aliases, this includes the aliased type's references.
   *
   * Only types that could potentially be linked to other Live Docs are included;
   * primitive types (string, number, boolean, etc.) are excluded.
   */
  typeReferences?: TypeReference[];
}

// ============================================================================
// Dependency Types
// ============================================================================

/**
 * Describes a dependency imported or exported from a source file.
 */
export interface DependencyEntry {
  specifier: string;
  resolvedPath?: string;
  symbols: string[];
  kind: "import" | "export" | "require";
  isTypeOnly?: boolean;
  location?: LocationInfo;
  symbolTargets?: Record<string, string>;
}

/**
 * Describes a re-exported symbol from another module.
 */
export interface ReExportedSymbolInfo {
  name: string;
  kind: string;
  isTypeOnly?: boolean;
  location?: LocationInfo;
  sourceModulePath?: string;
}

// ============================================================================
// Location Types
// ============================================================================

/**
 * Source location information (1-indexed line and character).
 */
export interface LocationInfo {
  line: number;
  character: number;
}

// ============================================================================
// Documentation Types
// ============================================================================

/**
 * Fields that can appear in symbol documentation.
 */
export type SymbolDocumentationField =
  | "summary"
  | "remarks"
  | "parameters"
  | "typeParameters"
  | "returns"
  | "value"
  | "exceptions"
  | "examples"
  | "links"
  | "rawFragments";

/**
 * Parameter documentation from JSDoc or XML comments.
 */
export interface SymbolDocumentationParameter {
  name: string;
  description?: string;
}

/**
 * Exception documentation from @throws/@exception tags.
 */
export interface SymbolDocumentationException {
  type?: string;
  description?: string;
}

/**
 * Example documentation from @example tags.
 */
export interface SymbolDocumentationExample {
  description?: string;
  code?: string;
  language?: string;
}

/**
 * Link kind for @see/@link tags.
 */
export type SymbolDocumentationLinkKind = "cref" | "href" | "unknown";

/**
 * Link documentation from @see/@link tags.
 */
export interface SymbolDocumentationLink {
  kind: SymbolDocumentationLinkKind;
  target: string;
  text?: string;
}

/**
 * Comprehensive documentation extracted from a symbol's comments.
 *
 * @remarks
 * Supports JSDoc, TSDoc, and XML documentation comment formats.
 * The `source` field indicates which parser produced the documentation.
 */
export interface SymbolDocumentation {
  source?: string;
  summary?: string;
  remarks?: string;
  parameters?: SymbolDocumentationParameter[];
  typeParameters?: SymbolDocumentationParameter[];
  returns?: string;
  value?: string;
  exceptions?: SymbolDocumentationException[];
  examples?: SymbolDocumentationExample[];
  links?: SymbolDocumentationLink[];
  rawFragments?: string[];
  unsupportedTags?: string[];
}

// ============================================================================
// Rendering Types
// ============================================================================

/**
 * Information computed for rendering a public symbol heading.
 */
export interface PublicSymbolHeadingInfo {
  symbol: PublicSymbolEntry;
  displayName: string;
  slug: string;
}
