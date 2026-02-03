# packages/shared/src/language/typeScriptAstUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/language/typeScriptAstUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-language-typescriptastutils-ts
- Generated At: 2026-02-03T21:55:39.287Z

## Authored
### Purpose
Tracks TypeScript identifier usage so fallback inference and workspace indexing can distinguish runtime imports from type-only references, preserving accurate dependency edges. Introduced during the November 3 analyzer hardening pass documented in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L2367](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L2367).

### Notes
The ripple semantics review the same day captured why we route TypeScript compiler events through these helpers—see [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L3504](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L3504) for the rationale that guides future adjustments.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.287Z","inputHash":"35a262eea7d1b6bf"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `IdentifierUsage` {#symbol-identifierusage}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L3)

#### `extractLocalImportNames` {#symbol-extractlocalimportnames}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L8)
- Parameters: `importClause`: `ts.ImportClause`

#### `collectIdentifierUsage` {#symbol-collectidentifierusage}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L34)
- Parameters: `sourceFile`: `ts.SourceFile`

#### `hasRuntimeUsage` {#symbol-hasruntimeusage}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L64)

#### `hasTypeUsage` {#symbol-hastypeusage}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L75)

#### `isLikelyTypeDefinitionSpecifier` {#symbol-islikelytypedefinitionspecifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L86)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [typeScriptFixtureOracle.test.ts](../testing/fixtureOracles/typeScriptFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
