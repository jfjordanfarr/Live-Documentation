# tests/integration/fixtures/spa-runtime-config/workspace/tsconfig.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/spa-runtime-config/workspace/tsconfig.json
- Generated At: 2026-09-27T23:21:33.718Z

## Authored
### Purpose
Fixture TypeScript configuration used by the SPA runtime configuration suite to compile test harness utilities and asset adapters.

### Notes
- Mirrors the compiler flags our production SPA harness relies on, ensuring integration tests compile helper scripts exactly like the real project.
- Read by the inspect CLI integration suite, which resolves the fixture's alias imports through it; edits here change module resolution and must be reflected in test expectations.
- Update alongside fixture source files and document changes in the fixture README to keep regeneration narratives reproducible.

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

#### `compilerOptions:strict` {#symbol-compileroptionsstrict}
- Type: key

#### `compilerOptions:lib` {#symbol-compileroptionslib}
- Type: key

#### `compilerOptions:baseUrl` {#symbol-compileroptionsbaseurl}
- Type: key

#### `compilerOptions:paths` {#symbol-compileroptionspaths}
- Type: key

#### `compilerOptions:paths:@app/*` {#symbol-compileroptionspathsapp}
- Type: key

#### `include` {#symbol-include}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
