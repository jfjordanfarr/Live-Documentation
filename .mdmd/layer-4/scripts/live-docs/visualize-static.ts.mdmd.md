# scripts/live-docs/visualize-static.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-static.ts
- Entry: command `live-docs:visualize` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-19T19:18:28.065Z

## Authored
### Purpose
CLI entry point for building the static Explorer bundle of a workspace, this repository's or another folder's, for serving locally or static hosting.

### Notes
- Created 2025-12-07.
- Accepts `--output <dir>` (default `dist/explorer/`), `--config <file>` and `--pretty`; the Local Map precomputation and provenance flags went on 2026-09-28.
- `--history none|all|since <date>|last <n>` (2026-10-17, C1 of [the plan](../../../../.mdmd/layer-3/change-over-time.mdmd.md)): how much of the history the export carries, by the exporter's choice, since some histories are too large to ride; by default all of it when the history command has written `<root>/history/history.json`, and none otherwise.
- Delegates to `staticBuilder.buildStaticExplorer()` and prints the file, edge and related-markdown counts and the bundle size. Invoked as `npm run live-docs:visualize`.
- Since 2026-11-12, after [the first-visit evaluation](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md): `--help` prints its usage, where it died with a stack trace; a refused argument is one line, through `runCommand` in [cli.ts](cli.ts.mdmd.md); `--workspace <folder>` builds another folder's Explorer, reading that folder's own configuration when no `--config` is given, as `generate` does. The closing lines report the bytes this build wrote, not the whole output folder, and give a serve command in place of "Open index.html in a browser", since a page opened as a file cannot load its data; `http-server` became a devDependency the same day so that the command resolves from this checkout without a download.
- The board is `--board` when given, else the configuration's `board`, else none (2026-11-12): until then the npm script passed this repository's board on every build, which made `npm run live-docs:visualize -- --workspace <folder>` look for that board in the other folder. The serve line binds to this machine, `-a 127.0.0.1`, since a map of a codebase is not offered to the local network by default.
- Since 2026-11-19 a path typed here, `--workspace`, `--config` and `--output`, is taken from the folder the command was run from, through `invocationFolder` in [cli.ts](cli.ts.mdmd.md), and the default output is this checkout's `dist/explorer/` by its own location, so that it stays where the guides say, and where the browser suite and the owner's preview find this repository's own Explorer, wherever the command is run from. Whether another folder's map should go elsewhere by default, since a second map overwrites the first, is a question the [probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md) put to the owner.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`staticBuilder.ExportedHistory`](../../packages/explorer/src/shared/staticBuilder.ts.mdmd.md#symbol-exportedhistory)
- [`staticBuilder.buildStaticExplorer`](../../packages/explorer/src/shared/staticBuilder.ts.mdmd.md#symbol-buildstaticexplorer)
- [`cli.UsageError`](./cli.ts.mdmd.md#symbol-usageerror)
- [`cli.invocationFolder`](./cli.ts.mdmd.md#symbol-invocationfolder)
- [`cli.optionValue`](./cli.ts.mdmd.md#symbol-optionvalue)
- [`cli.readConfiguration`](./cli.ts.mdmd.md#symbol-readconfiguration)
- [`cli.runCommand`](./cli.ts.mdmd.md#symbol-runcommand)
- [`cli.typedPath`](./cli.ts.mdmd.md#symbol-typedpath)
- [`cli.workspaceFolder`](./cli.ts.mdmd.md#symbol-workspacefolder)
<!-- LIVE-DOC:END Dependencies -->
