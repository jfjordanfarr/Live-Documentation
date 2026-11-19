# packages/engine/src/live-docs/sourceEncodings.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/sourceEncodings.test.ts
- Generated At: 2026-11-19T21:21:17.353Z

## Authored
### Purpose
Holds every language reader this repository's generator owns to the facts of a file's UTF-8 twin when the file is saved as UTF-16 with a mark, either way, or in Windows-1252: Python, TypeScript, Java, Go, Rust, Ruby and C.

### Notes
- Written 2026-11-19 ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md#third-leg-november-19)). All 21 cases failed before the readers took their text from the reading step. The C#, SQL, PowerShell and .NET readers are not here: other builders held their files that day, and their cases belong with the lines the record gives for them.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `mkdtempSync`, `rmSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`sourceAnalysis.analyzeSourceFile`](./sourceAnalysis.ts.mdmd.md#symbol-analyzesourcefile)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
