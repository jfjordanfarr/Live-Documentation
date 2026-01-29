# packages/shared/src/inference/treeSitter/languages.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/treeSitter/languages.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-treesitter-languages-ts
- Generated At: 2026-01-28T23:22:01.822Z

## Authored
### Purpose
Defines per-language configuration for tree-sitter symbol extraction. Each `LanguageConfig` specifies which AST node types represent declarations vs. references, enabling the extractor to work uniformly across Go, C#, TypeScript, Python, Java, Rust, and Ruby.

### Notes
- **Created**: [2026-01-28 Dev Day 64](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-28.1.md) during tree-sitter production integration
- **Key Insight**: Go requires scanning `field_identifier` nodes (not just `identifier`) to catch package-qualified calls like `mux.NewRouter()`
- **Extensibility**: Add new languages by creating a config with appropriate `declarationTypes`, `referenceTypes`, and `nameField`
- **Ignored Symbols**: Language-specific noise filtering (e.g., Go's `nil`, `true`, `false`) prevents false edges

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-28T23:22:01.822Z","inputHash":"65a3f83c070b58f3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LanguageConfig` {#symbol-languageconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/languages.ts#L13)

##### `LanguageConfig` — Summary
Configuration for extracting symbols and references from a language.

#### `GO_CONFIG` {#symbol-go_config}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/languages.ts#L64)
- Returns: [`LanguageConfig`](./index.ts.mdmd.md#symbol-languageconfig)

#### `CSHARP_CONFIG` {#symbol-csharp_config}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/languages.ts#L103)
- Returns: [`LanguageConfig`](./index.ts.mdmd.md#symbol-languageconfig)

#### `TYPESCRIPT_CONFIG` {#symbol-typescript_config}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/languages.ts#L141)
- Returns: [`LanguageConfig`](./index.ts.mdmd.md#symbol-languageconfig)

#### `PYTHON_CONFIG` {#symbol-python_config}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/languages.ts#L177)
- Returns: [`LanguageConfig`](./index.ts.mdmd.md#symbol-languageconfig)

#### `JAVA_CONFIG` {#symbol-java_config}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/languages.ts#L209)
- Returns: [`LanguageConfig`](./index.ts.mdmd.md#symbol-languageconfig)

#### `RUST_CONFIG` {#symbol-rust_config}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/languages.ts#L248)
- Returns: [`LanguageConfig`](./index.ts.mdmd.md#symbol-languageconfig)

#### `RUBY_CONFIG` {#symbol-ruby_config}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/languages.ts#L283)
- Returns: [`LanguageConfig`](./index.ts.mdmd.md#symbol-languageconfig)

#### `getLanguageConfig` {#symbol-getlanguageconfig}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/languages.ts#L325)
- Returns: [`LanguageConfig`](./index.ts.mdmd.md#symbol-languageconfig)

##### `getLanguageConfig` — Summary
Gets the language configuration for a given language ID.

#### `getSupportedLanguages` {#symbol-getsupportedlanguages}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/treeSitter/languages.ts#L332)

##### `getSupportedLanguages` — Summary
Gets all supported language IDs.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
