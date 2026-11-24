# `packages/engine/src/live-docs/archetype.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/archetype.ts`
- Generated At: 2026-11-24T10:31:38.409Z

## Authored
### Purpose
Archetype classification for Live Documentation. Determines which archetype (`implementation`, `test`, or `asset`) applies to a source file, from configuration overrides, the file's content, and the rule of tests of the file's own language. The Explorer's kind switches, the Knowledge Sources panel and the walk from entry points all read it.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- Priority order: explicit `archetypeOverrides` > a binary file is an `asset` (`isBinaryContent`: a NUL byte in the first 8,000 bytes, as git decides, a UTF-16 or UTF-32 byte order mark being text) > the rule of the file's language in `TEST_RULES`, read within a sample root against the path inside the sample > default `implementation`.
- Since 2026-11-21 a test is a file that exists for the tests, whether or not its runner runs it. Each language's rule comes from its runner's default name and its layout's test roots, and applies to its files only. The only rule every language shares is a whole folder named `test` or `tests`. A file of no runner's language is a test only inside a test root. A folder named `fixtures` is a sample's only where `sampleRoots` names it. Before that day one list of every language's names, plus the word anywhere in a path, applied to every file, so a change measured on one language moved the others; `src/test-utils.tsx` moved on 2026-11-19 by PowerShell's rule. The decision, the runners' rules and the measurement are in [the record of 2026-11-21](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/test-rules/README.md), and the guard is `archetype.languages.test.ts`.
- Three languages need a fact that a reader sees and a path does not. The first pass gathers these facts into the `WorkspaceTestIndex` (`discovery.ts`), and the generator passes it as `tests`:
  - .NET: the project reader reports every project's folder and whether it is a test project. A test project sets `IsTestProject` (which `Microsoft.NET.Test.Sdk` sets) or uses `MSTest.Sdk`. The nearest project decides for a .NET file and a file of no runner's language.
  - Rust: the Rust reader reports the modules declared under `#[cfg(test)]`, and every module beneath them.
  - SQL: the SQL reader reports the schemas made tSQLt test classes, and those in which a script creates a `test…` procedure. The first pass joins the two across scripts.
- These facts replaced, the same day, an interim rule that kept those languages' old reading. A C# file named `*Test.cs` or `*Tests.cs` outside any test project is still a test, by the name the frameworks' projects give a class of tests. The rosetta sample shows why: its project references xunit without the test SDK.
- The fixtures-era rule that called every non-code file under a sample root an asset went that day on the owner's line, "The dividing line is plaintext/near-plain-text versus binary" ([the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#an-asset-is-a-binary-file-by-its-content-recorded-2026-10-16)); the generator reads each file's head once for it.
- `hasMeaningfulAuthoredContent()` detects whether authored sections contain real content vs placeholder text; since 2026-10-22 the note a doc of a file no reader handles starts with (`UNREAD_NOTE`) counts as a placeholder, so such a doc with nothing else written is pruned with its file.
- `globPatternToRegExp()` internal helper converts glob patterns to regex for override matching
- `matchesPathPattern` (2026-10-15) exports the glob rule the archetype overrides use, so that the configuration's declared entry points are read by the same rule.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BINARY_SNIFF_BYTES` {#symbol-binary_sniff_bytes}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/archetype.ts#L34)

##### `BINARY_SNIFF_BYTES` — Summary
How much of a file's head {@link isBinaryContent} reads: git's own window for the same question.

#### `isBinaryContent` {#symbol-isbinarycontent}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/archetype.ts#L46)

##### `isBinaryContent` — Summary
True when a file's content is binary: a NUL byte within its first
{@link BINARY_SNIFF_BYTES} bytes, as git decides it, except that a text file
in UTF-16 or UTF-32 announced by its byte order mark is text, since a
Windows PowerShell script is often written that way, and a head the one reading step reads as UTF-16 without a
mark (`unmarkedUtf16`) is text too (the joining of 2026-11-19). The dividing line is the
owner's (2026-10-16): "plaintext/near-plain-text versus binary. It should be
that simple." An archive that holds text would be text by that rule and
is not read today, since discovery admits no archive.

#### `TEST_RULES` {#symbol-test_rules}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/archetype.ts#L114)

##### `TEST_RULES` — Summary
Each language's rule of tests, from its runner's default and its layout; the runners' words are in the guard and the record.

