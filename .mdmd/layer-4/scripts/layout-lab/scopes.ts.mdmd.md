# scripts/layout-lab/scopes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/scopes.ts
- Generated At: 2026-10-06T20:39:26.000Z

## Authored
### Purpose

The scopes the layout lab works on, which are the deck's, and the built bundle each is drawn from, served to a browser straight from `dist/explorer`.

### Notes

A scope is found by `bundle/scope`; the retained picture's subject is its first file. `serveBundle` answers every request under `http://lab.local` from the built bundle on disk through a Playwright route, so no server process is needed, with Pretext's modules passed through to the capture's own route; `loadBundleGraph` reads the bundle's data and projects it as the client does. `admitCompiledFunctions` defines the `__name` helper esbuild's kept names expect, so a function compiled by tsx can run inside the page.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ScopeRun` {#symbol-scoperun}
- Type: type
- Source: [source](../../../../scripts/layout-lab/scopes.ts#L19)
- Returns: [`DeckScope`](../../tests/e2e/scopes.ts.mdmd.md#symbol-deckscope)

##### `ScopeRun` — Summary
A scope the lab works on: one of the deck's.

#### `DIST` {#symbol-dist}
- Type: const
- Source: [source](../../../../scripts/layout-lab/scopes.ts#L22)

##### `DIST` — Summary
The built Explorer, which `npm run live-docs:visualize` and `:estate` write.

#### `ORIGIN` {#symbol-origin}
- Type: const
- Source: [source](../../../../scripts/layout-lab/scopes.ts#L25)

##### `ORIGIN` — Summary
The origin the lab serves a bundle under; nothing listens there, the page's requests are answered from disk.

#### `findScope` {#symbol-findscope}
- Type: function
- Source: [source](../../../../scripts/layout-lab/scopes.ts#L28)
- Returns: [`ScopeRun`](#symbol-scoperun)

##### `findScope` — Summary
A scope by `bundle/scope`, as in `repository/five files`, `repository/five`, `estate/chain`.

#### `retainedSubject` {#symbol-retainedsubject}
- Type: const
- Source: [source](../../../../scripts/layout-lab/scopes.ts#L37)

##### `retainedSubject` — Summary
The subject of the scope's retained picture: its first file, as the deck's retained rows open it.

#### `scopeSlug` {#symbol-scopeslug}
- Type: const
- Source: [source](../../../../scripts/layout-lab/scopes.ts#L40)

##### `scopeSlug` — Summary
The scope's short key, for file names: `repository-five-files`.

#### `serveBundle` {#symbol-servebundle}
- Type: function
- Source: [source](../../../../scripts/layout-lab/scopes.ts#L48)
- Parameters: `page`: `Page`

##### `serveBundle` — Summary
Answers the page's requests under the lab's origin from the built bundle on disk.

#### `admitCompiledFunctions` {#symbol-admitcompiledfunctions}
- Type: function
- Source: [source](../../../../scripts/layout-lab/scopes.ts#L69)
- Parameters: `page`: `Page`

##### `admitCompiledFunctions` — Summary
Lets a function compiled by tsx run inside the page. esbuild keeps function
names by wrapping each in a `__name(...)` call, a helper the node side has
and the page has not, so a function Playwright serializes into the page
would fail on its first line; this defines the helper there as the identity.

#### `loadBundleGraph` {#symbol-loadbundlegraph}
- Type: function
- Source: [source](../../../../scripts/layout-lab/scopes.ts#L74)
- Parameters: `run`: [`ScopeRun`](#symbol-scoperun)

##### `loadBundleGraph` — Summary
The scope's bundle as the client projects it, read from disk.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
- `node:fs/promises`
- `node:path` - `path`
- [`graph.explorerGraphOf`](../../packages/explorer/src/shared/graph.ts.mdmd.md#symbol-explorergraphof)
- [`StaticExplorerData`](../../packages/explorer/src/shared/staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata) (type-only)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`scopes.DECK_SCOPES`](../../tests/e2e/scopes.ts.mdmd.md#symbol-deck_scopes)
- [`scopes.DeckScope`](../../tests/e2e/scopes.ts.mdmd.md#symbol-deckscope)
<!-- LIVE-DOC:END Dependencies -->
