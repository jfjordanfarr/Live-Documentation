# scripts/analysis/layer-audit.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/analysis/layer-audit.ts
- Live Doc ID: LD-implementation-scripts-analysis-layer-audit-ts
- Generated At: 2026-02-18T21:27:54.463Z

## Authored
### Purpose
Scans `.mdmd/layer-{n}/` directories to discover canonical heading patterns (e.g., "Metadata", "Authored", "Generated") by coverage threshold, then flags files missing those sections or introducing uncommon ones—helping maintain structural consistency across the four-layer MDMD documentation hierarchy.

### Notes
- Created 2025-10-30 as mdmd-layer-audit.ts during relationship rule engine rollout (commit `6473d51c`) to detect documentation drift in the newly-standardized layer structure ([chat summary](../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md), Turn 19).
- Renamed mdmd-layer-audit.ts → layer-audit.ts on 2025-12-14 during Phase 1 npm readiness cleanup; "mdmd-" prefix dropped as a workspace-specific convention ([chat log](../../../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-14.1.md)).
- Exports `parseArgs`, `collectLayerReport`, `logLayerReport`, and `main` to support both CLI usage (`npx tsx layer-audit.ts --layer 4`) and programmatic invocation by doc validators.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:54.463Z","inputHash":"ff4f896b98e91d96"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `collectLayerReport` {#symbol-collectlayerreport}
- Type: function
- Source: [source](../../../../scripts/analysis/layer-audit.ts#L60)
- Parameters: `layer`: `LayerId`

##### `collectLayerReport` — Summary
Scans all `.mdmd.md` files in the given MDMD layer, computes heading
frequency, and returns a report listing canonical headings (those
above the `threshold` coverage ratio) plus per-file missing/extra
heading breakdowns.

#### `parseArgs` {#symbol-parseargs}
- Type: function
- Source: [source](../../../../scripts/analysis/layer-audit.ts#L116)
- Returns: `CliOptions`

##### `parseArgs` — Summary
Parses CLI arguments for the layer-audit script.

#### `logLayerReport` {#symbol-loglayerreport}
- Type: function
- Source: [source](../../../../scripts/analysis/layer-audit.ts#L201)
- Parameters: `report`: `LayerReport`

##### `logLayerReport` — Summary
Prints a formatted layer report to stdout.

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../scripts/analysis/layer-audit.ts#L240)

##### `main` — Summary
Runs the full layer-audit pipeline: parse CLI args, collect reports, and log results.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- `node:url` - `fileURLToPath`
<!-- LIVE-DOC:END Dependencies -->
