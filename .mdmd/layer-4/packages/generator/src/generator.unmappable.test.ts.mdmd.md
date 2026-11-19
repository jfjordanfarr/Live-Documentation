# packages/generator/src/generator.unmappable.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/generator/src/generator.unmappable.test.ts
- Generated At: 2026-11-19T21:25:58.641Z

## Authored
### Purpose
Holds that a run meeting a file it cannot map finishes: the file is skipped and named by its source path with the reason, every other doc and the index are written, and the result counts the failure.

### Notes
- Written 2026-11-19 in [the Windows and command-line probe's third leg](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md#third-leg-november-19). The writer is wrapped so that it writes, for one file, a doc the grammar's reader refuses, since every real fault of that kind is mended once found; a second case makes a file that cannot be opened (skipped on Windows and as root). Both failed before the mend, the first with the doc's path and line, as the cold run met it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `chmodSync`, `existsSync`, `mkdirSync`, `mkdtempSync`, `rmSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`generator.generateLiveDocs`](./generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterAll`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
