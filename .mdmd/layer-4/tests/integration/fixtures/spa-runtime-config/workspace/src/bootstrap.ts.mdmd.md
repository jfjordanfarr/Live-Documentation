# tests/integration/fixtures/spa-runtime-config/workspace/src/bootstrap.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/spa-runtime-config/workspace/src/bootstrap.ts
- Generated At: 2026-09-27T23:21:33.683Z

## Authored
### Purpose
Mocks a SPA entrypoint that hydrates telemetry settings by calling into the alias-mapped runtime config module, giving the inspect CLI a concrete import chain to resolve.

### Notes
- Pairs with `src/config/runtime.ts` to demonstrate how Live Docs should collapse custom module aliases back to disk paths during LD-402 runs.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `hydrateApplication` {#symbol-hydrateapplication}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/spa-runtime-config/workspace/src/bootstrap.ts#L3)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`runtime.getRuntimeConfig`](./config/runtime.ts.mdmd.md#symbol-getruntimeconfig)
<!-- LIVE-DOC:END Dependencies -->
