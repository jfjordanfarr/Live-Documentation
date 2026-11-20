# `packages/engine/src/tooling/sourceText.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/sourceText.ts`
- Generated At: 2026-11-19T22:40:10.873Z

## Authored
### Purpose
The one reading step for a source file's text: a byte-order mark decides (UTF-8, UTF-16 either way); without one, UTF-16 only where it is certain, then UTF-8, then Windows-1252; anything else is not read and is named. Every language reader takes its text from `readSourceText`, and the generator classifies each file with `decodeSourceText` to say which rule read it.

### Notes
- Written 2026-11-19 in [the Windows and command-line probe's third leg](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md#third-leg-november-19), at the root's ruling: each reader had opened its own file as UTF-8, so UTF-16 C# and SQL (as SQL Server Management Studio and Visual Studio save them) gave no symbols and Windows-1252 text came out with U+FFFD, with nothing said. The C#, SQL, PowerShell and .NET readers were being changed by other builders that day; the lines that move them onto this step are in the probe's record.
- UTF-16 without a mark is taken only when every pair of bytes is one zero byte and one that is not, the zero always on the same side: no one-byte text holds a zero byte in every other place. A file with a character above U+00FF and no mark is not guessed at, and is not read.
- The decoders are the platform's (`TextDecoder`); the test holds them to PowerShell 7's `Get-Content` where PowerShell is installed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SourceTextReading` {#symbol-sourcetextreading}
- Type: type
- Source: [source](../../../../../../packages/engine/src/tooling/sourceText.ts#L38)

##### `SourceTextReading` — Summary
How a file's bytes became text, or why they did not.

#### `decodeSourceText` {#symbol-decodesourcetext}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/sourceText.ts#L46)
- Returns: [`SourceTextReading`](#symbol-sourcetextreading)

##### `decodeSourceText` — Summary
A file's bytes read by the rule of this module.

#### `unmarkedUtf16` {#symbol-unmarkedutf16}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/sourceText.ts#L80)

##### `unmarkedUtf16` — Summary
The byte order of UTF-16 without a mark, where it is certain: an even, non-zero number of bytes in which every
pair is one zero byte and one byte that is not zero, the zero always on the same side. The binary sniff
(`isBinaryContent`) asks the same of a file's head, so that what this step reads as text is never called binary.

#### `readSourceText` {#symbol-readsourcetext}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/sourceText.ts#L99)

##### `readSourceText` — Summary
A source file's text, for a language reader: read by {@link decodeSourceText}, and empty when the bytes are not
text this step knows, so that such a file is read as holding nothing and the run goes on; the generator names it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
<!-- LIVE-DOC:END Dependencies -->
