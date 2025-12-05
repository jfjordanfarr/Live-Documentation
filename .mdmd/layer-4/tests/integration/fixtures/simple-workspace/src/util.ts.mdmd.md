# tests/integration/fixtures/simple-workspace/src/util.ts

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/simple-workspace/src/util.ts
- Live Doc ID: LD-asset-tests-integration-fixtures-simple-workspace-src-util-ts
- Generated At: 2025-12-05T04:16:28.269Z

## Authored
### Purpose
Provides deterministic normalization helpers that underpin the simple-workspace fixture’s feature evaluation flow so US1–US3 integration tests can assert graph ripples from structured TypeScript data <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L2779-L2904>.

### Notes
- `normalizeValue` and `summarizeShape` must stay stable with `feature.evaluateFeature` to keep the fixture’s dependency chain (`core.ts → feature.ts → util.ts`) reproducible; the trio was last reset together during the Oct 21 fixture cleanup <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L3041-L3238>.
- The fixture continues to pass the `npm run fixtures:verify` sweep that revalidated simple-workspace behavior on Oct 29, so future edits should rerun that manifest before landing <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5288-L5320>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:28.269Z","inputHash":"bd67118e60a9f8d8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PrimitiveValue` {#symbol-primitivevalue}
- Type: type
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/util.ts#L1)

#### `NormalizedValue` {#symbol-normalizedvalue}
- Type: type
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/util.ts#L2)
- Returns: `PrimitiveValue`, `NormalizedArray`, `NormalizedObject`

#### `NormalizedArray` {#symbol-normalizedarray}
- Type: type
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/util.ts#L3)
- Returns: `NormalizedValue`[]

#### `NormalizedObject` {#symbol-normalizedobject}
- Type: interface
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/util.ts#L4)

#### `normalizeValue` {#symbol-normalizevalue}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/util.ts#L8)
- Returns: `NormalizedValue`

#### `summarizeShape` {#symbol-summarizeshape}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/src/util.ts#L40)
- Parameters: `value`: `NormalizedValue`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
