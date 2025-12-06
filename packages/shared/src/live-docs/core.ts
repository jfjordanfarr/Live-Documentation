import { glob } from "glob";
import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

import { analyzeWithLanguageAdapters } from "./adapters";
import { inferDomDependencies } from "./heuristics/dom";
import {
  type LiveDocumentationConfig,
  type LiveDocumentationArchetype
} from "../config/liveDocumentationConfig";
import { slug } from "../tooling/githubSlugger";
import { normalizeWorkspacePath } from "../tooling/pathUtils";

export interface SourceAnalysisResult {
  symbols: PublicSymbolEntry[];
  dependencies: DependencyEntry[];
  reExportedSymbols?: ReExportedSymbolInfo[];
}

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
   * Workspace-relative path to the Live Doc file (e.g., ".mdmd/layer-4/src/types.ts.mdmd.md").
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
 *   ["Widget", [{ liveDocPath: ".mdmd/layer-4/src/types.ts.mdmd.md", sourcePath: "src/types.ts", anchor: "symbol-widget", kind: "interface" }]],
 *   ["processWidget", [{ liveDocPath: ".mdmd/layer-4/src/core.ts.mdmd.md", sourcePath: "src/core.ts", anchor: "symbol-processwidget", kind: "function" }]]
 * ]);
 * ```
 *
 * @see ResolvedSymbolLocation
 * @see buildWorkspaceSymbolIndex
 */
export type WorkspaceSymbolIndex = Map<string, ResolvedSymbolLocation[]>;

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

export interface DependencyEntry {
  specifier: string;
  resolvedPath?: string;
  symbols: string[];
  kind: "import" | "export" | "require";
  isTypeOnly?: boolean;
  location?: LocationInfo;
  symbolTargets?: Record<string, string>;
}

export interface ReExportedSymbolInfo {
  name: string;
  kind: string;
  isTypeOnly?: boolean;
  location?: LocationInfo;
  sourceModulePath?: string;
}

export interface LocationInfo {
  line: number;
  character: number;
}

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

export interface SymbolDocumentationParameter {
  name: string;
  description?: string;
}

export interface SymbolDocumentationException {
  type?: string;
  description?: string;
}

export interface SymbolDocumentationExample {
  description?: string;
  code?: string;
  language?: string;
}

export type SymbolDocumentationLinkKind = "cref" | "href" | "unknown";

export interface SymbolDocumentationLink {
  kind: SymbolDocumentationLinkKind;
  target: string;
  text?: string;
}

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

export const SUPPORTED_SCRIPT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs"
]);

/**
 * Extensions that are always treated as implementation code, even under fixture directories.
 * These files contain analyzable source code with symbols and dependencies.
 */
export const IMPLEMENTATION_CODE_EXTENSIONS = new Set([
  // TypeScript/JavaScript
  ".ts", ".tsx", ".mts", ".cts",
  ".js", ".jsx", ".mjs", ".cjs",
  // C/C++
  ".c", ".h", ".cpp", ".hpp", ".cc", ".hh", ".cxx", ".hxx",
  // C#
  ".cs",
  // Java
  ".java",
  // Python
  ".py",
  // Ruby
  ".rb",
  // Rust
  ".rs",
  // PowerShell
  ".ps1", ".psm1", ".psd1",
  // ASP.NET Markup (code-behind)
  ".aspx", ".cshtml", ".razor", ".ascx"
]);

export const MODULE_RESOLUTION_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json"
];

const RESERVED_HEADING_NAMES = new Set(
  [
    "Metadata",
    "Authored",
    "Purpose",
    "Notes",
    "Generated",
    "Public Symbols",
    "Dependencies",
    "Observed Evidence",
    "Targets",
    "Supporting Fixtures",
    "Re-Exported Symbol Anchors"
  ].map((name) => name.toLowerCase())
);

const EMPTY_ANALYSIS_RESULT: SourceAnalysisResult = {
  symbols: [],
  dependencies: []
};

interface DiscoverOptions {
  workspaceRoot: string;
  config: LiveDocumentationConfig;
  include: Set<string>;
  changedOnly: boolean;
}

/**
 * Locates workspace files that should receive Live Documentation generation.
 *
 * @remarks
 * When `options.changedOnly` is `true`, the discovery set is intersected with
 * files currently marked as changed in git, allowing quick iterations that only
 * regenerate touched artifacts.
 *
 * @param options.workspaceRoot - Absolute path to the repository root the CLI is operating in.
 * @param options.config - Live Documentation configuration describing default globs and overrides.
 * @param options.include - Optional override set limiting discovery to pre-selected relative paths.
 * @param options.changedOnly - When `true`, restricts results to files with local modifications.
 *
 * @see detectChangedFiles
 *
 * @returns A sorted array of absolute, workspace-resolved file paths ready for analysis.
 *
 * @example
 * ```ts
 * const files = await discoverTargetFiles({
 *   workspaceRoot,
 *   config,
 *   include: new Set(["packages/server/src/index.ts"]),
 *   changedOnly: false
 * });
 * ```
 */
export async function discoverTargetFiles(options: DiscoverOptions): Promise<string[]> {
  const patterns = options.include.size > 0 ? Array.from(options.include) : options.config.glob;
  const absoluteFiles = new Set<string>();

  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: options.workspaceRoot,
      absolute: true,
      nodir: true,
      dot: false,
      windowsPathsNoEscape: true
    });
    for (const match of matches) {
      absoluteFiles.add(path.resolve(options.workspaceRoot, match));
    }
  }

  let candidates = Array.from(absoluteFiles);

  if (options.changedOnly) {
    const changed = await detectChangedFiles(options.workspaceRoot);
    if (changed.size > 0) {
      candidates = candidates.filter((absolute) => {
        const relative = normalizeWorkspacePath(
          path.relative(options.workspaceRoot, absolute)
        );
        return changed.has(relative);
      });
    }
  }

  candidates.sort();
  return candidates;
}

/**
 * Builds a workspace-wide symbol index for cross-Live-Doc type reference resolution.
 *
 * @remarks
 * This function performs a lightweight pre-scan of all target files to collect
 * exported symbols and their locations. The resulting index enables type references
 * in one Live Doc to link to type definitions in other Live Docs.
 *
 * The index is keyed by symbol name (case-sensitive) and maps to an array of
 * locations, allowing for multiple symbols with the same name from different files.
 *
 * @param options - Configuration for the index build.
 * @param options.targetFiles - Absolute paths to all files being processed.
 * @param options.workspaceRoot - Absolute path to the workspace root.
 * @param options.liveDocsRoot - Workspace-relative path to the Live Docs root (e.g., ".mdmd/layer-4").
 * @param options.docExtension - File extension for Live Docs (e.g., ".mdmd.md").
 *
 * @returns A map from symbol names to their resolved Live Doc locations.
 *
 * @example
 * ```typescript
 * const index = await buildWorkspaceSymbolIndex({
 *   targetFiles: ["/workspace/src/types.ts", "/workspace/src/core.ts"],
 *   workspaceRoot: "/workspace",
 *   liveDocsRoot: ".mdmd/layer-4",
 *   docExtension: ".mdmd.md"
 * });
 * // index.get("Widget") => [{ liveDocPath: ".mdmd/layer-4/src/types.ts.mdmd.md", ... }]
 * ```
 *
 * @see WorkspaceSymbolIndex
 * @see ResolvedSymbolLocation
 */
export async function buildWorkspaceSymbolIndex(options: {
  targetFiles: string[];
  workspaceRoot: string;
  liveDocsRoot: string;
  docExtension: string;
}): Promise<WorkspaceSymbolIndex> {
  const index: WorkspaceSymbolIndex = new Map();

  for (const absolutePath of options.targetFiles) {
    const sourcePath = normalizeWorkspacePath(
      path.relative(options.workspaceRoot, absolutePath)
    );

    // Compute the Live Doc path for this source file
    const liveDocPath = normalizeWorkspacePath(
      path.join(options.liveDocsRoot, `${sourcePath}${options.docExtension}`)
    );

    // Try to extract symbols from the file
    let symbols: PublicSymbolEntry[] = [];
    try {
      const content = await fs.readFile(absolutePath, "utf8");
      const ext = path.extname(absolutePath).toLowerCase();

      // Only process files we can analyze for symbols
      if ([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(ext)) {
        const scriptKind = inferScriptKind(absolutePath);
        const sourceFile = ts.createSourceFile(
          absolutePath,
          content,
          ts.ScriptTarget.Latest,
          true,
          scriptKind
        );
        symbols = collectExportedSymbols(sourceFile);
      }
      // For other languages, we could add adapter-based symbol extraction here
    } catch {
      // Skip files that can't be read or parsed
      continue;
    }

    // Compute heading info for proper anchor slugs
    const headings = computePublicSymbolHeadingInfo(symbols);

    // Register each symbol in the index
    for (const heading of headings) {
      const symbol = heading.symbol;
      const location: ResolvedSymbolLocation = {
        liveDocPath,
        sourcePath,
        anchor: heading.slug,
        kind: symbol.kind
      };

      // Register by primary name
      const existing = index.get(symbol.name) ?? [];
      existing.push(location);
      index.set(symbol.name, existing);

      // Also register by qualified name if different
      if (symbol.qualifiedName && symbol.qualifiedName !== symbol.name) {
        const qualifiedExisting = index.get(symbol.qualifiedName) ?? [];
        qualifiedExisting.push(location);
        index.set(symbol.qualifiedName, qualifiedExisting);
      }
    }
  }

  return index;
}

/**
 * Resolves a type name to its Live Doc location using the workspace symbol index.
 *
 * @remarks
 * Returns undefined if the type is not found in the index. When multiple
 * symbols with the same name exist, returns the first match (future enhancement:
 * could use import context to disambiguate).
 *
 * @param typeName - The type name to resolve (e.g., "Widget", "Foo.Bar").
 * @param index - The workspace-wide symbol index.
 * @param currentSourcePath - The source path of the file being rendered (to avoid self-links).
 *
 * @returns The resolved location, or undefined if not found.
 */
export function resolveTypeToLiveDoc(
  typeName: string,
  index: WorkspaceSymbolIndex,
  currentSourcePath: string
): ResolvedSymbolLocation | undefined {
  const locations = index.get(typeName);
  if (!locations || locations.length === 0) {
    return undefined;
  }

  // Filter out self-references (types defined in the current file)
  const external = locations.filter((loc) => loc.sourcePath !== currentSourcePath);

  // Prefer external definitions; fall back to any match if all are self-refs
  if (external.length > 0) {
    return external[0];
  }

  // All matches are in the current file — return undefined to avoid self-link
  // (the type is already visible in the same Live Doc)
  return undefined;
}

/**
 * Determines which Live Documentation archetype applies to a given source file.
 *
 * @remarks
 * Explicit `archetypeOverrides` from the configuration take precedence. When no
 * overrides match, common fixture and test naming conventions are used as a
 * fallback before defaulting to the `implementation` archetype.
 *
 * @param sourcePath - Workspace-relative source path using forward slashes.
 * @param config - Live Documentation configuration containing archetype overrides.
 *
 * @returns The archetype that should be reflected in the generated markdown metadata.
 *
 * @example
 * ```ts
 * const archetype = resolveArchetype("packages/app/src/main.test.ts", config);
 * // archetype === "test"
 * ```
 */
export function resolveArchetype(
  sourcePath: string,
  config: LiveDocumentationConfig
): LiveDocumentationArchetype {
  const overrides = config.archetypeOverrides ?? {};
  for (const [pattern, archetype] of Object.entries(overrides)) {
    if (new RegExp(globPatternToRegExp(pattern)).test(sourcePath)) {
      return archetype;
    }
  }

  // Check for test files FIRST - these always take precedence
  // Matches: *.test.ts, *.spec.ts, *.test.js, etc.
  const basename = path.basename(sourcePath);
  if (/\.(test|spec)\.[^.]+$/.test(basename)) {
    return "test";
  }

  // Check if this is a fixture directory
  const isFixturePath = sourcePath.includes("/__fixtures__/") || /\bfixtures\b/.test(sourcePath);
  
  if (isFixturePath) {
    // Fixture files with code extensions are implementation (they have symbols/dependencies)
    // Non-code fixtures (JSON, config, etc.) are assets
    const ext = path.extname(sourcePath).toLowerCase();
    if (IMPLEMENTATION_CODE_EXTENSIONS.has(ext)) {
      return "implementation";
    }
    return "asset";
  }

  // Check for test directories (but not individual test files - those were caught above)
  if (/\btests?\b|__tests__/i.test(sourcePath)) {
    return "test";
  }

  return "implementation";
}

/**
 * Checks whether an authored markdown block carries information beyond the default placeholders.
 *
 * @param authoredBlock - Raw markdown captured between the `## Authored` markers.
 *
 * @returns `true` when the block contains substantive content, otherwise `false`.
 */
