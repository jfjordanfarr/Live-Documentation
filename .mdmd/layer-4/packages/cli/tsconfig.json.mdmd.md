# packages/cli/tsconfig.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/cli/tsconfig.json
- Entry: tooling
- Generated At: 2026-10-16T00:58:41.680Z

## Authored
### Purpose
The TypeScript project of the CLI package, which is not yet publishable: it extends the shared `tsconfig.base.json` and names the package's sources, output and references.

### Notes
- Gained a Live Doc on 2026-10-16, when discovery began reading every file an adapter can read anywhere in the workspace; the earlier defaults reached only `packages/**/src/**`, so a package's own project file sat above them ([Turn 9 of the October 15 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)).

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

#### `compilerOptions:composite` {#symbol-compileroptionscomposite}
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
