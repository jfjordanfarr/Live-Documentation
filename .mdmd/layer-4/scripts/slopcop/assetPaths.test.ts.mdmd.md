# scripts/slopcop/assetPaths.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/slopcop/assetPaths.test.ts
- Generated At: 2026-09-28T01:00:43.626Z

## Authored
### Purpose
Verifies the asset reference detector against real HTML fixtures so SlopCop flags missing images, fonts, and hashed bundles before they reach documentation or Live Doc exports.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-29-asset-audit-enhancements--fixtures]

### Notes
- Uses temporary workspaces to test ignore patterns, alternate root directories, and hashed filenames added during the October 25 asset hardening.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-29-asset-audit-enhancements--fixtures]

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`assetPaths.findBrokenAssetReferences`](./assetPaths.ts.mdmd.md#symbol-findbrokenassetreferences)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