export function hasMeaningfulAuthoredContent(authoredBlock?: string): boolean {
  if (!authoredBlock) {
    return false;
  }

  const normalized = authoredBlock.replace(/\r?\n/g, "\n").trim();
  if (!normalized) {
    return false;
  }

  const sanitized = normalized
    .replace(/###\s+Purpose/gi, "")
    .replace(/###\s+Notes/gi, "")
    .replace(/_Pending authored purpose_/gi, "")
    .replace(/_Pending notes_/gi, "")
    .replace(/_Pending purpose_/gi, "")
    .replace(/_Pending_/gi, "")
    .replace(/\s+/g, "");

  return sanitized.length > 0;
}

export async function directoryExists(candidate: string): Promise<boolean> {
  try {
    const stats = await fs.stat(candidate);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Recursively removes empty directories from `startDir` up to (but excluding) `stopDir`.
 *
 * @remarks
 * The walk stops as soon as a directory contains any entries or when the
 * `stopDir` boundary is reached, preventing accidental deletion outside the Live
 * Doc mirror.
 *
 * @param startDir - Directory that was just emptied (for example, a deleted Live Doc path).
 * @param stopDir - Absolute directory boundary that must remain intact.
 */
export async function cleanupEmptyParents(startDir: string, stopDir: string): Promise<void> {
  const stop = path.resolve(stopDir);
  let current = path.resolve(startDir);

  while (current.startsWith(stop) && current !== stop) {
    try {
      const entries = await fs.readdir(current);
      if (entries.length > 0) {
        break;
      }
      await fs.rmdir(current);
      current = path.dirname(current);
    } catch {
      break;
    }
  }
}

function globPatternToRegExp(pattern: string): string {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "(.+?)")
    .replace(/\*/g, "([^/]*)");
  return `^${escaped}$`;
}

/**
 * Produces symbol and dependency analysis for a single source artifact.
 *
 * @remarks
 * Language-specific adapters run before falling back to the built-in
 * TypeScript/JavaScript parser. This lets polyglot fixtures supply rich metadata
 * without requiring the TypeScript compiler to understand those languages.
 *
 * @param absolutePath - Absolute filesystem path to the source file under inspection.
 * @param workspaceRoot - Workspace root used to normalise relative dependency paths.
 *
 * @returns Analyzer output describing exported symbols and detected dependencies.
 *
 * @example
 * ```ts
 * const analysis = await analyzeSourceFile(srcPath, workspaceRoot);
 * if (analysis.symbols.length === 0) {
 *   console.warn("No exports detected");
 * }
 * ```
 */
export async function analyzeSourceFile(
  absolutePath: string,
  workspaceRoot: string
): Promise<SourceAnalysisResult> {
  const extension = path.extname(absolutePath).toLowerCase();

  const adapterResult = await analyzeWithLanguageAdapters({
    absolutePath,
    workspaceRoot
  });

  if (adapterResult) {
    return adapterResult;
  }

  if (!SUPPORTED_SCRIPT_EXTENSIONS.has(extension)) {
    return EMPTY_ANALYSIS_RESULT;
  }

  const content = await fs.readFile(absolutePath, "utf8");
  const scriptKind = inferScriptKind(extension);
  const sourceFile = ts.createSourceFile(
    absolutePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  const directSymbols = collectExportedSymbols(sourceFile);
  let dependencies = await collectDependencies({
    sourceFile,
    absolutePath,
    workspaceRoot
  });

  if (shouldInferDomDependencies(extension)) {
    const domDependencies = await inferDomDependencies({
      absolutePath,
      workspaceRoot,
      content
    });
    if (domDependencies.length > 0) {
      dependencies = mergeDependencyEntries(dependencies, domDependencies);
    }
  }

  const { symbols, reExports } = await augmentWithReExportedSymbols({
    sourceAbsolute: absolutePath,
    workspaceRoot,
    dependencies,
    existingSymbols: directSymbols
  });

  return {
    symbols: sortSymbolsByLocation(symbols),
    dependencies,
    reExportedSymbols: reExports.length > 0 ? reExports : undefined
  };
}

/**
 * Maps a file extension to the TypeScript compiler script kind used for parsing.
 *
 * @param extension - Lowercase file extension including the leading dot.
 *
 * @returns The matching `ts.ScriptKind`, defaulting to `Unknown` for unsupported types.
 */
export function inferScriptKind(extension: string): ts.ScriptKind {
  switch (extension) {
    case ".ts":
    case ".mts":
    case ".cts":
      return ts.ScriptKind.TS;
    case ".tsx":
      return ts.ScriptKind.TSX;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".js":
    case ".mjs":
    case ".cjs":
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.Unknown;
  }
}

/**
 * Scans a TypeScript source file for exported declarations and captures their metadata.
 *
 * @param sourceFile - Parsed TypeScript source file produced by the compiler host.
 *
 * @returns A location-sorted list of exported symbols suitable for Live Doc rendering.
 */
export function collectExportedSymbols(sourceFile: ts.SourceFile): PublicSymbolEntry[] {
  const collected: PublicSymbolEntry[] = [];

  const record = (entry: PublicSymbolEntry): void => {
    if (!entry.name) return;
    collected.push(entry);
  };

  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      const name = resolveExportAssignmentName(statement.expression);
      if (!name) continue;
      record({
        name,
        kind: "default",
        isDefault: true,
        location: getNodeLocation(statement, sourceFile)
      });
      continue;
    }

    if (ts.isExportDeclaration(statement)) {
      const exportClause = statement.exportClause;
      if (exportClause && ts.isNamedExports(exportClause)) {
        for (const specifier of exportClause.elements) {
          const exportedName = specifier.name.text;
          const declarationKind = specifier.isTypeOnly ? "type" : "unknown";
          record({
            name: exportedName,
            kind: declarationKind,
            isTypeOnly: specifier.isTypeOnly,
            location: getNodeLocation(specifier.name, sourceFile)
          });
        }
      }
      continue;
    }

    if (!hasExportModifier(statement)) {
      continue;
    }

    if (ts.isFunctionDeclaration(statement)) {
      const name = statement.name?.text ?? (hasDefaultModifier(statement) ? "default" : undefined);
      if (!name) continue;
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromFunction(statement));
      record({
        name,
        kind: "function",
        isDefault: name === "default",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name ?? statement, sourceFile),
        typeReferences: typeRefs.length > 0 ? typeRefs : undefined
      });
      continue;
    }

    if (ts.isClassDeclaration(statement)) {
      const name = statement.name?.text ?? (hasDefaultModifier(statement) ? "default" : undefined);
      if (!name) continue;
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromClass(statement));
      record({
        name,
        kind: "class",
        isDefault: name === "default",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name ?? statement, sourceFile),
        typeReferences: typeRefs.length > 0 ? typeRefs : undefined
      });
      continue;
    }

    if (ts.isInterfaceDeclaration(statement)) {
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromInterface(statement));
      record({
        name: statement.name.text,
        kind: "interface",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name, sourceFile),
        typeReferences: typeRefs.length > 0 ? typeRefs : undefined
      });
      continue;
    }

    if (ts.isTypeAliasDeclaration(statement)) {
      const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromTypeAlias(statement));
      record({
        name: statement.name.text,
        kind: "type",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name, sourceFile),
        typeReferences: typeRefs.length > 0 ? typeRefs : undefined
      });
      continue;
    }

    if (ts.isEnumDeclaration(statement)) {
      record({
        name: statement.name.text,
        kind: "enum",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name, sourceFile)
      });
      continue;
    }

    if (ts.isModuleDeclaration(statement)) {
      record({
        name: statement.name.getText(sourceFile),
        kind: "namespace",
        documentation: extractJsDocDocumentation(statement),
        location: getNodeLocation(statement.name, sourceFile)
      });
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      const kind = inferVariableKind(statement);
      for (const declaration of statement.declarationList.declarations) {
        const names = collectBindingNames(declaration.name);
        const typeRefs = deduplicateTypeReferences(collectTypeReferencesFromVariable(declaration));
        for (const name of names) {
          record({
            name,
            kind,
            documentation: extractJsDocDocumentation(statement),
            location: getNodeLocation(declaration.name, sourceFile),
            typeReferences: typeRefs.length > 0 ? typeRefs : undefined
          });
        }
      }
      continue;
    }

  }

  return collected;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Reference Extraction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Primitive and built-in type names that should not generate Live Doc links.
 *
 * @remarks
 * These types are either JavaScript/TypeScript primitives or globally available
 * types that are not defined in user code. Linking to them would not provide
 * useful navigation in the Live Documentation system.
 */
