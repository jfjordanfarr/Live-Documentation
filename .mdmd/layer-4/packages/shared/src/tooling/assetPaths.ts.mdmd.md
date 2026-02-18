# packages/shared/src/tooling/assetPaths.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/assetPaths.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-assetpaths-ts
- Generated At: 2026-02-18T21:27:54.319Z

## Authored
### Purpose
Detects broken HTML/CSS asset references (images, scripts, stylesheets) across the workspace so SlopCop can block releases that ship dead resources.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-29-asset-audit-enhancements--fixtures]

### Notes
- Expanded during the October 25 SlopCop hardening to track additional attributes, hashed filenames, and configurable root directories shared via `slopcop.config.json`.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-29-asset-audit-enhancements--fixtures]
- Regularly exercised through the `slopcop-assets` fixture and repo-wide audits (for example November 3) to ensure new docs or Live Doc outputs never leave dangling asset links.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:54.319Z","inputHash":"05f2bc0928737a5c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AssetReferenceIssue` {#symbol-assetreferenceissue}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/assetPaths.ts#L5)

##### `AssetReferenceIssue` — Summary
A broken asset reference detected in an HTML or CSS file.

#### `AssetAuditOptions` {#symbol-assetauditoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/assetPaths.ts#L15)

##### `AssetAuditOptions` — Summary
Configuration for scanning HTML/CSS files for broken asset references.

#### `findBrokenAssetReferences` {#symbol-findbrokenassetreferences}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/assetPaths.ts#L36)
- Returns: [`AssetReferenceIssue`](#symbol-assetreferenceissue)[]
- Parameters: `options`: [`AssetAuditOptions`](#symbol-assetauditoptions)

##### `findBrokenAssetReferences` — Summary
Scans an HTML or CSS file for references (`src`, `href`, `url()`, etc.)
whose targets cannot be resolved on disk.

Supports absolute-from-root paths, relative paths, `srcset` attribute
parsing, and optional alternative `assetRootDirectories`.
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
