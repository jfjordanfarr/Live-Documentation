# scripts/slopcop/check-asset-paths.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/slopcop/check-asset-paths.ts
- Entry: command `slopcop:assets` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-10-22T16:47:57.882Z

## Authored
### Purpose
Audits HTML/CSS assets for broken relative references (images, scripts, styles) so docs and Live Doc exports never ship dead resource links.

### Notes
- Introduced alongside the SlopCop rollout to give `npm run slopcop:assets` parity with the markdown and symbol audits during the Stage‑0 cleanup push (`2025-10-31.md`).
- Honors `rootDirectories` from `slopcop.config.json`, letting tests point at fixture-specific asset trees while production runs stay locked to the workspace root.
- Integration suite `tests/integration/slopcop/assetsAudit.test.ts` exercises the `--json` output and ensures ignore patterns (for example ChatHistory, dist folders) stay in sync with maintainer expectations.

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
- [`gitIgnored.withoutGitIgnored`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-withoutgitignored)
- [`assetPaths.AssetReferenceIssue`](./assetPaths.ts.mdmd.md#symbol-assetreferenceissue)
- [`assetPaths.findBrokenAssetReferences`](./assetPaths.ts.mdmd.md#symbol-findbrokenassetreferences)
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
