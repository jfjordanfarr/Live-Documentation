# scripts/live-docs/find-orphans.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/find-orphans.ts
- Live Doc ID: LD-implementation-scripts-live-docs-find-orphans-ts
- Generated At: 2025-11-24T15:19:59.427Z

## Authored
### Purpose
Scans the Layer‑4 mirror and reports Live Docs whose source files have been deleted or relocated so we can prune stale markdown before committing.

### Notes
Added while decommissioning Stage‑0 docs (Oct 2025) to guard against orphaned files during the MDMD migration. The CLI honours custom `--docs-root`/`--base-layer` arguments so teams with non-default mirrors (like this repo’s `.mdmd/layer-4`) can reuse the check in automation.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:59.427Z","inputHash":"00ee2d81a68c9a8a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `LIVE_DOCUMENTATION_FILE_EXTENSION`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->
