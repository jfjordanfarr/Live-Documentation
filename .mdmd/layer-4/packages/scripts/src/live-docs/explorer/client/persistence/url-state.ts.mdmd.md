# packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-persistence-url-state-ts
- Generated At: 2025-12-19T21:19:50.748Z

## Authored
### Purpose
Manages URL-based state persistence for the Explorer. Parses initial state from URL parameters and updates the URL as users navigate, enabling shareable deep links to specific artifacts and views.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19). The `parseInitialState()` and `updateUrlState()` functions work together to maintain URL↔state synchronization without page reloads.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:19:50.748Z","inputHash":"e9b8794410cb1acb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `viewNameToInternal` {#symbol-viewnametointernal}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L15)

##### `viewNameToInternal` — Summary
Map between URL/config view names and internal state view names.
URL uses: circuit, local, force, sources (matches config schema)
Internal uses: circuit, map, graph, sources

#### `viewNameToUrl` {#symbol-viewnametourl}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L26)

#### `InitialUrlState` {#symbol-initialurlstate}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L37)

#### `ViewerConfig` {#symbol-viewerconfig}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L43)

#### `parseInitialState` {#symbol-parseinitialstate}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L52)

##### `parseInitialState` — Summary
Parse initial view and node from URL parameters.
Priority: URL params > viewerConfig > defaults (Sources view for cold start)

#### `updateUrlState` {#symbol-updateurlstate}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L83)

##### `updateUrlState` — Summary
Update URL to reflect current view and focused node without page reload.
Uses replaceState to avoid polluting browser history on every interaction.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
<!-- LIVE-DOC:END Dependencies -->
