# packages/shared/src/live-docs/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/types.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-types-ts
- Generated At: 2026-02-03T21:55:40.738Z

## Authored
### Purpose
Centralizes Stage‑0 Live Doc manifest and symbol structures so the generator, system CLI, and analysis pipelines share a stable schema.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-08-begin-refactor--stage-0-extraction-lines-961-1100]

### Notes
- Introduced while splitting Stage‑0 tooling out of the monolithic generator, enabling reusable manifest typing for docLoader and co-activation analytics.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-08-begin-refactor--stage-0-extraction-lines-961-1100]
- Survived the Nov 15 Stage‑0 recovery by migrating authored content into the new `.md` Live Docs surface and retargeting all diagnostics to this schema file.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-15.SUMMARIZED.md#turn-19-automate-the-stage-0-migration-lines-2621-2760]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.738Z","inputHash":"4ab78162475d9038"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Stage0Symbol` {#symbol-stage0symbol}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/types.ts#L1)

#### `Stage0Doc` {#symbol-stage0doc}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/types.ts#L6)

#### `Stage0DocLogger` {#symbol-stage0doclogger}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/types.ts#L16)

#### `TargetManifest` {#symbol-targetmanifest}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/types.ts#L20)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [coActivation.test.ts](./analysis/coActivation.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
