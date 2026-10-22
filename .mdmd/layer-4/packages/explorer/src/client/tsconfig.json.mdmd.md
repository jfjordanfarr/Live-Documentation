# packages/explorer/src/client/tsconfig.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/tsconfig.json
- Entry: tooling
- Generated At: 2026-10-22T18:45:24.614Z

## Authored
### Purpose

TypeScript project configuration for the Explorer client bundle. Extends the workspace base config and adds DOM and DOM.Iterable lib targets required for browser APIs (`getElementById`, `addEventListener`, Canvas/SVG DOM). Uses `noEmit` because esbuild handles the actual bundling.

### Notes

- Created [2025-12-02](../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-02.SUMMARIZED.md) to give the client code its own compilation scope separate from the Node.js server code (`92eeb04a`).
- Since 2026-10-22 it resolves modules as a bundler does (`Bundler`), the base project having moved to `NodeNext`, and names the ambient contract for `d3-force-3d` (`../shared/d3-force-3d.d.ts`) in its `include`, which the layout module used to pull in by importing it for its side effect.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `extends` {#symbol-extends}
- Type: key

#### `compilerOptions` {#symbol-compileroptions}
- Type: key

#### `compilerOptions:lib` {#symbol-compileroptionslib}
- Type: key

#### `compilerOptions:composite` {#symbol-compileroptionscomposite}
- Type: key

#### `compilerOptions:declaration` {#symbol-compileroptionsdeclaration}
- Type: key

#### `compilerOptions:declarationMap` {#symbol-compileroptionsdeclarationmap}
- Type: key

#### `compilerOptions:noEmit` {#symbol-compileroptionsnoemit}
- Type: key

#### `compilerOptions:incremental` {#symbol-compileroptionsincremental}
- Type: key

#### `compilerOptions:module` {#symbol-compileroptionsmodule}
- Type: key

#### `compilerOptions:moduleResolution` {#symbol-compileroptionsmoduleresolution}
- Type: key

#### `include` {#symbol-include}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`d3-force-3d.d`](../shared/d3-force-3d.d.ts.mdmd.md)
- [`tsconfig.base`](../../../../tsconfig.base.json.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
