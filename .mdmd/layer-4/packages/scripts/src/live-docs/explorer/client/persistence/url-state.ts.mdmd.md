# packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts
- Generated At: 2026-09-28T00:41:38.180Z

## Authored
### Purpose
Manages URL-based state persistence for the Explorer. Parses initial state from URL parameters and updates the URL as users navigate, enabling shareable deep links to specific artifacts and views.

### Notes
- Extracted from client/index.ts on 2025-12-19. The `parseInitialState()` and `updateUrlState()` functions work together to maintain URL and state synchronization without page reloads.
- On 2026-03-31 the default fallback view was changed from `"sources"` to `"membrane"` to reflect the Membrane Map's promotion to cold-start default. `updateUrlState()` was also updated to write an explicit `?view=` parameter for non-membrane views, since membrane is now the implicit default.
- The viewer-configuration fallback in `parseInitialState()` went on 2026-09-28: nothing wrote one.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `viewNameToInternal` {#symbol-viewnametointernal}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L17)

##### `viewNameToInternal` — Summary
Maps a URL-facing view name (e.g. `"local"`) to the internal {@link ViewName}.

#### `viewNameToUrl` {#symbol-viewnametourl}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L30)

##### `viewNameToUrl` — Summary
Maps an internal {@link ViewName} back to the URL-facing string used in query parameters.

#### `InitialUrlState` {#symbol-initialurlstate}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L43)

##### `InitialUrlState` — Summary
State parsed from the initial URL on page load.

#### `parseInitialState` {#symbol-parseinitialstate}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L53)

##### `parseInitialState` — Summary
Parse initial view and node from URL parameters.
Priority: URL params > defaults (Membrane view for cold start)

#### `updateUrlState` {#symbol-updateurlstate}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L88)

##### `updateUrlState` — Summary
Update URL to reflect current view and focused node without page reload.
Uses replaceState to avoid polluting browser history on every interaction.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`compressed-url-state.decompressSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
<!-- LIVE-DOC:END Dependencies -->
