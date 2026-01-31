# packages/shared/src/inference/treeSitter/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/treeSitter/index.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-treesitter-index-ts
- Generated At: 2026-01-30T23:50:04.104Z

## Authored
### Purpose
Barrel export for the tree-sitter module, exposing the extraction APIs and a `FallbackHeuristic`-compatible interface. The heuristic wrapper exists for interface compatibility, but the real power is in the async batch extraction functions.

### Notes
- **Created**: [2026-01-28 Dev Day 64](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-28.1.md) during tree-sitter production integration
- **Architecture Formula**:
  - Runtime: `Heuristics ∪ Tree-sitter = Detection`
  - Benchmark: `SCIP ∪ Tree-sitter = Fused Oracle (expected.json)`
  - Goal: `Runtime Detection ≈ Fused Oracle`
- **Sync Limitation**: The `FallbackHeuristic` interface is synchronous, but tree-sitter WASM loading is async. The `evaluate()` method is a no-op stub; use `findCrossFileEdges()` for actual edge detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T23:50:04.104Z","inputHash":"ee24888338785e82"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `loadTreeSitter` {#symbol-loadtreesitter}
- Type: unknown
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L21)

#### `getLanguageWasmPath` {#symbol-getlanguagewasmpath}
- Type: unknown
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L21)

#### `isLanguageSupported` {#symbol-islanguagesupported}
- Type: unknown
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L21)

#### `LANGUAGE_GRAMMAR_MAP` {#symbol-language_grammar_map}
- Type: unknown
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L21)

#### `getLanguageConfig` {#symbol-getlanguageconfig}
- Type: unknown
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L24)

#### `getSupportedLanguages` {#symbol-getsupportedlanguages}
- Type: unknown
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L25)

#### `LanguageConfig` {#symbol-languageconfig}
- Type: type (type-only)
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L26)

#### `extractSymbolsAndReferences` {#symbol-extractsymbolsandreferences}
- Type: unknown
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L30)

#### `buildSymbolTable` {#symbol-buildsymboltable}
- Type: unknown
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L31)

#### `findCrossFileEdges` {#symbol-findcrossfileedges}
- Type: unknown
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L32)

#### `ExtractedSymbol` {#symbol-extractedsymbol}
- Type: type (type-only)
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L33)

#### `ExtractedReference` {#symbol-extractedreference}
- Type: type (type-only)
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L34)

#### `ExtractionResult` {#symbol-extractionresult}
- Type: type (type-only)
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L35)

#### `createTreeSitterHeuristic` {#symbol-createtreesitterheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L88)

##### `createTreeSitterHeuristic` — Summary
Creates a tree-sitter-based fallback heuristic.

This heuristic uses tree-sitter to parse import/use statements from source
files and resolve them to target files in the workspace. Unlike naive symbol
matching, this achieves 100% precision by only emitting edges for explicitly
imported dependencies.

**Important**: This factory function is async because tree-sitter WASM
modules must be loaded before the heuristic can be used.

##### `createTreeSitterHeuristic` — Returns
A FallbackHeuristic that uses tree-sitter for import extraction

#### `isExtensionSupported` {#symbol-isextensionsupported}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L426)

##### `isExtensionSupported` — Summary
Checks if a file extension is supported by tree-sitter.

#### `getLanguageFromFilePath` {#symbol-getlanguagefromfilepath}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/index.ts#L434)

##### `getLanguageFromFilePath` — Summary
Gets the language ID for a file path.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`fallbackHeuristicTypes.MatchEmitter`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-matchemitter) (type-only)
- [`extractor.ExtractedReference`](./extractor.ts.mdmd.md#symbol-extractedreference) (re-export)
- [`extractor.ExtractedSymbol`](./extractor.ts.mdmd.md#symbol-extractedsymbol) (re-export)
- [`extractor.ExtractionResult`](./extractor.ts.mdmd.md#symbol-extractionresult) (re-export)
- [`extractor.buildSymbolTable`](./extractor.ts.mdmd.md#symbol-buildsymboltable) (re-export)
- [`extractor.extractSymbolsAndReferences`](./extractor.ts.mdmd.md#symbol-extractsymbolsandreferences) (re-export)
- [`extractor.findCrossFileEdges`](./extractor.ts.mdmd.md#symbol-findcrossfileedges) (re-export)
- [`languages.LanguageConfig`](./languages.ts.mdmd.md#symbol-languageconfig) (re-export)
- [`languages.getLanguageConfig`](./languages.ts.mdmd.md#symbol-getlanguageconfig) (re-export)
- [`languages.getSupportedLanguages`](./languages.ts.mdmd.md#symbol-getsupportedlanguages) (re-export)
- [`loader.LANGUAGE_GRAMMAR_MAP`](./loader.ts.mdmd.md#symbol-language_grammar_map) (re-export)
- [`loader.TreeSitterNode`](./loader.ts.mdmd.md#symbol-treesitternode) (re-export)
- [`loader.getLanguageWasmPath`](./loader.ts.mdmd.md#symbol-getlanguagewasmpath) (re-export)
- [`loader.isLanguageSupported`](./loader.ts.mdmd.md#symbol-islanguagesupported) (re-export)
- [`loader.loadTreeSitter`](./loader.ts.mdmd.md#symbol-loadtreesitter) (re-export)
- `path` - `path`
<!-- LIVE-DOC:END Dependencies -->
