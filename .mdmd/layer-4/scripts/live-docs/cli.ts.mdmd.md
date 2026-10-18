# scripts/live-docs/cli.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/cli.ts
- Generated At: 2026-10-18T01:36:54.181Z

## Authored
### Purpose
What the Live Docs commands share at their edge: the version each prints, read from the manifest of the package that does its work (the generator's for `generate`, the engine's for `inspect` and `lint`), and a quiet end when the reader closes the pipe before a listing is done.

### Notes
- Written 2026-10-18 when the history build found `generate --version` printing a constant, 0.1.0, or an environment variable, while the generator package is 0.0.0 and the history's lens carries the manifest's version ([the record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#work-notes-continued-the-c1-hand-back)); `inspect` and `lint` printed the same constant, and `inspect` piped into `head` died with an EPIPE trace. A command's version is its package's and nothing of its own, so the three read their manifests here, and the two that print long listings end quietly when the pipe closes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `packageVersion` {#symbol-packageversion}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L13)

##### `packageVersion` — Summary
The version of one of this repository's packages, from its manifest: a command prints its package's version, never a constant of its own.

#### `endQuietlyWhenThePipeCloses` {#symbol-endquietlywhenthepipecloses}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L20)

##### `endQuietlyWhenThePipeCloses` — Summary
Ends the process quietly when the reader closes the pipe before the listing is done, as `head` does, instead of dying with a stack trace.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->