const PRIMITIVE_TYPE_NAMES = new Set([
  // JavaScript primitives
  "string",
  "number",
  "boolean",
  "symbol",
  "bigint",
  "undefined",
  "null",
  "void",
  "never",
  "unknown",
  "any",
  "object",
  // Common built-in types
  "Object",
  "String",
  "Number",
  "Boolean",
  "Symbol",
  "BigInt",
  "Function",
  "Array",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "Promise",
  "Date",
  "RegExp",
  "Error",
  "TypeError",
  "RangeError",
  "SyntaxError",
  "ReferenceError",
  "EvalError",
  "URIError",
  "JSON",
  "Math",
  "Intl",
  "ArrayBuffer",
  "SharedArrayBuffer",
  "DataView",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Uint16Array",
  "Int32Array",
  "Uint32Array",
  "Float32Array",
  "Float64Array",
  "BigInt64Array",
  "BigUint64Array",
  // TypeScript utility types
  "Partial",
  "Required",
  "Readonly",
  "Record",
  "Pick",
  "Omit",
  "Exclude",
  "Extract",
  "NonNullable",
  "Parameters",
  "ConstructorParameters",
  "ReturnType",
  "InstanceType",
  "ThisParameterType",
  "OmitThisParameter",
  "ThisType",
  "Awaited",
  "Uppercase",
  "Lowercase",
  "Capitalize",
  "Uncapitalize",
  // Node.js globals
  "Buffer",
  "Console",
  "NodeJS",
  // DOM types (commonly used but external)
  "HTMLElement",
  "Element",
  "Document",
  "Window",
  "Event",
  "EventTarget",
  "Node"
]);

/**
 * Extracts type references from a TypeScript AST node representing a type.
 *
 * @remarks
 * This function recursively traverses type nodes to extract all referenced type names,
 * handling unions, intersections, arrays, generics, and qualified names. Primitive types
 * are filtered out since they cannot be linked to Live Documentation.
 *
 * @param typeNode - The TypeScript type node to analyze.
 * @param role - The semantic role of this type in the parent symbol's signature.
 * @param options - Additional context for the extraction.
 *
 * @returns An array of type references found in the type node.
 *
 * @see TypeReference
 * @see collectTypeReferencesFromDeclaration
 */
function extractTypeReferencesFromTypeNode(
  typeNode: ts.TypeNode | undefined,
  role: TypeReference["role"],
  options?: {
    parameterName?: string;
    argumentIndex?: number;
    isUnionMember?: boolean;
    isIntersectionMember?: boolean;
    isArrayElement?: boolean;
    isPromiseResolution?: boolean;
  }
): TypeReference[] {
  if (!typeNode) {
    return [];
  }

  const references: TypeReference[] = [];

  // Handle union types: Widget | Error | null
  if (ts.isUnionTypeNode(typeNode)) {
    for (const member of typeNode.types) {
      references.push(
        ...extractTypeReferencesFromTypeNode(member, role, {
          ...options,
          isUnionMember: true
        })
      );
    }
    return references;
  }

  // Handle intersection types: Widget & Serializable
  if (ts.isIntersectionTypeNode(typeNode)) {
    for (const member of typeNode.types) {
      references.push(
        ...extractTypeReferencesFromTypeNode(member, role, {
          ...options,
          isIntersectionMember: true
        })
      );
    }
    return references;
  }

  // Handle array types: Widget[]
  if (ts.isArrayTypeNode(typeNode)) {
    references.push(
      ...extractTypeReferencesFromTypeNode(typeNode.elementType, role, {
        ...options,
        isArrayElement: true
      })
    );
    return references;
  }

  // Handle parenthesized types: (Widget | Error)
  if (ts.isParenthesizedTypeNode(typeNode)) {
    references.push(...extractTypeReferencesFromTypeNode(typeNode.type, role, options));
    return references;
  }

  // Handle type references: Widget, Promise<Widget>, Map<string, Widget>
  if (ts.isTypeReferenceNode(typeNode)) {
    const typeName = typeNode.typeName;
    let name: string;

    if (ts.isIdentifier(typeName)) {
      name = typeName.text;
    } else if (ts.isQualifiedName(typeName)) {
      // Handle qualified names like Namespace.Type
      name = getQualifiedNameText(typeName);
    } else {
      return references;
    }

    // Skip primitive types
    if (!PRIMITIVE_TYPE_NAMES.has(name)) {
      // Special handling for Promise<T> - extract the resolution type
      if (name === "Promise" && typeNode.typeArguments && typeNode.typeArguments.length > 0) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeNode.typeArguments[0], role, {
            ...options,
            isPromiseResolution: true
          })
        );
      } else {
        references.push({
          name,
          role,
          ...options
        });
      }
    }

    // Process type arguments for generics: Map<K, V>, Array<T>, etc.
    if (typeNode.typeArguments) {
      typeNode.typeArguments.forEach((typeArg, index) => {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeArg, "type-argument", {
            argumentIndex: index
          })
        );
      });
    }

    return references;
  }

  // Handle tuple types: [Widget, Error]
  if (ts.isTupleTypeNode(typeNode)) {
    typeNode.elements.forEach((element, index) => {
      const elementNode = ts.isNamedTupleMember(element) ? element.type : element;
      references.push(
        ...extractTypeReferencesFromTypeNode(elementNode, "type-argument", {
          argumentIndex: index
        })
      );
    });
    return references;
  }

  // Handle function types: (widget: Widget) => Result
  if (ts.isFunctionTypeNode(typeNode)) {
    // Extract parameter types
    for (const param of typeNode.parameters) {
      if (param.type) {
        const paramName = ts.isIdentifier(param.name) ? param.name.text : undefined;
        references.push(
          ...extractTypeReferencesFromTypeNode(param.type, "parameter", {
            parameterName: paramName
          })
        );
      }
    }
    // Extract return type
    if (typeNode.type) {
      references.push(...extractTypeReferencesFromTypeNode(typeNode.type, "return"));
    }
    return references;
  }

  // Handle type literals: { prop: Widget }
  if (ts.isTypeLiteralNode(typeNode)) {
    for (const member of typeNode.members) {
      if (ts.isPropertySignature(member) && member.type) {
        references.push(...extractTypeReferencesFromTypeNode(member.type, "property"));
      }
    }
    return references;
  }

  // Handle conditional types: T extends Widget ? A : B
  if (ts.isConditionalTypeNode(typeNode)) {
    references.push(
      ...extractTypeReferencesFromTypeNode(typeNode.checkType, "generic-constraint")
    );
    references.push(
      ...extractTypeReferencesFromTypeNode(typeNode.extendsType, "generic-constraint")
    );
    references.push(...extractTypeReferencesFromTypeNode(typeNode.trueType, role));
    references.push(...extractTypeReferencesFromTypeNode(typeNode.falseType, role));
    return references;
  }

  // Handle indexed access types: Widget["property"]
  if (ts.isIndexedAccessTypeNode(typeNode)) {
    references.push(...extractTypeReferencesFromTypeNode(typeNode.objectType, role));
    return references;
  }

  // Handle mapped types: { [K in keyof Widget]: ... }
  if (ts.isMappedTypeNode(typeNode)) {
    if (typeNode.type) {
      references.push(...extractTypeReferencesFromTypeNode(typeNode.type, "property"));
    }
    return references;
  }

  return references;
}

/**
 * Gets the full text representation of a qualified name (e.g., "Namespace.Type").
 */
function getQualifiedNameText(qualifiedName: ts.QualifiedName): string {
  const parts: string[] = [];
  let current: ts.EntityName = qualifiedName;

  while (ts.isQualifiedName(current)) {
    parts.unshift(current.right.text);
    current = current.left;
  }

  if (ts.isIdentifier(current)) {
    parts.unshift(current.text);
  }

  return parts.join(".");
}

/**
 * Extracts type references from a function declaration's signature.
 *
 * @param declaration - The function declaration to analyze.
 * @returns An array of type references from parameters and return type.
 */
function collectTypeReferencesFromFunction(
  declaration: ts.FunctionDeclaration | ts.MethodDeclaration | ts.ArrowFunction
): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract type parameters constraints: <T extends Widget>
  if (declaration.typeParameters) {
    for (const typeParam of declaration.typeParameters) {
      if (typeParam.constraint) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint")
        );
      }
    }
  }

  // Extract parameter types
  for (const param of declaration.parameters) {
    if (param.type) {
      const paramName = ts.isIdentifier(param.name) ? param.name.text : undefined;
      references.push(
        ...extractTypeReferencesFromTypeNode(param.type, "parameter", {
          parameterName: paramName
        })
      );
    }
  }

  // Extract return type
  if (declaration.type) {
    references.push(...extractTypeReferencesFromTypeNode(declaration.type, "return"));
  }

  return references;
}

/**
 * Extracts type references from a class declaration's heritage clauses and members.
 *
 * @param declaration - The class declaration to analyze.
 * @returns An array of type references from extends, implements, and properties.
 */
function collectTypeReferencesFromClass(declaration: ts.ClassDeclaration): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract heritage clauses: extends BaseClass, implements Interface
  if (declaration.heritageClauses) {
    for (const clause of declaration.heritageClauses) {
      const role: TypeReference["role"] =
        clause.token === ts.SyntaxKind.ExtendsKeyword ? "extends" : "implements";

      for (const type of clause.types) {
        const typeName = type.expression;
        if (ts.isIdentifier(typeName)) {
          if (!PRIMITIVE_TYPE_NAMES.has(typeName.text)) {
            references.push({ name: typeName.text, role });
          }
        } else if (ts.isPropertyAccessExpression(typeName)) {
          const fullName = typeName.getText();
          references.push({ name: fullName, role });
        }

        // Extract type arguments: extends Base<Widget>
        if (type.typeArguments) {
          type.typeArguments.forEach((typeArg, index) => {
            references.push(
              ...extractTypeReferencesFromTypeNode(typeArg, "type-argument", {
                argumentIndex: index
              })
            );
          });
        }
      }
    }
  }

  // Extract type parameters constraints
  if (declaration.typeParameters) {
    for (const typeParam of declaration.typeParameters) {
      if (typeParam.constraint) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint")
        );
      }
    }
  }

  return references;
}

/**
 * Extracts type references from an interface declaration's heritage and members.
 *
 * @param declaration - The interface declaration to analyze.
 * @returns An array of type references from extends clauses.
 */
function collectTypeReferencesFromInterface(
  declaration: ts.InterfaceDeclaration
): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract heritage clauses: extends OtherInterface
  if (declaration.heritageClauses) {
    for (const clause of declaration.heritageClauses) {
      for (const type of clause.types) {
        const typeName = type.expression;
        if (ts.isIdentifier(typeName)) {
          if (!PRIMITIVE_TYPE_NAMES.has(typeName.text)) {
            references.push({ name: typeName.text, role: "extends" });
          }
        } else if (ts.isPropertyAccessExpression(typeName)) {
          const fullName = typeName.getText();
          references.push({ name: fullName, role: "extends" });
        }

        // Extract type arguments
        if (type.typeArguments) {
          type.typeArguments.forEach((typeArg, index) => {
            references.push(
              ...extractTypeReferencesFromTypeNode(typeArg, "type-argument", {
                argumentIndex: index
              })
            );
          });
        }
      }
    }
  }

  // Extract type parameters constraints
  if (declaration.typeParameters) {
    for (const typeParam of declaration.typeParameters) {
      if (typeParam.constraint) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint")
        );
      }
    }
  }

  return references;
}

