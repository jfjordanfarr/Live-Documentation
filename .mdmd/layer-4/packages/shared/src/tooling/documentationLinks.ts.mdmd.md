# packages/shared/src/tooling/documentationLinks.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/documentationLinks.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-documentationlinks-ts
- Generated At: 2025-12-05T04:16:20.196Z

## Authored
### Purpose
Supplies the shared engine that parses Live Doc anchors, maps code files to documentation targets, and enforces breadcrumb comments so maintainer workflows can guarantee every artifact cites its Layer‑4 mirror.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-02.SUMMARIZED.md#turn-13-safe-to-commit-orchestration--audit-gaps]

### Notes
- Introduced while building the docs-to-code validation pipeline on November 2, including the CLI demo that intentionally broke `main.ts` to prove mismatched breadcrumb detection.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-02.SUMMARIZED.md#turn-12-enforcement-demonstration]
- Powers `npm run docs:links:enforce` and the `safe:commit` gate, with follow-up runs on November 3 and beyond confirming zero violations once anchors were repaired.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:20.196Z","inputHash":"b8057e76ec64ea12"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DocumentationRule` {#symbol-documentationrule}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L16)

#### `DEFAULT_RULES` {#symbol-default_rules}
- Type: const
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L22)
- Returns: `DocumentationRule`[]

#### `DocumentationAnchorSummary` {#symbol-documentationanchorsummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L37)

#### `DocumentationDocumentAnchors` {#symbol-documentationdocumentanchors}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L52)
- Extends: `ParsedDocumentationAnchors`

#### `ResolvedDocumentationTarget` {#symbol-resolveddocumentationtarget}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L56)

#### `DocumentationTargetMap` {#symbol-documentationtargetmap}
- Type: type
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L66)

#### `ParseDocumentationAnchorsOptions` {#symbol-parsedocumentationanchorsoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L68)

#### `DocumentationLinkViolation` {#symbol-documentationlinkviolation}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L73)

#### `DocumentationLinkEnforcementResult` {#symbol-documentationlinkenforcementresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L90)

#### `RunDocumentationLinkEnforcementOptions` {#symbol-rundocumentationlinkenforcementoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L97)

#### `parseDocumentationAnchors` {#symbol-parsedocumentationanchors}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L104)
- Returns: `ParsedDocumentationAnchors`
- Parameters: `_unnamed_`: `ParseDocumentationAnchorsOptions`

#### `resolveCodeToDocumentationMap` {#symbol-resolvecodetodocumentationmap}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L161)
- Returns: `DocumentationTargetMap`
- Parameters: `documents`: `DocumentationDocumentAnchors`[]; `targetMap`: `DocumentationTargetMap`

#### `formatDocumentationLinkComment` {#symbol-formatdocumentationlinkcomment}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L195)
- Parameters: `target`: `ResolvedDocumentationTarget`

#### `runDocumentationLinkEnforcement` {#symbol-rundocumentationlinkenforcement}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L208)
- Returns: `DocumentationLinkEnforcementResult`
- Parameters: `options`: `RunDocumentationLinkEnforcementOptions`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:fs` - `fs`
- `node:path` - `path`
- [`githubSlugger.createSlugger`](./githubSlugger.ts.mdmd.md#symbol-createslugger)
- [`markdownShared.extractReferenceDefinitions`](./markdownShared.ts.mdmd.md#symbol-extractreferencedefinitions)
- [`pathUtils.normalizeWorkspacePath`](./pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [documentationLinks.test.ts](./documentationLinks.test.ts.mdmd.md)
- [enforce-documentation-links.test.ts](../../../../scripts/doc-tools/enforce-documentation-links.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
