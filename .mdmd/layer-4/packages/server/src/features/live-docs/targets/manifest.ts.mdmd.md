# packages/server/src/features/live-docs/targets/manifest.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/targets/manifest.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-targets-manifest-ts
- Generated At: 2026-01-15T02:41:18.541Z

## Authored
### Purpose
Loads the optional `data/live-docs/targets.json` manifest so the System generator can align Stage-0 docs with curator-chosen targets before rendering, as carved out during the Stage-0 extraction pass on 2025-11-11 ([chat summary](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md)).

### Notes
- Returns `undefined` when the manifest is absent, letting CLI and headless harness runs proceed without bespoke fixtures while still honoring curated views when present.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.541Z","inputHash":"82af384fd03fe1c7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `loadTargetManifest` {#symbol-loadtargetmanifest}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/targets/manifest.ts#L6)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:path` - `path`
- [`types.TargetManifest`](../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-targetmanifest) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../system/generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