/**
 * Extracts type references from a type alias declaration.
 *
 * @param declaration - The type alias declaration to analyze.
 * @returns An array of type references from the aliased type.
 */
function collectTypeReferencesFromTypeAlias(
  declaration: ts.TypeAliasDeclaration
): TypeReference[] {
  const references: TypeReference[] = [];

  // Extract type parameters constraints
  if (declaration.typeParameters) {
    for (const typeParam of declaration.typeParameters) {
      if (typeParam.constraint) {
        references.push(
          ...extractTypeReferencesFromTypeNode(typeParam.constraint, "generic-constraint")
        );
      }
    }
  }

  // Extract references from the aliased type
  references.push(...extractTypeReferencesFromTypeNode(declaration.type, "return"));

  return references;
}

/**
 * Extracts type references from a variable declaration.
 *
 * @param declaration - The variable declaration to analyze.
 * @returns An array of type references from the variable's type annotation.
 */
function collectTypeReferencesFromVariable(
  declaration: ts.VariableDeclaration
): TypeReference[] {
  if (declaration.type) {
    return extractTypeReferencesFromTypeNode(declaration.type, "return");
  }
  return [];
}

/**
 * Deduplicates type references by name and role, preserving metadata flags.
 *
 * @param references - The array of type references to deduplicate.
 * @returns A deduplicated array of type references.
 */
