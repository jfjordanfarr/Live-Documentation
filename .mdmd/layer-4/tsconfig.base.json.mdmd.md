# tsconfig.base.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tsconfig.base.json
- Entry: tooling
- Generated At: 2026-10-16T00:58:52.526Z

## Authored
### Purpose
The TypeScript compiler options every package and script of this repository shares, and the project references that build the three packages in order.

### Notes
- The `paths` map `@live-documentation/<package>/*` onto `packages/<package>/src/*`, so that sources import each other without a build; `vitest.config.ts` mirrors the same aliases for the tests. `composite` with declarations is what `tsc -b` needs to build the referenced packages; CommonJS output on an ES2022 target is what Node 22 runs, and the engine's tree-sitter loader relies on `require.resolve` to find its grammars.
- Began with the repository's first scaffolding on 2025-10-16; its references followed the packages through their renames, the last on 2026-09-28 when `packages/scripts` became `packages/explorer`. It gained a Live Doc on 2026-10-16, when discovery began reading every file an adapter can read and the owner's rule put a doc on every file that carries a decision ([Turn 9 of the October 15 session](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)).

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

#### `compilerOptions:baseUrl` {#symbol-compileroptionsbaseurl}
- Type: key

#### `compilerOptions:lib` {#symbol-compileroptionslib}
- Type: key

#### `compilerOptions:types` {#symbol-compileroptionstypes}
- Type: key

#### `compilerOptions:strict` {#symbol-compileroptionsstrict}
- Type: key

#### `compilerOptions:esModuleInterop` {#symbol-compileroptionsesmoduleinterop}
- Type: key

#### `compilerOptions:skipLibCheck` {#symbol-compileroptionsskiplibcheck}
- Type: key

#### `compilerOptions:forceConsistentCasingInFileNames` {#symbol-compileroptionsforceconsistentcasinginfilenames}
- Type: key

#### `compilerOptions:resolveJsonModule` {#symbol-compileroptionsresolvejsonmodule}
- Type: key

#### `compilerOptions:sourceMap` {#symbol-compileroptionssourcemap}
- Type: key

#### `compilerOptions:declaration` {#symbol-compileroptionsdeclaration}
- Type: key

#### `compilerOptions:declarationMap` {#symbol-compileroptionsdeclarationmap}
- Type: key

#### `compilerOptions:composite` {#symbol-compileroptionscomposite}
- Type: key

#### `compilerOptions:outDir` {#symbol-compileroptionsoutdir}
- Type: key

#### `compilerOptions:paths` {#symbol-compileroptionspaths}
- Type: key

#### `compilerOptions:paths:@live-documentation/engine/*` {#symbol-compileroptionspathslive-documentationengine}
- Type: key

#### `compilerOptions:paths:@live-documentation/explorer/*` {#symbol-compileroptionspathslive-documentationexplorer}
- Type: key

#### `compilerOptions:paths:@live-documentation/generator/*` {#symbol-compileroptionspathslive-documentationgenerator}
- Type: key

#### `references` {#symbol-references}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