#### `resolveArchetype` {#symbol-resolvearchetype}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/archetype.ts#L207)
- Returns: [`LiveDocumentationArchetype`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype)
- Parameters: `config`: [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig); `tests`: [`WorkspaceTestIndex`](./coreTypes.ts.mdmd.md#symbol-workspacetestindex)

##### `resolveArchetype` — Summary
Determines which Live Documentation archetype applies to a given source file.

##### `resolveArchetype` — Remarks
Explicit `archetypeOverrides` from the configuration take precedence. Then a
binary file is an asset, wherever it lies (`binary` is the caller's reading of
the content, {@link isBinaryContent}); the asset extensions of discovery say
which files are found, and the content says what they are. Then the rule of
tests of the file's own language decides ({@link TEST_RULES}), with the facts
the readers report (`tests`), and within a sample root it reads the path
inside the sample, so that a sample's own `tests/` folder is a test folder and
the harness around the sample is not. Everything else is implementation: a
sample's manifest, configuration, data or SQL file is as much its code as it
is anywhere else (the owner's rule of 2026-10-16, which retired the
fixtures-era rule that called every non-code file under a sample root an
asset). A folder named `fixtures` is a sample's only where the
configuration's `sampleRoots` name it.

##### `resolveArchetype` — Parameters
- `binary`: Whether the file's content is binary; false when not known.
- `config`: Live Documentation configuration containing archetype overrides.
- `sourcePath`: Workspace-relative source path using forward slashes.
- `tests`: The readers' facts of which files exist for the tests, from the first pass; absent, none is known.

##### `resolveArchetype` — Returns
The archetype that should be reflected in the generated markdown metadata.

##### `resolveArchetype` — Examples
```ts
const archetype = resolveArchetype("packages/app/src/main.test.ts", config);
// archetype === "test"
```

#### `hasMeaningfulAuthoredContent` {#symbol-hasmeaningfulauthoredcontent}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/archetype.ts#L258)

##### `hasMeaningfulAuthoredContent` — Summary
Checks whether an authored markdown block carries information beyond the default placeholders and the note a doc of a file no reader handles starts with.

##### `hasMeaningfulAuthoredContent` — Parameters
- `authoredBlock`: Raw markdown captured between the `## Authored` markers.

##### `hasMeaningfulAuthoredContent` — Returns
`true` when the block contains substantive content, otherwise `false`.

#### `matchesPathPattern` {#symbol-matchespathpattern}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/archetype.ts#L288)

##### `matchesPathPattern` — Summary
True when a workspace-relative path matches a configuration pattern: a path
exactly, or a glob in which `*` stands for anything within one segment and
`**` for anything across segments. The archetype overrides and the declared
entry points are read by this rule; `exclude` without regard to case where
git ignores case in the repository (`ignoreCase`).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.LiveDocumentationArchetype`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype) (type-only)
- [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`c.cSyntax`](../languages/c.ts.mdmd.md#symbol-csyntax)
- [`csharp.csharpSyntax`](../languages/csharp.ts.mdmd.md#symbol-csharpsyntax)
- [`go.goSyntax`](../languages/go.ts.mdmd.md#symbol-gosyntax)
- [`java.javaSyntax`](../languages/java.ts.mdmd.md#symbol-javasyntax)
- [`powershell.powershellSyntax`](../languages/powershell.ts.mdmd.md#symbol-powershellsyntax)
- [`python.pythonSyntax`](../languages/python.ts.mdmd.md#symbol-pythonsyntax)
- [`ruby.rubySyntax`](../languages/ruby.ts.mdmd.md#symbol-rubysyntax)
- [`rust.rustSyntax`](../languages/rust.ts.mdmd.md#symbol-rustsyntax)
- [`coreConstants.SUPPORTED_SCRIPT_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-supported_script_extensions)
- [`coreTypes.WorkspaceTestIndex`](./coreTypes.ts.mdmd.md#symbol-workspacetestindex) (type-only)
- [`document.UNREAD_NOTE`](./document.ts.mdmd.md#symbol-unread_note)
- [`enginePath.path`](../tooling/enginePath.ts.mdmd.md)
- [`sourceText.unmarkedUtf16`](../tooling/sourceText.ts.mdmd.md#symbol-unmarkedutf16)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
