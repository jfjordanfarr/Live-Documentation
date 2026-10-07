# scripts/layout-lab/verify.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/verify.ts
- Generated At: 2026-10-07T13:20:48.909Z

## Authored
### Purpose

The high-precision pass: a configuration rendered by the page itself, with the tuning seeded into the Explorer's storage, and read with the deck's own instrument beside the lab's numbers.

### Notes

Seeds `PERSISTED_UI_KEY` with the configuration as Local Map tuning before the page loads, opens the retained scope over the bundle on disk, and reads it with `readPicture`, `scoreLength`, `scoreExpanded` and `scoreForeign`; the placement measure and the picture's size from the placed root, and since the restarts of 2026-10-06 the start the page drew and its layout time by the page's own clock (`data-order-start`, `data-layout-ms`). The table is the lab against the page, signal by signal. This pass found the page drawing every branch picture twice on load (its second drawing named the first as its start), which `index.ts` no longer does.
- The page is seeded with the continuing search off (`searchStarts: 0`), since the lab's numbers are the first paint's (2026-10-07).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Verification` {#symbol-verification}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/verify.ts#L18)

##### `Verification` — Summary
What the page showed for a configuration, read by the deck's instrument.

#### `verifyConfig` {#symbol-verifyconfig}
- Type: function
- Source: [source](../../../../scripts/layout-lab/verify.ts#L34)
- Parameters: `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `config`: [`LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)

##### `verifyConfig` — Summary
Renders a configuration in the page with the tuning seeded and reads it with the deck's instrument.

#### `compareTable` {#symbol-comparetable}
- Type: function
- Source: [source](../../../../scripts/layout-lab/verify.ts#L65)
- Parameters: `lab`: [`Signals`](./signals.ts.mdmd.md#symbol-signals); `page`: [`Verification`](#symbol-verification)

##### `compareTable` — Summary
The lab's and the page's numbers side by side.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `chromium`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`evaluate.LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig) (type-only)
- [`scopes.ORIGIN`](./scopes.ts.mdmd.md#symbol-origin)
- [`scopes.ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun)
- [`scopes.admitCompiledFunctions`](./scopes.ts.mdmd.md#symbol-admitcompiledfunctions)
- [`scopes.serveBundle`](./scopes.ts.mdmd.md#symbol-servebundle)
- [`Signals`](./signals.ts.mdmd.md#symbol-signals) (type-only)
- [`still-picture.LOCAL_MAP`](../../tests/e2e/still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.displayNames`](../../tests/e2e/still-picture.ts.mdmd.md#symbol-displaynames)
- [`still-picture.localRetainUrl`](../../tests/e2e/still-picture.ts.mdmd.md#symbol-localretainurl)
- [`still-picture.readPicture`](../../tests/e2e/still-picture.ts.mdmd.md#symbol-readpicture)
- [`still-picture.scoreExpanded`](../../tests/e2e/still-picture.ts.mdmd.md#symbol-scoreexpanded)
- [`still-picture.scoreForeign`](../../tests/e2e/still-picture.ts.mdmd.md#symbol-scoreforeign)
- [`still-picture.scoreLength`](../../tests/e2e/still-picture.ts.mdmd.md#symbol-scorelength)
- [`still-picture.symbolCounts`](../../tests/e2e/still-picture.ts.mdmd.md#symbol-symbolcounts)
<!-- LIVE-DOC:END Dependencies -->
