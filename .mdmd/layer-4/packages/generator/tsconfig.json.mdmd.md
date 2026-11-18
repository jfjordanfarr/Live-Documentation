# packages/generator/tsconfig.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/tsconfig.json
- Entry: tooling
- Generated At: 2026-11-18T14:58:00.644Z

## Authored
### Purpose
The TypeScript project of the generator: it extends the shared `tsconfig.base.json` and names the package's sources, output and references.

### Notes
- Gained a Live Doc on 2026-10-16, when discovery began reading every file an adapter can read anywhere in the workspace; the earlier defaults reached only `packages/**/src/**`, so a package's own project file sat above them ([Turn 9 of the October 15 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-15/2026-10-15.1.record.md#turn-9)).
- `tsBuildInfoFile` keeps the compiler's record of what it has already built inside `dist`, beside the output it describes. Left at its default the record stands beside this file, and a `dist` that is deleted or not carried along leaves a record of output that is no longer there: `tsc -p` then believes it and writes only what it thinks has changed. On 2026-11-18 a working copy moved without its `dist` folders failed its first build that way, in the Explorer, on the engine's missing declarations ([Turn 2 of the November 18 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-2)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `extends` {#symbol-extends}
- Type: key

#### `compilerOptions` {#symbol-compileroptions}
- Type: key

#### `compilerOptions:rootDir` {#symbol-compileroptionsrootdir}
- Type: key

#### `compilerOptions:outDir` {#symbol-compileroptionsoutdir}
- Type: key

#### `compilerOptions:tsBuildInfoFile` {#symbol-compileroptionstsbuildinfofile}
- Type: key

#### `include` {#symbol-include}
- Type: key

#### `exclude` {#symbol-exclude}
- Type: key

#### `references` {#symbol-references}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`tsconfig.base`](../../tsconfig.base.json.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
