# scripts/live-docs/cli.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/cli.ts
- Generated At: 2026-11-12T16:06:56.230Z

## Authored
### Purpose
What the Live Docs commands share at their edge: the version each prints, read from the manifest of the package that does its work (the generator's for `generate`, the engine's for `inspect` and `lint`); the configuration each reads, the file given, else the workspace's own `.live-docs.config.json`, else the defaults; how each ends, a refused command line said on one line with the command that lists the options, any other failure by its message, both with exit code 1; and a quiet end when the reader closes the pipe before a listing is done.

### Notes
- Written 2026-10-18 when the history build found `generate --version` printing a constant, 0.1.0, or an environment variable, while the generator package is 0.0.0 and the history's lens carries the manifest's version ([the record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#work-notes-continued-the-c1-hand-back)); `inspect` and `lint` printed the same constant, and `inspect` piped into `head` died with an EPIPE trace. A command's version is its package's and nothing of its own, so the three read their manifests here, and the two that print long listings end quietly when the pipe closes.
- `UsageError`, `optionValue`, `runCommand` and `readConfiguration` (2026-11-12), after [the first-visit evaluation](../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md) found the Explorer's builder dying on `--help` with a stack trace and the other commands ending a refused argument each in its own way. Every script a `live-docs:*` npm script runs now takes `--help` and `-h`, and ends through `runCommand` under that npm script's name, so that the hint it prints is a command a person can paste. Each parses its own arguments by hand; `optionValue` is the one rule for the value after an option, refused when it is missing or is itself an option.
- `readConfiguration` is the rule `generate` and `inspect` already followed, and the history command's lens follows in `computeHistory.ts`; `lint`, `board` and `visualize-static` read only the file given until 2026-11-12, which the npm scripts hid by pinning this repository's configuration, and which made `--workspace <folder>` read this repository's configuration for another folder. The pins went the same day.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `packageVersion` {#symbol-packageversion}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L16)

##### `packageVersion` — Summary
The version of one of this repository's packages, from its manifest: a command prints its package's version, never a constant of its own.

#### `endQuietlyWhenThePipeCloses` {#symbol-endquietlywhenthepipecloses}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L23)

##### `endQuietlyWhenThePipeCloses` — Summary
Ends the process quietly when the reader closes the pipe before the listing is done, as `head` does, instead of dying with a stack trace.

#### `UsageError` {#symbol-usageerror}
- Type: class
- Source: [source](../../../../scripts/live-docs/cli.ts#L33)

##### `UsageError` — Summary
A command line the command refuses: one plain sentence, printed with where its options are listed and never with a stack.

#### `optionValue` {#symbol-optionvalue}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L36)

##### `optionValue` — Summary
The value after an option, refused when it is missing or is itself an option.

#### `runCommand` {#symbol-runcommand}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L49)

##### `runCommand` — Summary
Runs a command to its end, by the name of the npm script that runs it: a
refused command line prints one line, naming what was refused and how to list
the options; any other failure prints its message; both exit 1.

#### `readConfiguration` {#symbol-readconfiguration}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L65)

##### `readConfiguration` — Summary
The configuration a command reads: the file given, else the workspace's own
`.live-docs.config.json` when it has one, else nothing, which leaves the
shipped defaults. The history command reads its lens by the same rule.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput) (type-only)
<!-- LIVE-DOC:END Dependencies -->
