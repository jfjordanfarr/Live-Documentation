# packages/shared/src/inference/treeSitter/loader.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/treeSitter/loader.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-treesitter-loader-ts
- Generated At: 2026-02-03T21:55:39.272Z

## Authored
### Purpose
Provides the WASM loading infrastructure for tree-sitter, enabling AST-based symbol extraction across 15+ programming languages. This module handles the critical UMD export bug workaround discovered during spike testing — the `@vscode/tree-sitter-wasm` package's factory returns an object but doesn't properly export it for CommonJS consumption.

### Notes
- **Created**: [2026-01-28 Dev Day 64](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-28.1.md) during tree-sitter production integration
- **Origin**: The oracle fusion spike (`AI-Agent-Workspace/tmp/tree-sitter-spike-v3.ts`) validated the approach; this module promotes it to production
- **UMD Patch**: The loader patches the module exports at runtime — this is fragile but necessary until the upstream package fixes the issue
- **Singleton Pattern**: `loadTreeSitter()` caches the module to avoid repeated WASM loading overhead (~22 MB bundle)

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.272Z","inputHash":"d90ed55adc51a99a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TreeSitterParser` {#symbol-treesitterparser}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/loader.ts#L20)

##### `TreeSitterParser` — Summary
The tree-sitter Parser class interface.

#### `TreeSitterLanguage` {#symbol-treesitterlanguage}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/loader.ts#L29)

##### `TreeSitterLanguage` — Summary
The tree-sitter Language class interface (opaque handle).

#### `TreeSitterTree` {#symbol-treesittertree}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/loader.ts#L34)

##### `TreeSitterTree` — Summary
A parsed syntax tree.

#### `TreeSitterNode` {#symbol-treesitternode}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/loader.ts#L42)

##### `TreeSitterNode` — Summary
A node in the syntax tree.

#### `TreeSitterModule` {#symbol-treesittermodule}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/loader.ts#L57)

##### `TreeSitterModule` — Summary
The tree-sitter module interface after loading.

#### `loadTreeSitter` {#symbol-loadtreesitter}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/loader.ts#L159)

##### `loadTreeSitter` — Summary
Loads and initializes the tree-sitter module.

This is a singleton - subsequent calls return the cached module.
Uses a promise-based mutex to prevent race conditions when multiple
tests or callers attempt to initialize tree-sitter concurrently.

#### `getLanguageWasmPath` {#symbol-getlanguagewasmpath}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/loader.ts#L225)

##### `getLanguageWasmPath` — Summary
Gets the path to a language WASM file.

#### `LANGUAGE_GRAMMAR_MAP` {#symbol-language_grammar_map}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/loader.ts#L243)

##### `LANGUAGE_GRAMMAR_MAP` — Summary
Maps common language identifiers to tree-sitter grammar names.

#### `isLanguageSupported` {#symbol-islanguagesupported}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/loader.ts#L275)

##### `isLanguageSupported` — Summary
Checks if a language is supported by tree-sitter.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path`
<!-- LIVE-DOC:END Dependencies -->
