# scripts/slopcop/check-symbols.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/slopcop/check-symbols.ts
- Generated At: 2026-09-27T23:21:32.037Z

## Authored
### Purpose
Validates markdown symbol anchors across the workspace, flagging duplicate headings and broken anchor references so Live Docs and authored specs keep stable intra-doc links.

### Notes
- Landed with the Oct 2025 SlopCop rollout that accompanied the Stage‑0 documentation cleanup; first wired into `npm run slopcop:symbols` and covered by `tests/integration/slopcop/symbolsAudit.test.ts` (see `2025-10-31.md` and `2025-10-25.SUMMARIZED.md`).
- Uses `slopcop.config.json` to drive include/ignore globs and severity overrides, returning exit code 3 when anomalies exist so CI surfaces failures without aborting the process outright.
- The `--json` flag mirrors what the integration tests expect, allowing fixture runs to assert on specific issues while the human-readable formatter groups results by top-level folder for triage.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`symbolReferences.SymbolReferenceIssue`](../../packages/shared/src/tooling/symbolReferences.ts.mdmd.md#symbol-symbolreferenceissue)
- [`symbolReferences.SymbolRuleSetting`](../../packages/shared/src/tooling/symbolReferences.ts.mdmd.md#symbol-symbolrulesetting)
- [`symbolReferences.findSymbolReferenceAnomalies`](../../packages/shared/src/tooling/symbolReferences.ts.mdmd.md#symbol-findsymbolreferenceanomalies)
- [`config.SlopcopSymbolConfig`](./config.ts.mdmd.md#symbol-slopcopsymbolconfig)
- [`config.compileIgnorePatterns`](./config.ts.mdmd.md#symbol-compileignorepatterns)
- [`config.loadSlopcopConfig`](./config.ts.mdmd.md#symbol-loadslopcopconfig)
- [`config.resolveIgnoreGlobs`](./config.ts.mdmd.md#symbol-resolveignoreglobs)
- [`config.resolveIncludeGlobs`](./config.ts.mdmd.md#symbol-resolveincludeglobs)
<!-- LIVE-DOC:END Dependencies -->