function deduplicateTypeReferences(references: TypeReference[]): TypeReference[] {
  const seen = new Map<string, TypeReference>();

  for (const ref of references) {
    const key = `${ref.name}::${ref.role}::${ref.parameterName ?? ""}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, { ...ref });
    } else {
      // Merge flags
      if (ref.isUnionMember) existing.isUnionMember = true;
      if (ref.isIntersectionMember) existing.isIntersectionMember = true;
      if (ref.isArrayElement) existing.isArrayElement = true;
      if (ref.isPromiseResolution) existing.isPromiseResolution = true;
    }
  }

  return Array.from(seen.values());
}

// ─────────────────────────────────────────────────────────────────────────────
// End Type Reference Extraction
// ─────────────────────────────────────────────────────────────────────────────

function sortSymbolsByLocation(symbols: PublicSymbolEntry[]): PublicSymbolEntry[] {
  return [...symbols].sort((a, b) => {
    const aLine = a.location?.line ?? Number.MAX_SAFE_INTEGER;
    const bLine = b.location?.line ?? Number.MAX_SAFE_INTEGER;
    if (aLine !== bLine) {
      return aLine - bLine;
    }

    const aChar = a.location?.character ?? Number.MAX_SAFE_INTEGER;
    const bChar = b.location?.character ?? Number.MAX_SAFE_INTEGER;
    if (aChar !== bChar) {
      return aChar - bChar;
    }

    return a.name.localeCompare(b.name);
  });
}

function inferVariableKind(statement: ts.VariableStatement): string {
  const flags = ts.getCombinedNodeFlags(statement.declarationList);
  if (flags & ts.NodeFlags.Const) return "const";
  if (flags & ts.NodeFlags.Let) return "let";
  return "var";
}

function collectBindingNames(binding: ts.BindingName): string[] {
  const names: string[] = [];
  if (ts.isIdentifier(binding)) {
    names.push(binding.text);
    return names;
  }

  if (ts.isObjectBindingPattern(binding) || ts.isArrayBindingPattern(binding)) {
    for (const element of binding.elements) {
      if (ts.isBindingElement(element)) {
        names.push(...collectBindingNames(element.name));
      }
    }
  }

  return names;
}

/**
 * Enumerates import and export dependencies declared within a TypeScript source file.
 *
 * @remarks
 * Relative specifiers are resolved against the workspace using Node-style extension
 * fallbacks so the resulting Live Docs can point to concrete files when possible.
 *
 * @param params.sourceFile - Parsed source file that acts as the dependency origin.
 * @param params.absolutePath - Absolute path to the origin file, used for resolution.
 * @param params.workspaceRoot - Workspace root for normalising resolved paths.
 *
 * @see resolveDependency
 *
 * @returns A sorted list of dependency entries describing specifiers and imported symbols.
 */
export async function collectDependencies(params: {
  sourceFile: ts.SourceFile;
  absolutePath: string;
  workspaceRoot: string;
}): Promise<DependencyEntry[]> {
  const entries: DependencyEntry[] = [];

  for (const statement of params.sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const specifier = statement.moduleSpecifier.text;
      const symbols = extractImportNames(statement.importClause);
      const resolvedPath = await resolveDependency(specifier, params.absolutePath, params.workspaceRoot);
      entries.push({
        specifier,
        resolvedPath,
        symbols,
        kind: "import",
        isTypeOnly: statement.importClause?.isTypeOnly,
        location: getNodeLocation(statement, params.sourceFile)
      });
      continue;
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      const specifier = statement.moduleSpecifier.text;
      const symbolTargets: Record<string, string> = {};
      const symbols =
        statement.exportClause && ts.isNamedExports(statement.exportClause)
          ? statement.exportClause.elements.map((element) => {
              const exportedName = element.name.text;
              const originalName = element.propertyName?.text ?? exportedName;
              symbolTargets[exportedName] = originalName;
              return exportedName;
            })
          : [];
      const resolvedPath = await resolveDependency(specifier, params.absolutePath, params.workspaceRoot);
      const exportIsTypeOnly = Boolean(
        statement.isTypeOnly ||
          (statement.exportClause &&
            ts.isNamedExports(statement.exportClause) &&
            statement.exportClause.elements.length > 0 &&
            statement.exportClause.elements.every((element) => element.isTypeOnly))
      );
      entries.push({
        specifier,
        resolvedPath,
        symbols,
        kind: "export",
        isTypeOnly: exportIsTypeOnly,
        location: getNodeLocation(statement, params.sourceFile),
        symbolTargets: Object.keys(symbolTargets).length > 0 ? symbolTargets : undefined
      });
    }
  }

  entries.sort((a, b) => displayDependencyKey(a).localeCompare(displayDependencyKey(b)));
  return entries;
}

function mergeDependencyEntries(
  base: DependencyEntry[],
  extras: DependencyEntry[]
): DependencyEntry[] {
  if (extras.length === 0) {
    return base;
  }

  const map = new Map<string, DependencyEntry>();

  for (const entry of base) {
    const clone = cloneDependency(entry);
    map.set(displayDependencyKey(clone), clone);
  }

  for (const entry of extras) {
    const key = displayDependencyKey(entry);
    const existing = map.get(key);
    if (existing) {
      for (const symbol of entry.symbols) {
        if (!existing.symbols.includes(symbol)) {
          existing.symbols.push(symbol);
        }
      }
      existing.symbols.sort();

      if (!existing.resolvedPath && entry.resolvedPath) {
        existing.resolvedPath = entry.resolvedPath;
      }

      if (entry.symbolTargets) {
        existing.symbolTargets = mergeSymbolTargets(existing.symbolTargets, entry.symbolTargets);
      }

      if (entry.isTypeOnly && !existing.isTypeOnly) {
        existing.isTypeOnly = entry.isTypeOnly;
      }

      if (!existing.location && entry.location) {
        existing.location = { ...entry.location };
      }
      continue;
    }

    map.set(key, cloneDependency(entry));
  }

  const merged = Array.from(map.values());
  merged.sort((a, b) => displayDependencyKey(a).localeCompare(displayDependencyKey(b)));
  return merged;
}

function cloneDependency(entry: DependencyEntry): DependencyEntry {
  return {
    specifier: entry.specifier,
    resolvedPath: entry.resolvedPath,
    symbols: [...entry.symbols],
    kind: entry.kind,
    isTypeOnly: entry.isTypeOnly,
    location: entry.location ? { ...entry.location } : undefined,
    symbolTargets: entry.symbolTargets ? { ...entry.symbolTargets } : undefined
  };
}

function mergeSymbolTargets(
  existing: Record<string, string> | undefined,
  incoming: Record<string, string>
): Record<string, string> {
  if (!existing) {
    return { ...incoming };
  }
  return { ...existing, ...incoming };
}

function shouldInferDomDependencies(extension: string): boolean {
  switch (extension) {
    case ".ts":
    case ".tsx":
    case ".js":
    case ".jsx":
      return true;
    default:
      return false;
  }
}

async function augmentWithReExportedSymbols(params: {
  sourceAbsolute: string;
  workspaceRoot: string;
  dependencies: DependencyEntry[];
  existingSymbols: PublicSymbolEntry[];
}): Promise<{ symbols: PublicSymbolEntry[]; reExports: ReExportedSymbolInfo[] }> {
  if (!params.dependencies.some((entry) => entry.kind === "export")) {
    return { symbols: params.existingSymbols, reExports: [] };
  }

  const reExports = await collectReExportStarSymbols({
    sourceAbsolute: params.sourceAbsolute,
    workspaceRoot: params.workspaceRoot,
    dependencies: params.dependencies,
    existingSymbols: params.existingSymbols
  });

  if (reExports.length === 0) {
    return { symbols: params.existingSymbols, reExports: [] };
  }

  if (params.existingSymbols.length === 0) {
    const additions: PublicSymbolEntry[] = reExports.map((info) => ({
      name: info.name,
      kind: info.kind,
      isDefault: false,
      isTypeOnly: info.isTypeOnly,
      documentation: undefined,
      location: info.location
    }));
    return {
      symbols: [...params.existingSymbols, ...additions],
      reExports: []
    };
  }

  return { symbols: params.existingSymbols, reExports };
}

async function collectReExportStarSymbols(params: {
  sourceAbsolute: string;
  workspaceRoot: string;
  dependencies: DependencyEntry[];
  existingSymbols: PublicSymbolEntry[];
}): Promise<ReExportedSymbolInfo[]> {
  const results: ReExportedSymbolInfo[] = [];
  const seen = new Set(params.existingSymbols.map((entry) => entry.name));
  const cache = new Map<string, PublicSymbolEntry[]>();

  for (const dependency of params.dependencies) {
    if (dependency.kind !== "export") {
      continue;
    }

    if (!dependency.resolvedPath) {
      continue;
    }

    if (dependency.symbols.length > 0) {
      // Named re-exports already contribute symbols via collectExportedSymbols.
      continue;
    }

    const targetAbsolute = path.resolve(params.workspaceRoot, dependency.resolvedPath);
    const stack = new Set<string>([path.resolve(params.sourceAbsolute)]);
    const exportedSymbols = await gatherExportedSymbolsFromFile({
      absolutePath: targetAbsolute,
      workspaceRoot: params.workspaceRoot,
      cache,
      stack
    });

    if (!exportedSymbols.length) {
      continue;
    }

    for (const symbol of exportedSymbols) {
      if (!symbol.name || symbol.isDefault || seen.has(symbol.name)) {
        continue;
      }

      results.push({
        name: symbol.name,
        kind: symbol.kind,
        isTypeOnly: symbol.isTypeOnly,
        location: dependency.location ?? { line: 1, character: 1 },
        sourceModulePath: dependency.resolvedPath
      });
      seen.add(symbol.name);
    }
  }

  return results;
}

async function gatherExportedSymbolsFromFile(params: {
  absolutePath: string;
  workspaceRoot: string;
  cache: Map<string, PublicSymbolEntry[]>;
  stack: Set<string>;
}): Promise<PublicSymbolEntry[]> {
  const normalized = path.resolve(params.absolutePath);

  if (params.cache.has(normalized)) {
    return params.cache.get(normalized)!;
  }

  if (params.stack.has(normalized)) {
    return [];
  }

  params.stack.add(normalized);

  const extension = path.extname(normalized).toLowerCase();
  if (!SUPPORTED_SCRIPT_EXTENSIONS.has(extension)) {
    params.stack.delete(normalized);
    params.cache.set(normalized, []);
    return [];
  }

  let content: string;
  try {
    content = await fs.readFile(normalized, "utf8");
  } catch {
    params.stack.delete(normalized);
    params.cache.set(normalized, []);
    return [];
  }

  const scriptKind = inferScriptKind(extension);
  const sourceFile = ts.createSourceFile(
    normalized,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  const directSymbols = collectExportedSymbols(sourceFile);
  const dependencies = await collectDependencies({
    sourceFile,
    absolutePath: normalized,
    workspaceRoot: params.workspaceRoot
  });

  const aggregated: PublicSymbolEntry[] = [...directSymbols];

  for (const dependency of dependencies) {
    if (dependency.kind !== "export" || dependency.symbols.length > 0 || !dependency.resolvedPath) {
      continue;
    }

    const childAbsolute = path.resolve(params.workspaceRoot, dependency.resolvedPath);
    const nested = await gatherExportedSymbolsFromFile({
      absolutePath: childAbsolute,
      workspaceRoot: params.workspaceRoot,
      cache: params.cache,
      stack: params.stack
    });

    for (const entry of nested) {
      if (!entry.name || entry.isDefault) {
        continue;
      }
      if (!aggregated.some((candidate) => candidate.name === entry.name)) {
        aggregated.push(entry);
      }
    }
  }

  params.stack.delete(normalized);
  params.cache.set(normalized, aggregated);
  return aggregated;
}

function extractImportNames(importClause: ts.ImportClause | undefined): string[] {
  if (!importClause) {
    return [];
  }

  const names: string[] = [];

  if (importClause.name) {
    names.push(importClause.name.text);
  }

  if (!importClause.namedBindings) {
    return names;
  }

  if (ts.isNamespaceImport(importClause.namedBindings)) {
    names.push(importClause.namedBindings.name.text);
    return names;
  }

  if (ts.isNamedImports(importClause.namedBindings)) {
    for (const element of importClause.namedBindings.elements) {
      const importedName = element.propertyName?.text ?? element.name.text;
      names.push(importedName);
    }
  }

  return names;
}

/**
 * Resolves a relative module specifier to a workspace-relative file path.
 *
 * @param specifier - Module specifier as written in the source file (for example, "./utils").
 * @param fromFile - Absolute path to the file containing the specifier.
 * @param workspaceRoot - Workspace root used to convert to a relative path.
 *
 * @see collectDependencies
 *
 * @returns The normalised relative path when resolution succeeds, otherwise `undefined`.
 */
export async function resolveDependency(
  specifier: string,
  fromFile: string,
  workspaceRoot: string
): Promise<string | undefined> {
  if (!specifier.startsWith(".")) {
    return resolveWorkspaceAlias(specifier, workspaceRoot);
  }

  const base = path.resolve(path.dirname(fromFile), specifier);
  const resolved = await resolveWithExtensions(base);
  if (!resolved) {
    return undefined;
  }

  return normalizeWorkspacePath(path.relative(workspaceRoot, resolved));
}

async function resolveWorkspaceAlias(
  specifier: string,
  workspaceRoot: string
): Promise<string | undefined> {
  const prefix = "@copilot-improvement/";
  if (!specifier.startsWith(prefix)) {
    if (specifier.startsWith("@/")) {
      const remainder = specifier.slice(2);
      return resolveAliasCandidates(workspaceRoot, [path.resolve(workspaceRoot, "src", remainder)]);
    }

    if (specifier.startsWith("~/")) {
      const remainder = specifier.slice(2);
      return resolveAliasCandidates(workspaceRoot, [path.resolve(workspaceRoot, "src", remainder)]);
    }

    const aliasMatch = specifier.match(/^@([^/]+)\/?(.*)$/);
    if (aliasMatch) {
      const [, aliasName, rawRemainder] = aliasMatch;
      const remainder = rawRemainder ?? "";
      const candidates: string[] = [];
      candidates.push(path.resolve(workspaceRoot, "packages", aliasName, "src", remainder));
      candidates.push(path.resolve(workspaceRoot, "src", aliasName, remainder));
      if (remainder) {
        candidates.push(path.resolve(workspaceRoot, "src", remainder));
      }

      const resolved = await resolveAliasCandidates(workspaceRoot, candidates);
      if (resolved) {
        return resolved;
      }
    }

    if (specifier.startsWith("src/")) {
      return resolveAliasCandidates(workspaceRoot, [path.resolve(workspaceRoot, specifier)]);
    }

    return undefined;
  }

  const remainder = specifier.slice(prefix.length);
  if (!remainder) {
    return undefined;
  }

  const segments = remainder.split("/");
  const packageName = segments.shift();
  if (!packageName) {
    return undefined;
  }

  const candidateBase = path.resolve(workspaceRoot, "packages", packageName, "src", ...segments);
  const matched = await resolveWithExtensions(candidateBase);
  if (!matched) {
    return undefined;
  }
  return normalizeWorkspacePath(path.relative(workspaceRoot, matched));
}

async function resolveAliasCandidates(
  workspaceRoot: string,
  candidates: string[]
): Promise<string | undefined> {
  for (const candidate of candidates) {
    const matched = await resolveWithExtensions(candidate);
    if (matched) {
      return normalizeWorkspacePath(path.relative(workspaceRoot, matched));
    }
  }
  return undefined;
}

async function resolveWithExtensions(basePath: string): Promise<string | undefined> {
  const attempts: string[] = [];
  const explicitExt = path.extname(basePath);

  if (explicitExt) {
    attempts.push(basePath);
  } else {
    for (const ext of MODULE_RESOLUTION_EXTENSIONS) {
      attempts.push(`${basePath}${ext}`);
    }
  }

  const indexBase = explicitExt ? basePath.slice(0, basePath.length - explicitExt.length) : basePath;
  for (const ext of MODULE_RESOLUTION_EXTENSIONS) {
    attempts.push(path.join(indexBase, `index${ext}`));
  }

  for (const candidate of attempts) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

async function fileExists(candidate: string): Promise<boolean> {
  try {
    const stats = await fs.stat(candidate);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Renders the markdown lines that populate the `Public Symbols` section for a Live Doc.
 *
 * @remarks
 * The output includes symbol metadata (type, location, qualifiers) followed by
 * deterministic `#####` subsections per documented field (summary, remarks,
 * parameters, returns, etc.). This structure keeps docstring bridges stable and
 * individually addressable across languages.
 *
 * @param args.analysis - Analyzer output describing exported symbols and dependencies.
 * @param args.docDir - Absolute directory path of the Live Doc being written.
 * @param args.sourceAbsolute - Absolute path to the source file backing this Live Doc.
 * @param args.workspaceRoot - Workspace root, used to resolve relative links.
 * @param args.sourceRelativePath - Workspace-relative source path (unused here but
 * preserved for parity with other render helpers).
 *
 * @returns An array of markdown lines ready to insert beneath the `Public Symbols` heading.
 *
 * @example
 * ```ts
 * const lines = renderPublicSymbolLines({
 *   analysis,
 *   docDir,
 *   sourceAbsolute,
 *   workspaceRoot,
 *   sourceRelativePath
 * });
 * ```
 *
 * @see renderDependencyLines
 */
export interface PublicSymbolHeadingInfo {
  symbol: PublicSymbolEntry;
  displayName: string;
  slug: string;
}

function normalizeSymbolNameKey(name: string): string {
  return name.trim().toLowerCase();
}

export function computePublicSymbolHeadingInfo(symbols: PublicSymbolEntry[]): PublicSymbolHeadingInfo[] {
  const infos: PublicSymbolHeadingInfo[] = [];
  const nameCounts = new Map<string, number>();
  const nameKindCounts = new Map<string, number>();
  const slugCounts = new Map<string, number>();
  const slugKindCounts = new Map<string, number>();

  for (const symbol of symbols) {
    const normalizedNameKey = normalizeSymbolNameKey(symbol.name);
    const kindLabel = symbol.kind ?? "symbol";
    const nameKindKey = `${normalizedNameKey}::${kindLabel}`;

    nameCounts.set(normalizedNameKey, (nameCounts.get(normalizedNameKey) ?? 0) + 1);
    nameKindCounts.set(nameKindKey, (nameKindCounts.get(nameKindKey) ?? 0) + 1);

    const slugValue = createSymbolSlug(symbol.name) ?? "";
    if (slugValue) {
      const slugKindKey = `${slugValue}::${kindLabel}`;
      slugCounts.set(slugValue, (slugCounts.get(slugValue) ?? 0) + 1);
      slugKindCounts.set(slugKindKey, (slugKindCounts.get(slugKindKey) ?? 0) + 1);
    }
  }

  const kindOccurrences = new Map<string, number>();

  for (const symbol of symbols) {
    const normalizedNameKey = normalizeSymbolNameKey(symbol.name);
    const kindLabel = symbol.kind ?? "symbol";
    const nameKindKey = `${normalizedNameKey}::${kindLabel}`;
    const initialSlug = createSymbolSlug(symbol.name) ?? "";
    const slugKindKey = initialSlug ? `${initialSlug}::${kindLabel}` : undefined;

    let occurrence = 0;
    let occurrenceKey: string | undefined;

    const duplicateNameCount = nameCounts.get(normalizedNameKey) ?? 0;
    const duplicateKindCount = nameKindCounts.get(nameKindKey) ?? 0;
    const slugCollisionCount = initialSlug ? slugCounts.get(initialSlug) ?? 0 : 0;
    const slugKindCollisionCount = slugKindKey ? slugKindCounts.get(slugKindKey) ?? 0 : 0;
    const normalizedName = normalizedNameKey;
    const isReservedHeadingName = RESERVED_HEADING_NAMES.has(normalizedName);
    const baseSlug = initialSlug;

    const shouldDisambiguateByName = duplicateNameCount > 1;
    const shouldDisambiguateBySlug = !shouldDisambiguateByName && slugCollisionCount > 1;

    if (shouldDisambiguateByName) {
      occurrenceKey = nameKindKey;
    } else if (shouldDisambiguateBySlug && slugKindKey) {
      occurrenceKey = slugKindKey;
    }

    if (occurrenceKey) {
      occurrence = (kindOccurrences.get(occurrenceKey) ?? 0) + 1;
      kindOccurrences.set(occurrenceKey, occurrence);
    }

    let displayName = symbol.name;
    if (shouldDisambiguateByName || shouldDisambiguateBySlug) {
      const kindSpecificCount = shouldDisambiguateByName ? duplicateKindCount : slugKindCollisionCount;
      if (kindSpecificCount === 1 && symbol.kind) {
        displayName = `${symbol.name} (${symbol.kind})`;
      } else {
        const labelBase = symbol.kind ? `${symbol.kind} overload` : "variant";
        const ordinal = occurrence > 0 ? occurrence : 1;
        displayName = `${symbol.name} (${labelBase} ${ordinal})`;
      }
    } else if (isReservedHeadingName) {
      const descriptiveKind = symbol.kind ?? "symbol";
      displayName = `${symbol.name} (${descriptiveKind})`;
    }

    let resolvedSlug: string;
    if (shouldDisambiguateByName || shouldDisambiguateBySlug) {
      resolvedSlug = createSymbolSlug(displayName) ?? baseSlug;
    } else if (isReservedHeadingName) {
      resolvedSlug = baseSlug || createSymbolSlug(displayName) || "";
    } else {
      resolvedSlug = createSymbolSlug(displayName) ?? baseSlug;
    }
    infos.push({
      symbol,
      displayName,
      slug: resolvedSlug
    });
  }

  ensureUniqueSymbolSlugs(infos);

  return infos;
}

function ensureUniqueSymbolSlugs(headings: PublicSymbolHeadingInfo[]): void {
  const used = new Set<string>();
  const suffixCounts = new Map<string, number>();

  for (const heading of headings) {
    if (!heading.slug) {
      continue;
    }

    const baseSlug = heading.slug;
    const normalizedBase = baseSlug.toLowerCase();
    if (!used.has(normalizedBase)) {
      used.add(normalizedBase);
      continue;
    }

    let suffix = suffixCounts.get(baseSlug) ?? 0;
    let candidate: string;
    do {
      suffix += 1;
      candidate = `${baseSlug}-${suffix}`;
    } while (used.has(candidate.toLowerCase()));

    suffixCounts.set(baseSlug, suffix);
    heading.slug = candidate;
    used.add(candidate.toLowerCase());
  }
}

export function renderPublicSymbolLines(args: {
  analysis: SourceAnalysisResult;
  docDir: string;
  sourceAbsolute: string;
  workspaceRoot: string;
  sourceRelativePath: string;
  headings: PublicSymbolHeadingInfo[];
  /** Optional workspace-wide symbol index for resolving type references to Live Doc links. */
  symbolIndex?: WorkspaceSymbolIndex;
  /** Absolute path to the Live Docs root (e.g., "/workspace/.mdmd/layer-4"). */
  liveDocsRootAbsolute?: string;
}): string[] {
  const lines: string[] = [];

  for (const info of args.headings) {
    const symbol = info.symbol;
    const anchorSuffix = info.slug ? ` {#${info.slug}}` : "";
    lines.push(`#### \`${info.displayName}\`${anchorSuffix}`);

    const detailLines: string[] = [];
    const displayKind = symbol.kind ? symbol.kind : "symbol";

    const typeSuffixParts: string[] = [];
    if (symbol.isDefault) {
      typeSuffixParts.push("default");
    }
    if (symbol.isTypeOnly) {
      typeSuffixParts.push("type-only");
    }
    const typeSuffix = typeSuffixParts.length > 0 ? ` (${typeSuffixParts.join(", ")})` : "";
    detailLines.push(`- Type: ${displayKind}${typeSuffix}`);

    if (symbol.location) {
      const location = formatSourceLink({
        docDir: args.docDir,
        sourceAbsolute: args.sourceAbsolute,
        line: symbol.location.line
      });
      detailLines.push(`- Source: [source](${location})`);
    }

    // Render type references if present
    const typeRefLines = renderTypeReferences(
      symbol.typeReferences,
      args.symbolIndex,
      args.sourceRelativePath,
      args.docDir,
      args.liveDocsRootAbsolute
    );
    if (typeRefLines.length > 0) {
      detailLines.push(...typeRefLines);
    }

    if (detailLines.length > 0) {
      lines.push(...detailLines);
    }

    const documentationLines = renderSymbolDocumentationSections(symbol, info.displayName);
    if (documentationLines.length > 0) {
      lines.push("", ...documentationLines);
    }

    lines.push("");
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines;
}

/**
 * Renders type references as markdown bullet points with optional Live Doc links.
 *
 * @remarks
 * Groups type references by role (returns, parameters, extends, implements)
 * and formats them as readable bullet points. When a symbol index is provided,
 * type names that resolve to workspace symbols are rendered as markdown links
 * to their Live Doc definitions.
 *
 * @param typeReferences - Array of type references extracted from the symbol.
 * @param symbolIndex - Optional workspace-wide symbol index for resolving type links.
 * @param currentSourcePath - Source path of the current file (to avoid self-links).
 * @param docDir - Directory of the current Live Doc (for relative path calculation).
 * @param liveDocsRootAbsolute - Absolute path to Live Docs root.
 * @returns Array of markdown lines representing the type references.
 */
function renderTypeReferences(
  typeReferences: TypeReference[] | undefined,
  symbolIndex?: WorkspaceSymbolIndex,
  currentSourcePath?: string,
  docDir?: string,
  liveDocsRootAbsolute?: string
): string[] {
  if (!typeReferences || typeReferences.length === 0) {
    return [];
  }

  const lines: string[] = [];

  // Create a type formatter with the resolution context
  const formatType = (ref: TypeReference): string => {
    return formatTypeReference(ref, symbolIndex, currentSourcePath, docDir, liveDocsRootAbsolute);
  };

  // Group by role
  const returnTypes = typeReferences.filter((ref) => ref.role === "return");
  const paramTypes = typeReferences.filter((ref) => ref.role === "parameter");
  const extendsTypes = typeReferences.filter((ref) => ref.role === "extends");
  const implementsTypes = typeReferences.filter((ref) => ref.role === "implements");
  const constraintTypes = typeReferences.filter((ref) => ref.role === "generic-constraint");

  // Render return types
  if (returnTypes.length > 0) {
    const formatted = formatTypeListWithLinks(returnTypes, formatType);
    lines.push(`- Returns: ${formatted}`);
  }

  // Render parameter types (grouped by parameter name)
  const paramsByName = new Map<string, TypeReference[]>();
  for (const param of paramTypes) {
    const name = param.parameterName ?? "_unnamed_";
    const existing = paramsByName.get(name) ?? [];
    existing.push(param);
    paramsByName.set(name, existing);
  }

  if (paramsByName.size > 0) {
    const paramEntries = Array.from(paramsByName.entries())
      .map(([name, refs]) => `\`${name}\`: ${formatTypeListWithLinks(refs, formatType)}`)
      .join("; ");
    lines.push(`- Parameters: ${paramEntries}`);
  }

  // Render extends
  if (extendsTypes.length > 0) {
    const formatted = formatTypeListWithLinks(extendsTypes, formatType);
    lines.push(`- Extends: ${formatted}`);
  }

  // Render implements
  if (implementsTypes.length > 0) {
    const formatted = formatTypeListWithLinks(implementsTypes, formatType);
    lines.push(`- Implements: ${formatted}`);
  }

  // Render generic constraints
  if (constraintTypes.length > 0) {
    const formatted = formatTypeListWithLinks(constraintTypes, formatType);
    lines.push(`- Constraints: ${formatted}`);
  }

  return lines;
}

/**
 * Formats a single type reference, optionally as a link if resolvable.
 *
 * @param ref - The type reference to format.
 * @param symbolIndex - Optional workspace symbol index.
 * @param currentSourcePath - Current source path to avoid self-links.
 * @param docDir - Current Live Doc directory for relative path calculation.
 * @param liveDocsRootAbsolute - Absolute path to Live Docs root.
 * @returns Formatted type string (code span or link).
 */
function formatTypeReference(
  ref: TypeReference,
  symbolIndex?: WorkspaceSymbolIndex,
  currentSourcePath?: string,
  docDir?: string,
  liveDocsRootAbsolute?: string
): string {
  // Try to resolve the type to a Live Doc
  let resolved: ResolvedSymbolLocation | undefined;
  if (symbolIndex && currentSourcePath) {
    resolved = resolveTypeToLiveDoc(ref.name, symbolIndex, currentSourcePath);
  }

  let formatted: string;

  if (resolved && docDir && liveDocsRootAbsolute) {
    // Compute relative path from current doc to target Live Doc
    const targetDocAbsolute = path.resolve(
      liveDocsRootAbsolute,
      "..",  // Go up from liveDocsRoot (which is .mdmd/layer-4) to .mdmd
      "..",  // Go up to workspace root
      resolved.liveDocPath
    );
    const relativePath = formatRelativePathFromDoc(docDir, targetDocAbsolute);
    const fragment = resolved.anchor ? `#${resolved.anchor}` : "";
    formatted = `[\`${ref.name}\`](${relativePath}${fragment})`;
  } else {
    // No resolution — render as plain code span
    formatted = `\`${ref.name}\``;
  }

  // Add array indicator
  if (ref.isArrayElement) {
    formatted = `${formatted}[]`;
  }

  // Add Promise indicator
  if (ref.isPromiseResolution) {
    formatted = `Promise<${formatted}>`;
  }

  return formatted;
}

/**
 * Formats a list of type references with optional links.
 *
 * @param refs - Array of type references to format.
 * @param formatFn - Function to format each individual type reference.
 * @returns A comma-separated string of formatted type names.
 */
function formatTypeListWithLinks(
  refs: TypeReference[],
  formatFn: (ref: TypeReference) => string
): string {
  const formatted = refs.map(formatFn);
  // Deduplicate and join
  const unique = [...new Set(formatted)];
  return unique.join(", ");
}

function renderSymbolDocumentationSections(symbol: PublicSymbolEntry, displayName: string): string[] {
  const documentation = symbol.documentation;
  if (!documentation) {
    return [];
  }

  const sections: Array<{ title: string; body: string[] }> = [];
  const pushSection = (title: string, body: string[] | undefined): void => {
    if (!body || body.length === 0) {
      return;
    }
    sections.push({ title, body });
  };

  pushSection("Summary", normalizeDocText(documentation.summary));
  pushSection("Remarks", normalizeDocText(documentation.remarks));

  if (documentation.parameters && documentation.parameters.length > 0) {
    const parameterLines = documentation.parameters.map((param) => {
      const description = param.description?.trim()
        ? param.description.trim()
        : "_Not documented_";
      return `- \`${param.name}\`: ${description}`;
    });
    pushSection("Parameters", parameterLines);
  }

  if (documentation.typeParameters && documentation.typeParameters.length > 0) {
    const typeParameterLines = documentation.typeParameters.map((param) => {
      const description = param.description?.trim()
        ? param.description.trim()
        : "_Not documented_";
      return `- \`${param.name}\`: ${description}`;
    });
    pushSection("Type Parameters", typeParameterLines);
  }

  pushSection("Returns", normalizeDocText(documentation.returns));
  pushSection("Value", normalizeDocText(documentation.value));

  if (documentation.exceptions && documentation.exceptions.length > 0) {
    const exceptionLines = documentation.exceptions.map((exception) => {
      const head = exception.type ? `\`${exception.type}\`` : "_Unknown_";
      if (exception.description?.trim()) {
        return `- ${head}: ${exception.description.trim()}`;
      }
      return `- ${head}`;
    });
    pushSection("Exceptions", exceptionLines);
  }

  if (documentation.examples && documentation.examples.length > 0) {
    const exampleLines: string[] = [];
    documentation.examples.forEach((example, index) => {
      if (index > 0) {
        exampleLines.push("");
      }
      const descriptionLines = normalizeDocText(example.description);
      if (descriptionLines) {
        exampleLines.push(...descriptionLines);
      }
      if (example.code) {
          if (exampleLines.length > 0 && exampleLines[exampleLines.length - 1] !== "") {
            exampleLines.push("");
          }
        const fence = example.language ? `\`\`\`${example.language}` : "```";
        exampleLines.push(fence);
        exampleLines.push(example.code);
        exampleLines.push("```");
      }
    });
    pushSection("Examples", exampleLines);
  }

  if (documentation.links && documentation.links.length > 0) {
    const linkLines = documentation.links.map((link) => {
      switch (link.kind) {
        case "href": {
          const label = link.text?.trim() || link.target;
          return `- [${label}](${link.target})`;
        }
        case "cref": {
          const suffix = link.text?.trim() ? ` — ${link.text.trim()}` : "";
          return `- \`${link.target}\`${suffix}`;
        }
        default: {
          const suffix = link.text?.trim() ? ` — ${link.text.trim()}` : "";
          return `- ${link.target}${suffix}`;
        }
      }
    });
    pushSection("Links", linkLines);
  }

  if (documentation.rawFragments && documentation.rawFragments.length > 0) {
    const rawLines = documentation.rawFragments.map((fragment) => `- ${fragment}`);
    pushSection("Additional Documentation", rawLines);
  }

  if (documentation.unsupportedTags && documentation.unsupportedTags.length > 0) {
    const unsupportedLines = documentation.unsupportedTags.map((tag) => `- \`${tag}\``);
    pushSection("Unsupported Doc Tags", unsupportedLines);
  }

  if (sections.length === 0) {
    return [];
  }

  const headingPrefix = `##### \`${displayName}\` — `;
  const lines: string[] = [];

  for (const section of sections) {
    lines.push(`${headingPrefix}${section.title}`);
    lines.push(...section.body);
    lines.push("");
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines;
}

function normalizeDocText(value?: string): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const lines = value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/u, ""));

  let start = 0;
  while (start < lines.length && lines[start].trim() === "") {
    start += 1;
  }
  let end = lines.length - 1;
  while (end >= start && lines[end].trim() === "") {
    end -= 1;
  }

  const normalized = lines.slice(start, end + 1);
  return normalized.length > 0 ? normalized : undefined;
}

