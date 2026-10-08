/**
 * The engine's analysis facade: the names that consumers import through
 * `core` rather than from the module that defines them.
 *
 * @remarks
 * The analysis is split across focused modules (`coreTypes.ts`, `archetype.ts`,
 * `discovery.ts`, `symbolExtraction.ts`, `compose.ts`, `document.ts`,
 * `fileUtils.ts`, `sourceAnalysis.ts` and their neighbours), and each may be
 * imported directly; the docs resolve a symbol to its origin, not to this
 * barrel. On 2026-10-08 the re-exports nobody imported through here (34 of 58)
 * were removed in the dead code sweep, so that what this module offers is what
 * is used of it.
 *
 * @module
 */

export type {
  SourceAnalysisResult,
  WorkspaceSymbolIndex,
  TypeReference,
  PublicSymbolEntry,
  DependencyEntry,
  SymbolDocumentationParameter,
  SymbolDocumentationException,
  SymbolDocumentationExample,
  SymbolDocumentationLinkKind,
  SymbolDocumentationLink,
  SymbolDocumentation
} from "./coreTypes";

export type { WorkspaceFileIndex } from "./adapters";

export {
  resolveArchetype,
  hasMeaningfulAuthoredContent
} from "./archetype";

export {
  discoverTargetFiles,
  buildWorkspaceSymbolIndex
} from "./discovery";

export { collectExportedSymbols } from "./symbolExtraction";

export {
  computePublicSymbolHeadingInfo,
  composeSymbolBlocks,
  composeDependencies,
  composeReExports
} from "./compose";

export {
  directoryExists,
  cleanupEmptyParents
} from "./fileUtils";

export { analyzeSourceFile } from "./sourceAnalysis";
