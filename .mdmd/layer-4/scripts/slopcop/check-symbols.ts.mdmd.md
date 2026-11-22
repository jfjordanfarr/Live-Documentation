# `scripts/slopcop/check-symbols.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/slopcop/check-symbols.ts`
- Entry: command `slopcop:symbols` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-22T07:12:58.145Z

## Authored
### Purpose
Validates markdown symbol anchors across the workspace, flagging duplicate headings and broken anchor references so Live Docs and authored specs keep stable intra-doc links.

### Notes
- Landed with the Oct 2025 SlopCop rollout that accompanied the Stage‑0 documentation cleanup; first wired into `npm run slopcop:symbols` and covered by `tests/integration/slopcop/symbolsAudit.test.ts` (see `2025-10-31.md` and `2025-10-25.SUMMARIZED.md`).
- Uses `slopcop.config.json` to drive include/ignore globs and severity overrides, returning exit code 3 when anomalies exist so CI surfaces failures without aborting the process outright.
- The `--json` flag mirrors what the integration tests expect, allowing fixture runs to assert on specific issues while the human-readable formatter groups results by top-level folder for triage.
- Since 2026-11-18 the built-in ignore list leaves out the session archive's records, captures, summaries and inventories by their depth under `AgentSessionHistory/`, and reads each day's `Probes/`, `Research/` and `Screenshots/`: the same files as before the archive moved into one directory per dev day ([where things are](../../../../AI-Agent-Workspace/AgentSessionHistory/README.md#where-things-are)).
- Since 2026-11-20 its files come from [`auditedFiles`](./auditedFiles.ts.mdmd.md), which does not read the folders git ignores whole: in the main checkout the same 1,692 files and findings in 1.9 s instead of 19.0 s ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`auditedFiles`](./auditedFiles.ts.mdmd.md#symbol-auditedfiles)
- [`config.SlopcopSymbolConfig`](./config.ts.mdmd.md#symbol-slopcopsymbolconfig) (type-only)
- [`config.compileIgnorePatterns`](./config.ts.mdmd.md#symbol-compileignorepatterns)
- [`config.loadSlopcopConfig`](./config.ts.mdmd.md#symbol-loadslopcopconfig)
- [`config.resolveIgnoreGlobs`](./config.ts.mdmd.md#symbol-resolveignoreglobs)
- [`config.resolveIncludeGlobs`](./config.ts.mdmd.md#symbol-resolveincludeglobs)
- [`symbolReferences.SymbolReferenceIssue`](./symbolReferences.ts.mdmd.md#symbol-symbolreferenceissue) (type-only)
- [`symbolReferences.SymbolRuleSetting`](./symbolReferences.ts.mdmd.md#symbol-symbolrulesetting) (type-only)
- [`symbolReferences.findSymbolReferenceAnomalies`](./symbolReferences.ts.mdmd.md#symbol-findsymbolreferenceanomalies)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/slopcop.mdmd.md`](../../../layer-3/slopcop.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
