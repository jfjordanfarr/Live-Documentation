# packages/engine/src/live-docs/archetype.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/archetype.ts
- Generated At: 2026-10-22T00:39:38.498Z

## Authored
### Purpose
Archetype classification for Live Documentation. Determines which archetype (`implementation`, `test`, or `asset`) applies to a source file based on configuration overrides and naming conventions. The archetype affects which sections are generated in the Live Doc (e.g., tests show "Observed Evidence" vs implementations showing "Public Symbols").

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- Priority order since 2026-10-16: explicit `archetypeOverrides` > a binary file is an `asset` (`isBinaryContent`: a NUL byte in the first 8,000 bytes, as git decides, a UTF-16 or UTF-32 byte order mark being text) > `.test.`/`.spec.` and the other test names > within a sample root, the test folders of the path inside the sample > test directory > default `implementation`. The fixtures-era rule that called every non-code file under a sample root an asset went that day on the owner's line, "The dividing line is plaintext/near-plain-text versus binary" ([the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#an-asset-is-a-binary-file-by-its-content-recorded-2026-10-16)); the generator reads each file's head once for it.
- `hasMeaningfulAuthoredContent()` detects whether authored sections contain real content vs placeholder text; since 2026-10-22 the note a doc of a file no reader handles starts with (`UNREAD_NOTE`) counts as a placeholder, so such a doc with nothing else written is pruned with its file.
- `globPatternToRegExp()` internal helper converts glob patterns to regex for override matching
- `matchesPathPattern` (2026-10-15) exports the glob rule the archetype overrides use, so that the configuration's declared entry points are read by the same rule.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BINARY_SNIFF_BYTES` {#symbol-binary_sniff_bytes}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/archetype.ts#L22)

##### `BINARY_SNIFF_BYTES` — Summary
How much of a file's head {@link isBinaryContent} reads: git's own window for the same question.

#### `isBinaryContent` {#symbol-isbinarycontent}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/archetype.ts#L33)

##### `isBinaryContent` — Summary
True when a file's content is binary: a NUL byte within its first
{@link BINARY_SNIFF_BYTES} bytes, as git decides it, except that a text file
in UTF-16 or UTF-32 announced by its byte order mark is text, since a
Windows PowerShell script is often written that way. The dividing line is the
owner's (2026-10-16): "plaintext/near-plain-text versus binary. It should be
that simple." An archive that holds text would be text by that rule and
is not read today, since discovery admits no archive.

#### `resolveArchetype` {#symbol-resolvearchetype}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/archetype.ts#L72)
- Returns: [`LiveDocumentationArchetype`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype)
- Parameters: `config`: [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `resolveArchetype` — Summary
Determines which Live Documentation archetype applies to a given source file.

##### `resolveArchetype` — Remarks
Explicit `archetypeOverrides` from the configuration take precedence. Then a
binary file is an asset, wherever it lies (`binary` is the caller's reading of
the content, {@link isBinaryContent}); the asset extensions of discovery say
which files are found, and the content says what they are. Then the naming
conventions of tests decide, and within a sample root they are read against
the path inside the sample, so that a sample's own `tests/` folder is a test
folder and the harness around the sample is not. Everything else is
implementation: a sample's manifest, configuration, data or SQL file is as
much its code as it is anywhere else (the owner's rule of 2026-10-16, which
retired the fixtures-era rule that called every non-code file under a sample
root an asset).

##### `resolveArchetype` — Parameters
- `binary`: Whether the file's content is binary; false when not known.
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
- Source: [source](../../../../../../packages/engine/src/live-docs/archetype.ts#L145)

##### `hasMeaningfulAuthoredContent` — Summary
Checks whether an authored markdown block carries information beyond the default placeholders and the note a doc of a file no reader handles starts with.

##### `hasMeaningfulAuthoredContent` — Parameters
- `authoredBlock`: Raw markdown captured between the `## Authored` markers.

##### `hasMeaningfulAuthoredContent` — Returns
`true` when the block contains substantive content, otherwise `false`.

#### `matchesPathPattern` {#symbol-matchespathpattern}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/archetype.ts#L174)

##### `matchesPathPattern` — Summary
True when a workspace-relative path matches a configuration pattern: a path
exactly, or a glob in which `*` stands for anything within one segment and
`**` for anything across segments. The archetype overrides and the declared
entry points are read by this rule.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`liveDocumentationConfig.LiveDocumentationArchetype`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype) (type-only)
- [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`document.UNREAD_NOTE`](./document.ts.mdmd.md#symbol-unread_note)
<!-- LIVE-DOC:END Dependencies -->
