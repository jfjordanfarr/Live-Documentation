# `tests/integration/programs/typescript/tidepool/tsconfig.json`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/typescript/tidepool/tsconfig.json`
- Entry: tooling
- Generated At: 2026-11-19T21:10:28.993Z

## Authored
### Purpose
The game's TypeScript settings: browser libraries, strict checking, JSON imports and the test globals.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-11)). It is what makes the sample's code read as written: `resolveJsonModule` lets `pool.ts` import the level files, and the `vitest/globals` types are why the tests call `describe` and `expect` without importing them. Never compiled here; an implementation file of the root.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `compilerOptions` {#symbol-compileroptions}
- Type: key

#### `compilerOptions:target` {#symbol-compileroptionstarget}
- Type: key

#### `compilerOptions:module` {#symbol-compileroptionsmodule}
- Type: key

#### `compilerOptions:moduleResolution` {#symbol-compileroptionsmoduleresolution}
- Type: key

#### `compilerOptions:resolveJsonModule` {#symbol-compileroptionsresolvejsonmodule}
- Type: key

#### `compilerOptions:strict` {#symbol-compileroptionsstrict}
- Type: key

#### `compilerOptions:lib` {#symbol-compileroptionslib}
- Type: key

#### `compilerOptions:types` {#symbol-compileroptionstypes}
- Type: key

#### `include` {#symbol-include}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
