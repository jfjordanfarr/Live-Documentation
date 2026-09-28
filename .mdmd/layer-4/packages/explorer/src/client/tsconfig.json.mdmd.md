# packages/explorer/src/client/tsconfig.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/tsconfig.json
- Generated At: 2026-09-27T23:21:27.668Z

## Authored
### Purpose

TypeScript project configuration for the Explorer client bundle. Extends the workspace base config and adds DOM and DOM.Iterable lib targets required for browser APIs (`getElementById`, `addEventListener`, Canvas/SVG DOM). Uses `noEmit` because esbuild handles the actual bundling.

### Notes

- Created [2025-12-02](../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-02.SUMMARIZED.md) to give the client code its own compilation scope separate from the Node.js server code (`92eeb04a`).

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

#### `include` {#symbol-include}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
