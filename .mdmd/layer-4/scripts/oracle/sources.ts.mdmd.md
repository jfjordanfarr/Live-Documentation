# `scripts/oracle/sources.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/sources.ts`
- Generated At: 2026-11-21T07:25:44.838Z

## Authored
### Purpose
Ties an oracle's kept record to the files it was made from: `sourceDigests` names each file with a SHA-256 digest of its text, line endings read as `\n`, and `sourcesDiffer` says, file by file, which of a fixture's present files are new, gone or changed since the record was written. The C# grader ([`csharp-compare.ts`](./csharp-compare.ts.mdmd.md)) and the T-SQL grader ([`sql-compare.ts`](./sql-compare.ts.mdmd.md)) write the digests with `--write` and refuse a kept record that differs, and [`index-fixture.ts`](./index-fixture.ts.mdmd.md) writes them into PowerShell's parser record; `csharp-oracle.test.ts`, `sql-oracle.test.ts` and `powershell-oracle.test.ts` fail on one.

### Notes
- Written on 2026-11-21 after an independent review's second pass found the C# grader unable to fail for a file added to a fixture: it graded only the files its kept record listed, and nothing tied that list to the fixture's present sources ([the work item](../../../../AI-Agent-Workspace/Work/readers-on-main.md)). The digests are of text, not bytes, so that a checkout's own line endings change nothing.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `sourceDigest` {#symbol-sourcedigest}
- Type: function
- Source: [source](../../../../scripts/oracle/sources.ts#L12)

##### `sourceDigest` — Summary
A file's digest as a kept record names it: SHA-256 of its text with its line endings read as `\n`, so that a checkout's own line endings change nothing.

#### `sourceDigests` {#symbol-sourcedigests}
- Type: function
- Source: [source](../../../../scripts/oracle/sources.ts#L17)

##### `sourceDigests` — Summary
The digests of a folder's files, by folder-relative path.

#### `sourcesDiffer` {#symbol-sourcesdiffer}
- Type: function
- Source: [source](../../../../scripts/oracle/sources.ts#L22)

##### `sourcesDiffer` — Summary
How a folder's present sources differ from those a kept record was made from, file by file; empty when they agree.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- `node:fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->
