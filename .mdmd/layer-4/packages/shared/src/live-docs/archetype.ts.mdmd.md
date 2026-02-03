# packages/shared/src/live-docs/archetype.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/archetype.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-archetype-ts
- Generated At: 2026-02-03T21:55:40.312Z

## Authored
### Purpose
Archetype classification for Live Documentation. Determines which archetype (`implementation`, `test`, or `asset`) applies to a source file based on configuration overrides and naming conventions. The archetype affects which sections are generated in the Live Doc (e.g., tests show "Observed Evidence" vs implementations showing "Public Symbols").

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- Priority order: explicit `archetypeOverrides` > `.test.`/`.spec.` suffix > fixture directory > test directory > default `implementation`
- `hasMeaningfulAuthoredContent()` detects whether authored sections contain real content vs placeholder text
- `globPatternToRegExp()` internal helper converts glob patterns to regex for override matching

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.312Z","inputHash":"ae3e7075614e0c88"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `resolveArchetype` {#symbol-resolvearchetype}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/archetype.ts#L39)
- Returns: [`LiveDocumentationArchetype`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype)
- Parameters: `config`: [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `resolveArchetype` — Summary
Determines which Live Documentation archetype applies to a given source file.

##### `resolveArchetype` — Remarks
Explicit `archetypeOverrides` from the configuration take precedence. When no
overrides match, common fixture and test naming conventions are used as a
fallback before defaulting to the `implementation` archetype.

##### `resolveArchetype` — Parameters
- `config`: Live Documentation configuration containing archetype overrides.
- `sourcePath`: Workspace-relative source path using forward slashes.

##### `resolveArchetype` — Returns
The archetype that should be reflected in the generated markdown metadata.

##### `resolveArchetype` — Examples
```ts
const archetype = resolveArchetype("packages/app/src/main.test.ts", config);
// archetype === "test"
```

#### `hasMeaningfulAuthoredContent` {#symbol-hasmeaningfulauthoredcontent}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/archetype.ts#L101)

##### `hasMeaningfulAuthoredContent` — Summary
Checks whether an authored markdown block carries information beyond the default placeholders.

##### `hasMeaningfulAuthoredContent` — Parameters
- `authoredBlock`: Raw markdown captured between the `## Authored` markers.

##### `hasMeaningfulAuthoredContent` — Returns
`true` when the block contains substantive content, otherwise `false`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`liveDocumentationConfig.LiveDocumentationArchetype`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype) (type-only)
- [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`coreConstants.IMPLEMENTATION_CODE_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-implementation_code_extensions)
<!-- LIVE-DOC:END Dependencies -->