/**
 * Renders the markdown bullet list for a Live Doc's `Dependencies` section.
 *
 * @remarks
 * Module specifiers that resolve inside the workspace are linked directly to
 * their Live Doc counterparts, while external dependencies are emitted as inline
 * code with optional symbol suffixes.
 *
 * @param args.analysis - Analyzer output describing imported and re-exported modules.
 * @param args.docDir - Directory containing the Live Doc being written.
 * @param args.workspaceRoot - Workspace root used to compute relative links.
 * @param args.liveDocsRootAbsolute - Absolute path to the Live Docs mirror root.
 *
 * @see renderPublicSymbolLines
 *
 * @returns Markdown lines suitable for the `Dependencies` section, or an empty array when none exist.
 */
export function renderDependencyLines(args: {
  analysis: SourceAnalysisResult;
  docDir: string;
  workspaceRoot: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
  headings: PublicSymbolHeadingInfo[];
}): string[] {
  if (args.analysis.dependencies.length === 0) {
    return [];
  }

  const slugIndex = buildSymbolSlugIndex(args.headings);
  const grouped = new Map<
    string,
    { entry: DependencyEntry; symbols: Set<string>; targets: Record<string, string> }
  >();

  for (const dependency of args.analysis.dependencies) {
    const key = displayDependencyKey(dependency);
    const bucket =
      grouped.get(key) ?? {
        entry: dependency,
        symbols: new Set<string>(),
        targets: {}
      };
    for (const symbol of dependency.symbols) {
      bucket.symbols.add(symbol);
      const targetName = dependency.symbolTargets?.[symbol];
      if (targetName) {
        bucket.targets[symbol] = targetName;
      } else if (!bucket.targets[symbol]) {
        bucket.targets[symbol] = symbol;
      }
    }
    grouped.set(key, bucket);
  }

  const keys = Array.from(grouped.keys()).sort();
  const lines: string[] = [];

  for (const key of keys) {
    const bucket = grouped.get(key)!;
    const dependency = bucket.entry;
    const qualifierSuffix = formatDependencyQualifier(dependency);

    if (dependency.resolvedPath) {
      const moduleLabel = toModuleLabel(dependency.resolvedPath);
      const docAbsolute = path.resolve(
        args.liveDocsRootAbsolute,
        `${dependency.resolvedPath}${args.docExtension}`
      );
      const docRelative = formatRelativePathFromDoc(args.docDir, docAbsolute);
      const symbols = Array.from(bucket.symbols).sort();

      if (symbols.length === 0) {
        lines.push(`- [${formatInlineCode(moduleLabel)}](${docRelative})${qualifierSuffix}`);
        continue;
      }

      for (const symbolName of symbols) {
        const anchorName = bucket.targets[symbolName] ?? symbolName;
        const slug = resolveSymbolSlug(anchorName, slugIndex) ?? createSymbolSlug(anchorName);
        const fragment = slug ? `#${slug}` : "";
        const label = `${moduleLabel}.${symbolName}`;
        lines.push(`- [${formatInlineCode(label)}](${docRelative}${fragment})${qualifierSuffix}`);
      }
      continue;
    }

    const externalSymbols = Array.from(bucket.symbols)
      .sort()
      .map((name) => formatInlineCode(name));
    const symbolSuffix = externalSymbols.length ? ` - ${externalSymbols.join(", ")}` : "";
    lines.push(`- ${formatInlineCode(dependency.specifier)}${symbolSuffix}${qualifierSuffix}`);
  }

  return lines;
}

