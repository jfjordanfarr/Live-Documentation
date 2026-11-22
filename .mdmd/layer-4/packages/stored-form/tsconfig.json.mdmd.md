# `packages/stored-form/tsconfig.json`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/stored-form/tsconfig.json`
- Entry: tooling
- Generated At: 2026-11-22T02:13:56.361Z

## Authored
### Purpose
Builds the stored form to ECMAScript modules against the browser's library and no Node types (`types: []`), so that the type-check itself refuses any use of a Node-only interface: the module must run unchanged in Node 26 and in a page.

### Notes
It does not extend the repository's base configuration, which keys the history's cache: a change here moves no key. It builds `src/` alone, which holds only the module; the tests, the fuzzer and their scans live in `test/` (since 2026-11-22).

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

#### `compilerOptions:lib` {#symbol-compileroptionslib}
- Type: key

#### `compilerOptions:types` {#symbol-compileroptionstypes}
- Type: key

#### `compilerOptions:strict` {#symbol-compileroptionsstrict}
- Type: key

#### `compilerOptions:skipLibCheck` {#symbol-compileroptionsskiplibcheck}
- Type: key

#### `compilerOptions:forceConsistentCasingInFileNames` {#symbol-compileroptionsforceconsistentcasinginfilenames}
- Type: key

#### `compilerOptions:sourceMap` {#symbol-compileroptionssourcemap}
- Type: key

#### `compilerOptions:declaration` {#symbol-compileroptionsdeclaration}
- Type: key

#### `compilerOptions:declarationMap` {#symbol-compileroptionsdeclarationmap}
- Type: key

#### `compilerOptions:rootDir` {#symbol-compileroptionsrootdir}
- Type: key

#### `compilerOptions:outDir` {#symbol-compileroptionsoutdir}
- Type: key

#### `include` {#symbol-include}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
