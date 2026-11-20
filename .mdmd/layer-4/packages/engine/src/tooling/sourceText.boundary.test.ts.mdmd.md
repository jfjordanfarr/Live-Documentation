# `packages/engine/src/tooling/sourceText.boundary.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/sourceText.boundary.test.ts`
- Generated At: 2026-11-20T16:43:06.181Z

## Authored
### Purpose
Holds the rule that a failure of the machine's (a failed system call: too many open files, a full disk, a permission refused) is never read as a property of a file. It reads every source of the engine and the generator, tests aside, with TypeScript's parser, and finds each `catch` (a `try` statement's, or a promise's `.catch`) whose guarded code reads or probes a file or a folder: the source-text reader, `readFile`, `stat`, `lstat`, `readdir`, `access`, `open`, `realpath`, `readlink` in their sync and promise forms, and any function of the two packages that calls one, followed through imports. Each must hand what it caught to `throwIfMachineFailure` (`sourceText.ts`) or throw an expression that names it, or be on the test's list of allowed places with its reason. A place on the list that no longer swallows, or is gone, turns it red too. A second case shows the check seeing each form, a wrapper of the module's own, one imported by name and as a namespace, and passing those that hand the failure on.

### Notes
- Written on 2026-11-20, after the reviewer's second look found only four of twenty-two mended catches named by any test. Seen red by removing the helper's call from `buildPackageTable` in `go.ts`, and by adding a catch round the Go adapter's own `fileFacts` that returns false.
- The list holds the generator's per-file catch, where every other failure arrives; the index pass's, which keeps the failure for that catch; the history's own cache and lock, where a record that cannot be read is made again; and `createGitignoreFilter` in `discovery.ts`, not yet mended, since that file was another builder's that day.
- A failure collected and thrown later (`compilerPaths` in `json.ts`, the folder walk in `discovery.ts`) is not seen as a catch round a read, since its `try` calls a callback; those are held by their own cases.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- `typescript` - `ts`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
