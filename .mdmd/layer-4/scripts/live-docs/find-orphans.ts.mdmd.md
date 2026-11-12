# scripts/live-docs/find-orphans.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/find-orphans.ts
- Entry: command `live-docs:orphans` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-12T16:06:56.260Z

## Authored
### Purpose
Scans the Layer‑4 mirror and reports Live Docs whose source files have been deleted or relocated so we can prune stale markdown before committing.

### Notes
Added while decommissioning Stage‑0 docs (Oct 2025) to guard against orphaned files during the MDMD migration. The CLI honours custom `--docs-root`/`--base-layer` arguments so teams with non-default mirrors (like this repo’s `.mdmd/layer-4`) can reuse the check in automation.
Since 2026-11-12 its usage names the npm script, `npm run live-docs:orphans`, and the docs root it passes, and a refused argument ends through `runCommand` in [cli.ts](cli.ts.mdmd.md). It reads no configuration: the npm script passes this repository's docs root and base layer.

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
- [`cli.UsageError`](./cli.ts.mdmd.md#symbol-usageerror)
- [`cli.optionValue`](./cli.ts.mdmd.md#symbol-optionvalue)
- [`cli.runCommand`](./cli.ts.mdmd.md#symbol-runcommand)
<!-- LIVE-DOC:END Dependencies -->
