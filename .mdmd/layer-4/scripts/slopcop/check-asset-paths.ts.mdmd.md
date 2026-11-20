# `scripts/slopcop/check-asset-paths.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/slopcop/check-asset-paths.ts`
- Entry: command `slopcop:assets` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-20T06:46:52.288Z

## Authored
### Purpose
Audits HTML/CSS assets for broken relative references (images, scripts, styles) so docs and Live Doc exports never ship dead resource links.

### Notes
- Introduced alongside the SlopCop rollout to give `npm run slopcop:assets` parity with the markdown and symbol audits during the Stage‑0 cleanup push (`2025-10-31.md`).
- Honors `rootDirectories` from `slopcop.config.json`, letting tests point at fixture-specific asset trees while production runs stay locked to the workspace root.
- Integration suite `tests/integration/slopcop/assetsAudit.test.ts` exercises the `--json` output and ensures ignore patterns (for example the session archive, dist folders) stay in sync with maintainer expectations.
- Since 2026-11-18 the built-in ignore list leaves out the session archive's records, captures, summaries and inventories by their depth under `AgentSessionHistory/`, and reads each day's `Probes/`, `Research/` and `Screenshots/`: the same files as before the archive moved into one directory per dev day ([where things are](../../../../AI-Agent-Workspace/AgentSessionHistory/README.md#where-things-are)).
- Since 2026-11-20 its files come from [`auditedFiles`](./auditedFiles.ts.mdmd.md), which does not read the folders git ignores whole: in the main checkout the same 21 files and findings in 0.4 s instead of 2.5 s ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md)).

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
- [`assetPaths.AssetReferenceIssue`](./assetPaths.ts.mdmd.md#symbol-assetreferenceissue)
- [`assetPaths.findBrokenAssetReferences`](./assetPaths.ts.mdmd.md#symbol-findbrokenassetreferences)
- [`auditedFiles`](./auditedFiles.ts.mdmd.md#symbol-auditedfiles)
- [`config.compileIgnorePatterns`](./config.ts.mdmd.md#symbol-compileignorepatterns)
- [`config.loadSlopcopConfig`](./config.ts.mdmd.md#symbol-loadslopcopconfig)
- [`config.resolveIgnoreGlobs`](./config.ts.mdmd.md#symbol-resolveignoreglobs)
- [`config.resolveIncludeGlobs`](./config.ts.mdmd.md#symbol-resolveincludeglobs)
- [`config.resolveRootDirectories`](./config.ts.mdmd.md#symbol-resolverootdirectories)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/slopcop.mdmd.md`](../../../layer-3/slopcop.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
