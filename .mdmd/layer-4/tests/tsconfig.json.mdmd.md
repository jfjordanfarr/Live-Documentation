# tests/tsconfig.json

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/tsconfig.json
- Entry: tooling
- Generated At: 2026-10-19T16:54:55.745Z

## Authored
### Purpose
Type-check every executable TypeScript test without emitting files, so a transpile-only test run cannot hide type errors in assertions, fixtures, or browser specs.

### Notes
- Extends the repository's base TypeScript settings and includes package, script, integration, and browser tests. Fixture and sample program sources are inputs to tests and are excluded from this project.
- The integration-only checker began as the VS Code Electron harness project and became a `noEmit` gate when that harness was retired on 2026-09-27. This file supersedes it with one test-wide gate; `scripts/verify.mjs` runs the checker.

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

#### `compilerOptions:allowJs` {#symbol-compileroptionsallowjs}
- Type: key

#### `compilerOptions:lib` {#symbol-compileroptionslib}
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
- [`tsconfig.base`](../tsconfig.base.json.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
