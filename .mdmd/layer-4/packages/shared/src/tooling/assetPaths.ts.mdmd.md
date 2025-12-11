# packages/shared/src/tooling/assetPaths.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/assetPaths.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-assetpaths-ts
- Generated At: 2025-12-11T02:38:02.350Z

## Authored
### Purpose
Detects broken HTML/CSS asset references (images, scripts, stylesheets) across the workspace so SlopCop can block releases that ship dead resources.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-29-asset-audit-enhancements--fixtures]

### Notes
- Expanded during the October 25 SlopCop hardening to track additional attributes, hashed filenames, and configurable root directories shared via `slopcop.config.json`.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-29-asset-audit-enhancements--fixtures]
- Regularly exercised through the `slopcop-assets` fixture and repo-wide audits (for example November 3) to ensure new docs or Live Doc outputs never leave dangling asset links.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.350Z","inputHash":"0aa8d718c4609678"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AssetReferenceIssue` {#symbol-assetreferenceissue}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/assetPaths.ts#L4)

#### `AssetAuditOptions` {#symbol-assetauditoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/assetPaths.ts#L13)

#### `findBrokenAssetReferences` {#symbol-findbrokenassetreferences}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/assetPaths.ts#L27)
- Returns: [`AssetReferenceIssue`](#symbol-assetreferenceissue)[]
- Parameters: `options`: [`AssetAuditOptions`](#symbol-assetauditoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [assetPaths.test.ts](./assetPaths.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
