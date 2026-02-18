# packages/server/src/features/live-docs/evidenceBridge.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/evidenceBridge.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-evidencebridge-ts
- Generated At: 2026-02-18T21:27:52.427Z

## Authored
### Purpose
Loads coverage summaries, targets manifests, and evidence waivers into structured maps so the Live Doc generator can annotate each implementation and test with observed evidence.

### Notes
- Built alongside the coverage ingestion push captured in [2025-11-08 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md).
- Subsequent safe-to-commit runs (see [2025-11-10 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md)) validated the manifest search paths and motivated the logger guidance.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:52.427Z","inputHash":"b41a4ca8528c5796"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `EvidenceKind` {#symbol-evidencekind}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/live-docs/evidenceBridge.ts#L13)

##### `EvidenceKind` — Summary
Classification of how a piece of evidence was gathered.

- `"unit"` / `"integration"` / `"benchmark"` — automated test suites
- `"manual"` — evidence waiver supplied by a human reviewer

#### `CoverageRatio` {#symbol-coverageratio}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/live-docs/evidenceBridge.ts#L19)

##### `CoverageRatio` — Summary
A single coverage metric (e.g. statement coverage) expressed as
a numerator/denominator pair and a pre-computed percentage.

#### `CoverageSummary` {#symbol-coveragesummary}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/live-docs/evidenceBridge.ts#L29)

##### `CoverageSummary` — Summary
Aggregated code-coverage metrics from a test provider's
`coverage-summary.json` output (Istanbul/v8 format).

#### `ImplementationEvidenceItem` {#symbol-implementationevidenceitem}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/live-docs/evidenceBridge.ts#L42)

##### `ImplementationEvidenceItem` — Summary
A single piece of evidence that an implementation file is tested.

Populated from the targets manifest (`coverage/live-docs/targets.json`),
from coverage-summary files, or from manual evidence waivers.

#### `TestEvidenceItem` {#symbol-testevidenceitem}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/live-docs/evidenceBridge.ts#L54)

##### `TestEvidenceItem` — Summary
Evidence record for a test file, listing the implementation files
it targets and any supporting fixtures it depends on.

#### `EvidenceSnapshot` {#symbol-evidencesnapshot}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/live-docs/evidenceBridge.ts#L69)

##### `EvidenceSnapshot` — Summary
Complete workspace-wide evidence snapshot assembled from coverage summaries,
target manifests, and evidence waivers.

Consumed by the Live Docs generator to populate `Observed Evidence` sections
on implementation-archetype docs and `Targets` / `Supporting Fixtures` sections
on test-archetype docs. Currently feeds 67+ Live Doc files in this workspace.

#### `loadEvidenceSnapshot` {#symbol-loadevidencesnapshot}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/live-docs/evidenceBridge.ts#L95)
- Parameters: `options`: `LoadEvidenceOptions`

##### `loadEvidenceSnapshot` — Summary
Assembles a workspace-wide evidence snapshot by loading:

1. **Coverage summaries** — Istanbul/v8 `coverage-summary.json` files under `coverage/`
2. **Targets manifest** — `targets.json` mapping test files to the implementations they verify
3. **Evidence waivers** — `evidence-waivers.json` for manually-reviewed files that lack automated tests

The snapshot is consumed once per `generateLiveDocs()` invocation.

##### `loadEvidenceSnapshot` — Parameters
- `options`: Workspace root and optional logger for diagnostic messages.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs/promises`
- `node:path` - `path`
- [`pathUtils.normalizeWorkspacePath`](../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](./renderPublicSymbolLines.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
