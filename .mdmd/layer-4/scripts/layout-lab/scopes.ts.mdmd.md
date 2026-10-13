# scripts/layout-lab/scopes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/scopes.ts
- Generated At: 2026-10-13T16:52:35.915Z

## Authored
### Purpose

Defines retained scopes for the layout lab and serves their built Explorer bundles to a browser directly from disk.

### Notes

The CLI finds named deck scopes by `bundle/scope`; callers can also supply another retained file set with its own descriptive scope name. The retained picture's subject is its first file. `serveBundle` answers every request under `http://lab.local` from the built bundle on disk through a Playwright route, so no server process is needed, with Pretext's modules passed through to the capture's own route; `loadBundleGraph` reads the bundle's data and projects it as the client does. `admitCompiledFunctions` defines the `__name` helper esbuild's kept names expect, so a function compiled by tsx can run inside the page.

The disk-serving helpers came from the [October 6 lab](../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-06.1.SUMMARIZED.md#turn-10). Custom scope names support browser/lab checks of concrete regressions, such as the warehouse Report scene used during the [October 13 competition work](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply), without relabeling them as one of the deck's fixed examples.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ScopeRun` {#symbol-scoperun}
- Type: type
- Source: [source](../../../../scripts/layout-lab/scopes.ts#L19)

##### `ScopeRun` — Summary
A retained scope over a built bundle: a named deck scope or another explicitly supplied set of files.

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
