# packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-persistence-url-state-ts
- Generated At: 2026-03-31T17:27:17.780Z

## Authored

### Purpose

Manages URL-based state persistence for the Explorer. Parses initial state from URL parameters and updates the URL as users navigate, enabling shareable deep links to specific artifacts and views.

### Notes

- Extracted from client/index.ts during Dev Day 50 (12/19). The `parseInitialState()` and `updateUrlState()` functions work together to maintain URL↔state synchronization without page reloads.
- On [Dev Day 86](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-31.1.md) the default fallback view was changed from `"sources"` (Circuit Board) to `"membrane"` to reflect the Membrane Map's promotion to cold-start default. `updateUrlState()` was also updated to write an explicit `?view=` parameter for non-membrane views, since membrane is now the implicit default.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-31T17:27:17.780Z","inputHash":"499b69dd3ff925f9"}]} -->
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

#### `ViewerConfig` {#symbol-viewerconfig}

- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L50)

##### `ViewerConfig` — Summary

Optional configuration object supplied by the `viewerConfig` JSON block in the HTML template.

#### `parseInitialState` {#symbol-parseinitialstate}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L59)

##### `parseInitialState` — Summary

Parse initial view and node from URL parameters.
Priority: URL params > viewerConfig > defaults (Membrane view for cold start)

#### `updateUrlState` {#symbol-updateurlstate}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts#L103)

##### `updateUrlState` — Summary

Update URL to reflect current view and focused node without page reload.
Uses replaceState to avoid polluting browser history on every interaction.

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`compressed-url-state.decompressSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
<!-- LIVE-DOC:END Dependencies -->
