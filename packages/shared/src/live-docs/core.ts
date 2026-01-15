/**
 * Core module for Live Documentation source analysis.
 *
 * @remarks
 * This module re-exports all types, constants, and functions from the
 * Live Documentation subsystem. It serves as the primary entry point
 * for consumers who need access to the full API surface.
 *
 * The implementation is split across several focused modules:
 * - `coreTypes.ts` - Type definitions and interfaces
 * - `coreConstants.ts` - Extension sets and reserved names
 * - `coreUtils.ts` - Small utility functions
 * - `archetype.ts` - Archetype resolution
 * - `discovery.ts` - File discovery and symbol indexing
 * - `symbolExtraction.ts` - TypeScript AST symbol extraction
 * - `dependencies.ts` - Dependency collection and resolution
 * - `rendering.ts` - Markdown rendering functions
 * - `jsDoc.ts` - JSDoc documentation extraction
 * - `gitUtils.ts` - Git status utilities
 * - `fileUtils.ts` - File system utilities
 * - `sourceAnalysis.ts` - Main analysis entry point
 *
 * @module
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  SourceAnalysisResult,
  ResolvedSymbolLocation,
  WorkspaceSymbolIndex,
  TypeReference,
  PublicSymbolEntry,
  DependencyEntry,
  ReExportedSymbolInfo,
  LocationInfo,
  SymbolDocumentationField,
  SymbolDocumentationParameter,
  SymbolDocumentationException,
  SymbolDocumentationExample,
  SymbolDocumentationLinkKind,
  SymbolDocumentationLink,
  SymbolDocumentation,
  PublicSymbolHeadingInfo
} from "./coreTypes";

export type { WorkspaceFileIndex } from "./adapters";

// ============================================================================
// Constant Exports
// ============================================================================

export {
  SUPPORTED_SCRIPT_EXTENSIONS,
  IMPLEMENTATION_CODE_EXTENSIONS,
  MODULE_RESOLUTION_EXTENSIONS,
  RESERVED_HEADING_NAMES
} from "./coreConstants";

// ============================================================================
// Utility Exports
// ============================================================================

export {
  formatSourceLink,
  formatRelativePathFromDoc,
  createSymbolSlug,
  toModuleLabel,
  formatInlineCode,
  formatDependencyQualifier,
  resolveExportAssignmentName,
  hasExportModifier,
  hasDefaultModifier,
  getNodeLocation,
  displayDependencyKey,
  isBarrelFilePath,
  compareSymbolLocationsPreferOrigin
} from "./coreUtils";

// ============================================================================
// Archetype Exports
// ============================================================================

export {
  resolveArchetype,
  hasMeaningfulAuthoredContent
} from "./archetype";

// ============================================================================
// Discovery Exports
// ============================================================================

export {
  discoverTargetFiles,
  buildWorkspaceSymbolIndex,
  resolveTypeToLiveDoc
} from "./discovery";

// ============================================================================
// Symbol Extraction Exports
// ============================================================================

export {
  inferScriptKind,
  collectExportedSymbols
} from "./symbolExtraction";

// ============================================================================
// Dependency Exports
// ============================================================================

export {
  collectDependencies,
  mergeDependencyEntries,
  resolveDependency,
  shouldInferDomDependencies,
  augmentWithReExportedSymbols
} from "./dependencies";

// ============================================================================
// Rendering Exports
// ============================================================================

export {
  computePublicSymbolHeadingInfo,
  renderPublicSymbolLines,
  renderDependencyLines,
  renderReExportedAnchorLines
} from "./rendering";

// ============================================================================
// JSDoc Exports
// ============================================================================

export { extractJsDocDocumentation } from "./jsDoc";

// ============================================================================
// Git Utility Exports
// ============================================================================

export {
  detectChangedFiles,
  parsePorcelainLine,
  execFileAsync
} from "./gitUtils";

// ============================================================================
// File Utility Exports
// ============================================================================

export {
  directoryExists,
  cleanupEmptyParents
} from "./fileUtils";

// ============================================================================
// Analysis Exports
// ============================================================================

export { analyzeSourceFile } from "./sourceAnalysis";