function buildSymbolSlugIndex(headings: PublicSymbolHeadingInfo[]): Map<string, string> {
  const index = new Map<string, string>();

  for (const info of headings) {
    registerSymbolAlias(index, info.displayName, info.slug);
    registerSymbolAlias(index, info.symbol.name, info.slug);
    if (info.symbol.qualifiedName) {
      registerSymbolAlias(index, info.symbol.qualifiedName, info.slug);
    }
  }

  return index;
}

function registerSymbolAlias(index: Map<string, string>, alias: string | undefined, slugValue: string): void {
  if (!alias || !slugValue) {
    return;
  }

  const trimmed = alias.trim();
  if (!trimmed) {
    return;
  }

  const lower = trimmed.toLowerCase();
  if (!index.has(trimmed)) {
    index.set(trimmed, slugValue);
  }
  if (!index.has(lower)) {
    index.set(lower, slugValue);
  }
}

function resolveSymbolSlug(alias: string | undefined, index: Map<string, string>): string | undefined {
  if (!alias) {
    return undefined;
  }

  const direct = index.get(alias) ?? index.get(alias.toLowerCase());
  if (direct) {
    return direct;
  }

  const segments = alias.split(".");
  if (segments.length > 1) {
    const last = segments[segments.length - 1];
    const resolved = index.get(last) ?? index.get(last.toLowerCase());
    if (resolved) {
      return resolved;
    }
  }

  return undefined;
}

export function renderReExportedAnchorLines(args: {
  reExports: ReExportedSymbolInfo[];
  docDir: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
}): string[] {
  if (args.reExports.length === 0) {
    return [];
  }

  const sorted = [...args.reExports].sort((a, b) => a.name.localeCompare(b.name));
  const lines: string[] = [];

  for (const entry of sorted) {
    const slugValue = createSymbolSlug(entry.name);
    const anchorSuffix = slugValue ? ` {#${slugValue}}` : "";
    lines.push(`#### \`${entry.name}\`${anchorSuffix}`);

    const qualifierParts: string[] = [];
    if (entry.isTypeOnly) {
      qualifierParts.push("type-only");
    }

    if (entry.sourceModulePath) {
      const moduleDocAbsolute = path.resolve(
        args.liveDocsRootAbsolute,
        `${entry.sourceModulePath}${args.docExtension}`
      );
      const relative = formatRelativePathFromDoc(args.docDir, moduleDocAbsolute);
      const moduleLabel = toModuleLabel(entry.sourceModulePath);
      const fragment = slugValue ? `#${slugValue}` : "";
      const qualifierSuffix = qualifierParts.length ? ` (${qualifierParts.join(", ")})` : "";
      lines.push(
        `- Re-exported from [${formatInlineCode(moduleLabel)}](${relative}${fragment})${qualifierSuffix}`
      );
    } else {
      const qualifierSuffix = qualifierParts.length ? ` (${qualifierParts.join(", ")})` : "";
      lines.push(`- Re-exported from external module${qualifierSuffix}`);
    }

    lines.push("");
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines;
}

export function formatSourceLink(params: { docDir: string; sourceAbsolute: string; line: number }): string {
  const relative = formatRelativePathFromDoc(params.docDir, params.sourceAbsolute);
  return `${relative}#L${params.line}`;
}

export function formatRelativePathFromDoc(docDir: string, targetAbsolute: string): string {
  const relative = path.relative(docDir, targetAbsolute).split(path.sep).join("/");
  if (!relative.startsWith(".")) {
    return `./${relative}`;
  }
  return relative;
}

export function createSymbolSlug(name: string): string | undefined {
  const candidate = slug(`\`${name}\``);
  if (!candidate || candidate.length === 0) {
    return undefined;
  }

  return `symbol-${candidate}`;
}

export function toModuleLabel(workspaceRelativePath: string): string {
  const baseName = path.basename(workspaceRelativePath);
  const withoutExtension = baseName.replace(/\.[^.]+$/, "");
  return withoutExtension || baseName || workspaceRelativePath;
}

export function formatInlineCode(value: string): string {
  const sanitized = value.replace(/`/g, "'");
  return `\`${sanitized}\``;
}

export function formatDependencyQualifier(dependency: DependencyEntry): string {
  const qualifiers: string[] = [];
  if (dependency.kind === "export") {
    qualifiers.push("re-export");
  }
  if (dependency.isTypeOnly) {
    qualifiers.push("type-only");
  }
  if (!qualifiers.length) {
    return "";
  }
  return ` (${qualifiers.join(", ")})`;
}

export function resolveExportAssignmentName(expression: ts.Expression): string | undefined {
  if (ts.isIdentifier(expression)) {
    return expression.text;
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return expression.getText();
  }
  return "default";
}

export function hasExportModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }
  const modifiers = ts.getModifiers(node) ?? [];
  return modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

export function hasDefaultModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }
  const modifiers = ts.getModifiers(node) ?? [];
  return modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
}

