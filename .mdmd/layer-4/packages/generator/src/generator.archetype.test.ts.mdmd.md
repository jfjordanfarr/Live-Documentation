# `packages/generator/src/generator.archetype.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/generator/src/generator.archetype.test.ts`
- Generated At: 2026-11-21T02:28:43.983Z

## Authored
### Purpose
Holds that the file index the generator hands every reader answers each path's archetype under the run's own configuration (`archetypeOf`), so that the PowerShell reader, which never lets working code reach a test's definition as the only one, reads a workspace's archetype overrides as the docs' `Archetype` lines do.

### Notes
- Written 2026-11-21 in the joining of the three readers onto `main` ([the work item](../../../../../AI-Agent-Workspace/Work/readers-on-main.md)), building the lines [the PowerShell probe](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md#the-archetypes-test-folders-added-november-19-2026-night) gave for handing a reader the workspace's own answer. A workspace whose `harness/` folder an override names a test folder: without the override the call from `lib/Run.ps1` reaches `harness/Stubs.ps1`, with it the call is unwired. Red with the generator's index carrying no `archetypeOf`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `mkdirSync`, `mkdtempSync`, `readFileSync`, `rmSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`generator.generateLiveDocs`](./generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
