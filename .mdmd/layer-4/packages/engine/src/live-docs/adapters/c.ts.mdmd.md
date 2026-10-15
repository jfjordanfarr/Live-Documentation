# packages/engine/src/live-docs/adapters/c.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/c.ts
- Generated At: 2026-10-15T15:49:38.586Z

## Authored
### Purpose
Implements the Doxygen-aware analyzer for `.c` and `.h` sources, binding doc comments and include dependencies into Live Doc symbol and dependency sets as laid out in the Nov 14 C adapter plan and delivered in the same-day rollout notes <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3620-L3705> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L4028-L4088>.

### Notes
- Guarded by `c.docstring.test.ts` plus regenerated benchmark fixtures to ensure doc metadata and import resolution stay deterministic after the Nov 14 ship <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L4028-L4088>.
- Extend both the parser and its test scenarios when onboarding new Doxygen tags, following the coverage matrix captured in the adapter plan <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3620-L3705>.
- The program's entry point is reported on the analysis result since 2026-10-15 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)), from which the doc carries `- Entry: program`: an `int` or `void` `main` defined in a `.c` file, comments stripped first so that a commented-out definition does not count, a declaration alone not counting, the brace on the same or a later line; the definition's line is reported with the symbol. The symbol extractor still misses an Allman-style `main` as a symbol (pre-existing, found on 2026-10-15), so such a doc names the entry bare.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `cAdapter` {#symbol-cadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/c.ts#L45)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `cAdapter` — Summary
Language adapter for C and C++ (`.c`, `.h`, `.cpp`, `.hpp`, `.cc`, `.cxx`). Extracts function/struct/typedef symbols, `#include` dependencies and the program entry point.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`, `statSync`
- `node:path` - `path`
- [`index.cSyntax`](../../languages/index.ts.mdmd.md#symbol-csyntax)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.SymbolDocumentationExample`](../core.ts.mdmd.md#symbol-symboldocumentationexample) (type-only)
- [`core.SymbolDocumentationException`](../core.ts.mdmd.md#symbol-symboldocumentationexception) (type-only)
- [`core.SymbolDocumentationLink`](../core.ts.mdmd.md#symbol-symboldocumentationlink) (type-only)
- [`core.SymbolDocumentationParameter`](../core.ts.mdmd.md#symbol-symboldocumentationparameter) (type-only)
- [`coreTypes.ProgramEntry`](../coreTypes.ts.mdmd.md#symbol-programentry) (type-only)
<!-- LIVE-DOC:END Dependencies -->
