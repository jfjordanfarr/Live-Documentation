# scripts/analysis/mdmd-layer-audit.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/analysis/mdmd-layer-audit.ts
- Live Doc ID: LD-implementation-scripts-analysis-mdmd-layer-audit-ts
- Generated At: 2025-12-05T04:16:20.295Z

## Authored
### Purpose
Scan the `.mdmd/layer-*` directories, learn the canonical `##` sections per layer, and flag docs missing or inventing headings so we can police MDMD structure drift programmatically ([initial audit run](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L392-L420)).

### Notes
- Added 2025-10-30 while we benchmarked Layer 1–4 consistency; the tool immediately showed Layer 2/3 lacked shared section names, shaping the follow-up migration plan ([tool introduction](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L402-L420)).
- Later the same day we exported the CLI helpers (`parseArgs`, `main`) so instructions and Live Docs could reference concrete surfaces, keeping the script ready for reuse in other automation ([documentation alignment](../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#L108-L129)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:20.295Z","inputHash":"126a4e866d354f4e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `collectLayerReport` {#symbol-collectlayerreport}
- Type: function
- Source: [source](../../../../scripts/analysis/mdmd-layer-audit.ts#L54)
- Parameters: `layer`: `LayerId`

#### `parseArgs` {#symbol-parseargs}
- Type: function
- Source: [source](../../../../scripts/analysis/mdmd-layer-audit.ts#L109)
- Returns: `CliOptions`

#### `logLayerReport` {#symbol-loglayerreport}
- Type: function
- Source: [source](../../../../scripts/analysis/mdmd-layer-audit.ts#L193)
- Parameters: `report`: `LayerReport`

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../scripts/analysis/mdmd-layer-audit.ts#L231)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- `node:url` - `fileURLToPath`
<!-- LIVE-DOC:END Dependencies -->
