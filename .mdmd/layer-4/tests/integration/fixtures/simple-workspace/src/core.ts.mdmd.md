# tests/integration/fixtures/simple-workspace/src/core.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/simple-workspace/src/core.ts
- Live Doc ID: LD-implementation-tests-integration-fixtures-simple-workspace-src-core-ts
- Generated At: 2025-12-07T21:41:20.752Z

## Authored
### Purpose
Defines the baseline request/response pipeline that powers the “simple-workspace” fixture used by US1–US3 integration scenarios, giving tests deterministic business logic to exercise graph analysis and Live Doc generation end to end <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-17.md#L468-L517>.

### Notes
- Keep the field taxonomy (`Request`, `Response`, and `processRequest` orchestration) stable unless the paired fixture documentation and linked markdown guides are refreshed in tandem; the fixture currently verifies cleanly under `npm run fixtures:verify` as of the Oct 29 validation pass <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5288-L5320>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:20.752Z","inputHash":"d4d591ffd8f1b91e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Request` {#symbol-request}
- Type: interface
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/core.ts#L8)

##### `Request` — Summary
Core business logic module

##### `Request` — Links
- `docs/architecture.md`

#### `Response` {#symbol-response}
- Type: interface
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/core.ts#L13)

#### `processRequest` {#symbol-processrequest}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/core.ts#L18)
- Returns: [`Response`](#symbol-response)
- Parameters: `request`: [`Request`](#symbol-request)

#### `validateRequest` {#symbol-validaterequest}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/core.ts#L31)
- Parameters: `request`: [`Request`](#symbol-request)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`feature.evaluateFeature`](./feature.ts.mdmd.md#symbol-evaluatefeature)
<!-- LIVE-DOC:END Dependencies -->
