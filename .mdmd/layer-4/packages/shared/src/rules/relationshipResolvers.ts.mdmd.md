# packages/shared/src/rules/relationshipResolvers.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/rules/relationshipResolvers.ts
- Live Doc ID: LD-implementation-packages-shared-src-rules-relationshipresolvers-ts
- Generated At: 2026-01-15T02:41:18.776Z

## Authored
### Purpose
Provides the built-in resolver catalogue (markdown links, MDMD code paths) that turns documentation hops into concrete rule-engine candidates for diagnostics and audits.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-23-scaffold-relationship-rule-engine--docs-lines-4596-5050]

### Notes
- Shipped alongside the initial relationship-rule scaffold so documentation chains could emit `documents` evidence without bespoke code per rule.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-25-convert-layer-3-docs-to-markdown-links--regenerate-evidences-lines-5441-5710]
- Exercised by the revamped provider tests to ensure both markdown-link and MDMD metadata resolvers return stable targets before rules materialise evidences.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-27-harden-relationship-rule-provider-tests-lines-6121-6420]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.776Z","inputHash":"270735d4783a47aa"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createBuiltInResolvers` {#symbol-createbuiltinresolvers}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipResolvers.ts#L24)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
- [`relationshipRuleTypes.RelationshipResolver`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshipresolver) (type-only)
- [`relationshipRuleTypes.RelationshipResolverOptions`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshipresolveroptions) (type-only)
- [`relationshipRuleTypes.RelationshipResolverResult`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshipresolverresult) (type-only)
- [`markdownShared.extractReferenceDefinitions`](../tooling/markdownShared.ts.mdmd.md#symbol-extractreferencedefinitions)
- [`markdownShared.parseLinkTarget`](../tooling/markdownShared.ts.mdmd.md#symbol-parselinktarget)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [relationshipRuleProvider.test.ts](./relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
