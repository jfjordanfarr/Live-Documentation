# `packages/engine/src/live-docs/archetype.facts.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/archetype.facts.test.ts`
- Generated At: 2026-11-21T20:21:42.581Z

## Authored
### Purpose
Holds the three facts a reader reports of which files exist for the tests where no path shows it, as the generator's first pass gathers them, and the archetype each gives. The facts: a .NET test project, a Rust module declared under `#[cfg(test)]`, a script of a tSQLt test class. Written on 2026-11-21, when these facts replaced the interim reading of .NET, Rust and SQL in `archetype.ts`.

### Notes
Each case runs `buildWorkspaceIndexes` over a small workspace written to a temporary folder, then reads `resolveArchetype` with the test index it returns. The rules are the runners' own, with sources in [the record of 2026-11-21](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/test-rules/README.md):
- `dotnet test` runs a project that sets `IsTestProject`, which `Microsoft.NET.Test.Sdk` sets, or uses `MSTest.Sdk`.
- The compiler builds a `#[cfg(test)]` module for the tests alone.
- tSQLt runs the `test…` procedures of a schema made by `tSQLt.NewTestClass`.

Each fact was also held against the corpora's oracles. Planting a fault in each reader turns its case red.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`archetype.resolveArchetype`](./archetype.ts.mdmd.md#symbol-resolvearchetype)
- [`discovery.buildWorkspaceIndexes`](./discovery.ts.mdmd.md#symbol-buildworkspaceindexes)
- `vitest` - `afterEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
