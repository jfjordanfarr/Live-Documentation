# tests/integration/fixtures/simple-workspace/src/dataBeta.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/simple-workspace/src/dataBeta.ts
- Live Doc ID: LD-implementation-tests-integration-fixtures-simple-workspace-src-databeta-ts
- Generated At: 2026-02-03T21:55:50.523Z

## Authored
### Purpose
Acts as the contrasting “beta” dataset for simple-workspace so integration tests can confirm the pipeline differentiates between multiple payload sources while still exercising the same summarization path <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L1508-L1532>.

### Notes
- Keep the payload signature paired with the alpha variant and documented flow diagrams; drift breaks the deliberate two-sample coverage described in the fixture architecture <../../../../../../../tests/integration/fixtures/simple-workspace/docs/architecture.md>.
- Continue validating this generator through `npm run fixtures:verify`, which last confirmed both datasets in the Oct 29 sweep <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5288-L5320>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:50.523Z","inputHash":"21a61c10add7020c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createBetaPayload` {#symbol-createbetapayload}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/dataBeta.ts#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
