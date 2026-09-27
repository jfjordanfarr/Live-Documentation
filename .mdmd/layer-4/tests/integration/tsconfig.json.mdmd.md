# tests/integration/tsconfig.json

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/tsconfig.json
- Generated At: 2026-09-27T23:21:39.755Z

## Authored
### Purpose
A `noEmit` TypeScript project that type-checks the integration suites under `tests/integration/` without compiling them; the gate runs it as the "Type-check tests" step in `scripts/verify.mjs`.

### Notes
- Source file: [`tests/integration/tsconfig.json`](../../../../tests/integration/tsconfig.json)
- Extends `tsconfig.base.json` and turns off `composite`, declarations and source maps because nothing is emitted. Fixture sources under `fixtures/` and `programs/` are excluded.
- Vitest itself transpiles without type-checking, which is why this project exists. Until 2026-09-27 the same file compiled the suites for the VS Code Electron harness.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `extends` {#symbol-extends}
- Type: key

#### `compilerOptions` {#symbol-compileroptions}
- Type: key

#### `compilerOptions:noEmit` {#symbol-compileroptionsnoemit}
- Type: key

#### `compilerOptions:composite` {#symbol-compileroptionscomposite}
- Type: key

#### `compilerOptions:declaration` {#symbol-compileroptionsdeclaration}
- Type: key

#### `compilerOptions:declarationMap` {#symbol-compileroptionsdeclarationmap}
- Type: key

#### `compilerOptions:sourceMap` {#symbol-compileroptionssourcemap}
- Type: key

#### `compilerOptions:types` {#symbol-compileroptionstypes}
- Type: key

#### `include` {#symbol-include}
- Type: key

#### `exclude` {#symbol-exclude}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
