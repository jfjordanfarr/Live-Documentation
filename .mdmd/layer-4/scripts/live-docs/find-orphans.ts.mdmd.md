# scripts/live-docs/find-orphans.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/find-orphans.ts
- Entry: command `live-docs:orphans` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-19T20:23:44.576Z

## Authored
### Purpose
Scans the Layer‑4 mirror and reports Live Docs whose source files have been deleted or relocated so we can prune stale markdown before committing.

### Notes
Added while decommissioning Stage‑0 docs (Oct 2025) to guard against orphaned files during the MDMD migration. The CLI honours custom `--docs-root`/`--base-layer` arguments so teams with non-default mirrors (like this repo’s `.mdmd/layer-4`) can reuse the check in automation.
Since 2026-11-12 its usage names the npm script, `npm run live-docs:orphans`, and the docs root it passes, and a refused argument ends through `runCommand` in [cli.ts](cli.ts.mdmd.md). It reads no configuration: the npm script passes this repository's docs root and base layer.
Since 2026-11-19 ([the Windows and command-line probe's second leg](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md#second-leg-november-19)) a doc's source is read by the doc grammar's own reader, `parseLiveDoc`, and no longer by a pattern of its own over the `Code Path` line, so that a code path the writer writes in its quoted form, a JSON string where the plain form would not read back, is checked as the path it names; an independent review found this command among the readers that went round the grammar. A doc the reader refuses is still mapped from where it lies, as before, by the `.md` suffix alone.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`document.parseLiveDoc`](../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`cli.UsageError`](./cli.ts.mdmd.md#symbol-usageerror)
- [`cli.optionValue`](./cli.ts.mdmd.md#symbol-optionvalue)
- [`cli.runCommand`](./cli.ts.mdmd.md#symbol-runcommand)
- [`cli.workspaceFolder`](./cli.ts.mdmd.md#symbol-workspacefolder)
<!-- LIVE-DOC:END Dependencies -->
