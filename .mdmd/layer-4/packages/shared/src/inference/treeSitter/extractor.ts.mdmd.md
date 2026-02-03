# packages/shared/src/inference/treeSitter/extractor.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/treeSitter/extractor.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-treesitter-extractor-ts
- Generated At: 2026-02-03T21:55:39.214Z

## Authored
### Purpose
Core symbol and reference extraction engine using tree-sitter AST parsing. Provides 100% precision (no false positives) for cross-file edge detection, complementing regex-based heuristics which sacrifice precision for recall.

### Notes
- **Created**: [2026-01-28 Dev Day 64](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-28.1.md) during tree-sitter production integration
- **Key Discovery**: Neither SCIP nor tree-sitter produces false positives — they have different *false negative* profiles. Oracle fusion (SCIP ∪ tree-sitter) captures edges both tools miss individually.
- **Newtonsoft.Json Results**: SCIP found 1,356 edges; tree-sitter found 293 additional real edges (inheritance relationships SCIP missed); fused oracle = 1,649 edges
- **Public Symbol Detection**: Uses language conventions (Go: uppercase = exported, Python: underscore prefix = private)

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.214Z","inputHash":"8718bc3cccf1fd37"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExtractedSymbol` {#symbol-extractedsymbol}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/extractor.ts#L17)

##### `ExtractedSymbol` — Summary
A symbol declaration found in source code.

#### `ExtractedReference` {#symbol-extractedreference}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/extractor.ts#L31)

##### `ExtractedReference` — Summary
A reference to a symbol found in source code.

#### `ExtractionResult` {#symbol-extractionresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/extractor.ts#L43)

##### `ExtractionResult` — Summary
Result of extracting symbols and references from a file.

#### `extractSymbolsAndReferences` {#symbol-extractsymbolsandreferences}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/extractor.ts#L143)

##### `extractSymbolsAndReferences` — Summary
Extracts symbols and references from source code.

##### `extractSymbolsAndReferences` — Parameters
- `content`: The source code content
- `languageId`: The language identifier (e.g., "go", "csharp", "typescript")

##### `extractSymbolsAndReferences` — Returns
Extraction result, or null if language is not supported

#### `buildSymbolTable` {#symbol-buildsymboltable}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/extractor.ts#L212)

##### `buildSymbolTable` — Summary
Builds a symbol table from multiple files.

##### `buildSymbolTable` — Parameters
- `files`: Array of { path, content, languageId }

##### `buildSymbolTable` — Returns
Map from symbol name to the file path where it's defined

#### `findCrossFileEdges` {#symbol-findcrossfileedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/extractor.ts#L238)

##### `findCrossFileEdges` — Summary
Finds cross-file edges based on symbol references.

##### `findCrossFileEdges` — Parameters
- `files`: Array of { path, content, languageId }

##### `findCrossFileEdges` — Returns
Array of edges { source, target, symbols }
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`languages.LanguageConfig`](./languages.ts.mdmd.md#symbol-languageconfig)
- [`languages.getLanguageConfig`](./languages.ts.mdmd.md#symbol-getlanguageconfig)
- [`loader.LANGUAGE_GRAMMAR_MAP`](./loader.ts.mdmd.md#symbol-language_grammar_map) (type-only)
- [`loader.TreeSitterLanguage`](./loader.ts.mdmd.md#symbol-treesitterlanguage) (type-only)
- [`loader.TreeSitterNode`](./loader.ts.mdmd.md#symbol-treesitternode) (type-only)
- [`loader.getLanguageWasmPath`](./loader.ts.mdmd.md#symbol-getlanguagewasmpath) (type-only)
- [`loader.loadTreeSitter`](./loader.ts.mdmd.md#symbol-loadtreesitter) (type-only)
<!-- LIVE-DOC:END Dependencies -->
