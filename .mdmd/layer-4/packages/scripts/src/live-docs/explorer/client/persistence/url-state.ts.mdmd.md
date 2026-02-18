# packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-persistence-url-state-ts
- Generated At: 2026-02-18T21:27:51.442Z

## Authored
### Purpose
Manages URL-based state persistence for the Explorer. Parses initial state from URL parameters and updates the URL as users navigate, enabling shareable deep links to specific artifacts and views.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19). The `parseInitialState()` and `updateUrlState()` functions work together to maintain URL↔state synchronization without page reloads.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:51.442Z","inputHash":"ac4074f17ff0b27c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `viewNameToInternal` {#symbol-viewnametointernal}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L16)

##### `viewNameToInternal` — Summary
Maps a URL-facing view name (e.g. `"local"`) to the internal {@link ViewName}.

#### `viewNameToUrl` {#symbol-viewnametourl}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L28)

##### `viewNameToUrl` — Summary
Maps an internal {@link ViewName} back to the URL-facing string used in query parameters.

#### `InitialUrlState` {#symbol-initialurlstate}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L40)

##### `InitialUrlState` — Summary
State parsed from the initial URL on page load.

#### `ViewerConfig` {#symbol-viewerconfig}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L47)

##### `ViewerConfig` — Summary
Optional configuration object supplied by the `viewerConfig` JSON block in the HTML template.

#### `parseInitialState` {#symbol-parseinitialstate}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L56)

##### `parseInitialState` — Summary
Parse initial view and node from URL parameters.
Priority: URL params > viewerConfig > defaults (Sources view for cold start)

#### `updateUrlState` {#symbol-updateurlstate}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L87)

##### `updateUrlState` — Summary
Update URL to reflect current view and focused node without page reload.
Uses replaceState to avoid polluting browser history on every interaction.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
<!-- LIVE-DOC:END Dependencies -->
