# packages/shared/src/live-docs/archetype.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/archetype.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-archetype-ts
- Generated At: 2025-12-07T04:00:25.692Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T04:00:25.692Z","inputHash":"69cb6c42c1020292"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `resolveArchetype` {#symbol-resolvearchetype}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/archetype.ts#L39)
- Returns: [`LiveDocumentationArchetype`](../config/liveDocumentationConfig.d.ts.mdmd.md#symbol-livedocumentationarchetype)
- Parameters: `config`: [`LiveDocumentationConfig`](../config/liveDocumentationConfig.d.ts.mdmd.md#symbol-livedocumentationconfig)

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
- Source: [source](../../../../../../packages/shared/src/live-docs/archetype.ts#L85)

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
- [`liveDocumentationConfig.LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`coreConstants.IMPLEMENTATION_CODE_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-implementation_code_extensions)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [aspnet.test.ts](./adapters/aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](./adapters/c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](./adapters/csharp.hangfire.test.ts.mdmd.md)
- [powershell.test.ts](./adapters/powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](./adapters/python.docstring.test.ts.mdmd.md)
- [ruby.docstring.test.ts](./adapters/ruby.docstring.test.ts.mdmd.md)
- [rust.docstring.test.ts](./adapters/rust.docstring.test.ts.mdmd.md)
- [core.docstring.test.ts](./core.docstring.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
