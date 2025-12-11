# packages/shared/src/live-docs/adapters/python.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/python.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-python-ts
- Generated At: 2025-12-11T02:38:02.005Z

## Authored
### Purpose
Implements the Python adapter that normalizes reST, Google, and NumPy docstrings into structured `SymbolDocumentation` while harvesting import edges, matching the Nov 14 ship summary after the docstring feature landed <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L1378-L1414>.

### Notes
- Guard rails come from `python.docstring.test.ts` and the `safe:commit -- --benchmarks` run that accompanied the rollout; update those fixtures when extending the parser <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L1378-L1414>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.005Z","inputHash":"8f1869a6ba1c617f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `pythonAdapter` {#symbol-pythonadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.ts#L29)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `pythonAdapter` — Summary
Language adapter that extracts public symbols and docstring metadata from Python modules.

##### `pythonAdapter` — Remarks
The adapter recognises reStructuredText, Google, and NumPy-style docstring conventions
to populate Live Doc summaries, parameter tables, and inline examples without relying
on Python runtime introspection.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./python.docstring` - `parseDocstring`
- `node:fs` - `promises`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.TypeReference`](../core.ts.mdmd.md#symbol-typereference) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [python.docstring.test.ts](./python.docstring.test.ts.mdmd.md)
- [python.typeref.test.ts](./python.typeref.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
