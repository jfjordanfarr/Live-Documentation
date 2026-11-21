# `tests/page-scan/fixtures.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/fixtures.test.ts`
- Generated At: 2026-11-21T03:40:56.640Z

## Authored
### Purpose
Holds that the check's folders reach every reader the engine registers: each reads at least one file some fixture's scan discovers, chosen as `analyzeWithLanguageAdapters` chooses. Prints which fixture reaches which reader, and the extensions no reader reads (TypeScript and JavaScript, read by the compiler, among them).

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- On 2026-11-21 all nineteen readers were reached; SQL by one fixture alone (`csharp/estate`), PowerShell and `pyproject.toml` by two.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`index.LANGUAGE_ADAPTERS`](../../packages/engine/src/live-docs/adapters/index.ts.mdmd.md#symbol-language_adapters)
- [`discovery.discoverTargetFiles`](../../packages/engine/src/live-docs/discovery.ts.mdmd.md#symbol-discovertargetfiles)
- [`fixture.copyFixture`](../../scripts/oracle/fixture.ts.mdmd.md#symbol-copyfixture)
- [`FIXTURES`](./fixtures.ts.mdmd.md#symbol-fixtures)
- `vitest` - `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
