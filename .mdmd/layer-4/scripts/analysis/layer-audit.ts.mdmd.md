# scripts/analysis/layer-audit.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/analysis/layer-audit.ts
- Live Doc ID: LD-implementation-scripts-analysis-layer-audit-ts
- Generated At: 2025-12-15T00:38:07.334Z

## Authored
### Purpose
Scans `.mdmd/layer-{n}/` directories to discover canonical heading patterns (e.g., "Metadata", "Authored", "Generated") by coverage threshold, then flags files missing those sections or introducing uncommon ones—helping maintain structural consistency across the four-layer MDMD documentation hierarchy.

### Notes
- Created 2025-10-30 as mdmd-layer-audit.ts during relationship rule engine rollout (commit `6473d51c`) to detect documentation drift in the newly-standardized layer structure ([chat summary](../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md), Turn 19).
- Renamed mdmd-layer-audit.ts → layer-audit.ts on 2025-12-14 during Phase 1 npm readiness cleanup; "mdmd-" prefix dropped as a workspace-specific convention ([chat log](../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-14.1.md#L1095-L1450)).
- Exports `parseArgs`, `collectLayerReport`, `logLayerReport`, and `main` to support both CLI usage (`npx tsx layer-audit.ts --layer 4`) and programmatic invocation by doc validators.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:07.334Z","inputHash":"35017e82558a0e02"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `collectLayerReport` {#symbol-collectlayerreport}
- Type: function
- Source: [source](../../../../scripts/analysis/layer-audit.ts#L54)
- Parameters: `layer`: `LayerId`

#### `parseArgs` {#symbol-parseargs}
- Type: function
- Source: [source](../../../../scripts/analysis/layer-audit.ts#L109)
- Returns: `CliOptions`

#### `logLayerReport` {#symbol-loglayerreport}
- Type: function
- Source: [source](../../../../scripts/analysis/layer-audit.ts#L193)
- Parameters: `report`: `LayerReport`

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../scripts/analysis/layer-audit.ts#L231)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- `node:url` - `fileURLToPath`
<!-- LIVE-DOC:END Dependencies -->
