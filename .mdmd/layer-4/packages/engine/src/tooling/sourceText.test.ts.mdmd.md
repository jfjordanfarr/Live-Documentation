# `packages/engine/src/tooling/sourceText.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/sourceText.test.ts`
- Generated At: 2026-11-19T22:40:10.868Z

## Authored
### Purpose
Holds the reading step to real bytes as Windows tools save them, a case for each rule and each refusal, and to PowerShell 7's `Get-Content` with the encoding Windows would read each with, where PowerShell is installed.

### Notes
- Written 2026-11-19 with the step ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md#third-leg-november-19)). The PowerShell cases are skipped where `pwsh` is not on the path; the devcontainer has it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs` - `mkdtempSync`, `rmSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`sourceText.decodeSourceText`](./sourceText.ts.mdmd.md#symbol-decodesourcetext)
- [`sourceText.readSourceText`](./sourceText.ts.mdmd.md#symbol-readsourcetext)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