export function getNodeLocation(node: ts.Node, sourceFile: ts.SourceFile): LocationInfo {
  const position = node.getStart(sourceFile);
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(position);
  return {
    line: line + 1,
    character: character + 1
  };
}

export function extractJsDocDocumentation(node: ts.Node): SymbolDocumentation | undefined {
  const docEntries = ts.getJSDocCommentsAndTags(node);
  if (!docEntries.length) {
    return undefined;
  }

  const documentation: SymbolDocumentation = {
    source: "tsdoc"
  };

  const parameterMap = new Map<string, string | undefined>();
  const typeParameterMap = new Map<string, string | undefined>();
  const examples: SymbolDocumentationExample[] = [];
  const links: SymbolDocumentationLink[] = [];
  const linkKeys = new Set<string>();
  const exceptions: SymbolDocumentationException[] = [];
  const rawFragments: string[] = [];

  const appendBlock = (current: string | undefined, addition?: string): string | undefined => {
    if (!addition) {
      return current;
    }
    const trimmed = addition.trim();
    if (!trimmed) {
      return current;
    }
    if (!current) {
      return trimmed;
    }
    return `${current}\n\n${trimmed}`;
  };

  const registerLink = (target: string, text?: string): void => {
    if (!target) {
      return;
    }
    const normalizedTarget = target.trim();
    if (!normalizedTarget) {
      return;
    }
    const kind: SymbolDocumentationLinkKind = /^https?:\/\//i.test(normalizedTarget)
      ? "href"
      : "cref";
    const normalizedText = text?.trim();
    const key = `${kind}|${normalizedTarget}|${normalizedText ?? ""}`;
    if (linkKeys.has(key)) {
      return;
    }
    linkKeys.add(key);
    links.push({
      kind,
      target: normalizedTarget,
      text: normalizedText && normalizedText !== normalizedTarget ? normalizedText : undefined
    });
  };

  const registerExample = (comment?: string): void => {
    if (!comment) {
      return;
    }
    const trimmed = comment.trim();
    if (!trimmed) {
      return;
    }
    const fenceMatch = trimmed.match(/```(\w*)\s*([\s\S]*?)```/);
    if (fenceMatch) {
      const [, language, codeBlock] = fenceMatch;
      const description = trimmed.replace(fenceMatch[0], "").trim();
      examples.push({
        description: description || undefined,
        code: codeBlock.trimEnd(),
        language: language || undefined
      });
      return;
    }
    examples.push({ description: trimmed });
  };

  const handleGenericTag = (tagName: string, commentText?: string): void => {
    switch (tagName) {
      case "remarks": {
        documentation.remarks = appendBlock(documentation.remarks, commentText);
        return;
      }
      case "example": {
        registerExample(commentText);
        return;
      }
      case "see":
      case "link": {
        if (commentText) {
          registerLink(commentText, commentText);
        }
        return;
      }
      case "deprecated": {
        rawFragments.push(`@deprecated${commentText ? ` ${commentText.trim()}` : ""}`.trim());
        return;
      }
      default: {
        if (commentText?.trim()) {
          rawFragments.push(`@${tagName} ${commentText.trim()}`.trim());
        } else {
          rawFragments.push(`@${tagName}`);
        }
      }
    }
  };

  const handleTag = (tag: ts.JSDocTag): void => {
    if (ts.isJSDocParameterTag(tag)) {
      const name = tag.name.getText();
      const commentText = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment), name);
      parameterMap.set(name, commentText);
      return;
    }

    if (ts.isJSDocReturnTag(tag)) {
      const returnComment = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment));
      documentation.returns = appendBlock(documentation.returns, returnComment);
      return;
    }

    if (ts.isJSDocTemplateTag(tag)) {
      const commentText = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment));
      for (const typeParameter of tag.typeParameters) {
        typeParameterMap.set(typeParameter.getText(), commentText);
      }
      return;
    }

    if (ts.isJSDocThrowsTag(tag)) {
      const typeName = tag.typeExpression?.type.getText();
      const description = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment));
      exceptions.push({
        type: typeName,
        description
      });
      return;
    }

    if (ts.isJSDocSeeTag(tag)) {
      const nameText = tag.name ? tag.name.getText().trim() : undefined;
      const commentText = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment));

      let targetValue = nameText ?? commentText ?? "";
      let labelValue = commentText ?? nameText ?? undefined;

      if (nameText && commentText) {
        const combined = `${nameText}${commentText}`.trim();
        if (/^[a-z]+$/i.test(nameText) && /^[:/]/.test(commentText)) {
          targetValue = combined;
          labelValue = combined;
        }
      }

      registerLink(targetValue, labelValue);
      return;
    }

    const tagName = tag.tagName.text.toLowerCase();
    const commentText = normalizeJsDocTagComment(coalesceJsDocComment(tag.comment));
    handleGenericTag(tagName, commentText);
  };

  for (const entry of docEntries) {
    if (ts.isJSDoc(entry)) {
      const summaryText = coalesceJsDocComment(entry.comment);
      documentation.summary = appendBlock(documentation.summary, summaryText);
      if (entry.tags) {
        entry.tags.forEach(handleTag);
      }
      continue;
    }

    if (isJSDocTagNode(entry)) {
      handleTag(entry);
    }
  }

  if (parameterMap.size > 0) {
    documentation.parameters = Array.from(parameterMap.entries())
      .map(([name, description]) => ({ name, description: description?.trim() || undefined }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  if (typeParameterMap.size > 0) {
    documentation.typeParameters = Array.from(typeParameterMap.entries())
      .map(([name, description]) => ({ name, description: description?.trim() || undefined }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  if (examples.length > 0) {
    documentation.examples = examples;
  }

  if (links.length > 0) {
    documentation.links = links
      .slice()
      .sort((a, b) => {
        const targetDiff = a.target.localeCompare(b.target);
        if (targetDiff !== 0) {
          return targetDiff;
        }
        const kindDiff = a.kind.localeCompare(b.kind);
        if (kindDiff !== 0) {
          return kindDiff;
        }
        return (a.text ?? "").localeCompare(b.text ?? "");
      });
  }

  if (exceptions.length > 0) {
    documentation.exceptions = exceptions
      .slice()
      .sort((a, b) => {
        const aKey = a.type ?? "";
        const bKey = b.type ?? "";
        const typeDiff = aKey.localeCompare(bKey);
        if (typeDiff !== 0) {
          return typeDiff;
        }
        return (a.description ?? "").localeCompare(b.description ?? "");
      });
  }

  if (rawFragments.length > 0) {
    documentation.rawFragments = Array.from(new Set(rawFragments)).sort((a, b) => a.localeCompare(b));
  }

  return hasDocumentationContent(documentation) ? documentation : undefined;
}

function coalesceJsDocComment(
  comment: string | ts.NodeArray<ts.JSDocComment> | undefined
): string | undefined {
  if (!comment) {
    return undefined;
  }
  if (typeof comment === "string") {
    return comment.trim() || undefined;
  }

  const parts: string[] = [];
  for (const part of comment) {
    if (typeof part === "string") {
      parts.push(part);
      continue;
    }
    const node = part as ts.Node;
    if (isJSDocTextNode(node)) {
      parts.push(node.text);
      continue;
    }
    parts.push(node.getText());
  }

  const text = parts.join("").trim();
  return text || undefined;
}

function normalizeJsDocTagComment(comment: string | undefined, contextName?: string): string | undefined {
  if (!comment) {
    return undefined;
  }

  let trimmed = comment.trim();
  if (!trimmed) {
    return undefined;
  }

  const stripByPrefix = (candidate: string): void => {
    const patterns = [" - ", " — ", " – ", ":", " :", " —", " –"];
    for (const pattern of patterns) {
      const prefix = `${candidate}${pattern}`;
      if (trimmed.startsWith(prefix)) {
        trimmed = trimmed.slice(prefix.length).trim();
        return;
      }
    }
  };

  if (contextName) {
    stripByPrefix(contextName);
    if (contextName.includes(".")) {
      const simple = contextName.split(".").pop();
      if (simple && simple !== contextName) {
        stripByPrefix(simple);
      }
    }
  }

  if (/^[-–—]\s+/.test(trimmed)) {
    trimmed = trimmed.replace(/^[-–—]\s+/, "");
  }

  return trimmed || undefined;
}

function isJSDocTagNode(entry: ts.JSDoc | ts.JSDocTag): entry is ts.JSDocTag {
  return (entry as ts.JSDocTag).tagName !== undefined;
}

function isJSDocTextNode(node: ts.Node): node is ts.JSDocText {
  return node.kind === ts.SyntaxKind.JSDocText;
}

function hasDocumentationContent(doc: SymbolDocumentation): boolean {
  return Boolean(
    doc.summary ||
      doc.remarks ||
      doc.returns ||
      doc.value ||
      (doc.parameters && doc.parameters.length > 0) ||
      (doc.typeParameters && doc.typeParameters.length > 0) ||
      (doc.exceptions && doc.exceptions.length > 0) ||
      (doc.examples && doc.examples.length > 0) ||
      (doc.links && doc.links.length > 0) ||
      (doc.rawFragments && doc.rawFragments.length > 0)
  );
}

export function displayDependencyKey(entry: DependencyEntry): string {
  return entry.resolvedPath ?? entry.specifier;
}

export async function detectChangedFiles(workspaceRoot: string): Promise<Set<string>> {
  try {
    const { stdout } = await execFileAsync("git", ["status", "--porcelain"], {
      cwd: workspaceRoot
    });
    const changed = new Set<string>();
    for (const rawLine of stdout.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }
      const entry = parsePorcelainLine(line);
      if (entry) {
        changed.add(entry);
      }
    }
    return changed;
  } catch {
    return new Set<string>();
  }
}

export function parsePorcelainLine(line: string): string | undefined {
  if (line.length < 4) {
    return undefined;
  }

  const status = line.slice(0, 2);
  const pathPart = line.slice(3).trim();
  if (!pathPart) {
    return undefined;
  }

  if (status.startsWith("R") || status.startsWith("C")) {
    const arrowIndex = pathPart.indexOf("->");
    if (arrowIndex >= 0) {
      const renamed = pathPart.slice(arrowIndex + 2).trim();
      return renamed ? normalizeWorkspacePath(renamed) : undefined;
    }
  }

  return normalizeWorkspacePath(pathPart);
}

export function execFileAsync(
  command: string,
  args: readonly string[],
  options: { cwd: string }
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd: options.cwd }, (error, stdout, stderr) => {
      if (error) {
        let message: string;
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === "string") {
          message = error;
        } else {
          try {
            message = JSON.stringify(error);
          } catch {
            message = "Unknown error";
          }
        }

        reject(new Error(message));
        return;
      }

      resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
    });
  });
}
