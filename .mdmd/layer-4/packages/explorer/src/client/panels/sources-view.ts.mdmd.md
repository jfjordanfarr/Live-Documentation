# packages/explorer/src/client/panels/sources-view.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/sources-view.ts
- Generated At: 2026-10-22T16:47:54.572Z

## Authored
### Purpose
Renders the Knowledge Sources panel from `sources-facts.ts`: the bundle's shape, the files most used and most using, the entry points by reason and what they reach, the "Reachable from" field, what no entry reaches and what only a test reaches, the public symbols that nothing references or only tests reference, the tree of bundled related markdown, and the export controls. Every file named is a button that puts it in the detail panel; every directory counted is a link to the Local Map's directory door.

### Notes
- Extracted from client/index.ts on 2025-12-19. The data-source and viewer-configuration rows that described a server mode went on 2026-09-28.
- Rewritten on 2026-10-08 from [the dead code sweep](../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md), which found what the panel should say: the fixed thresholds that called a file a "potential barrel" or "heavily depended-upon" went (a bare count had crowned a barrel more than half unused through itself), with the cut list of "disconnected nodes", the tagline, the "How to Improve" text that named this repository's npm scripts, and the export's prose and dead "server mode" note. The lists are whole, since a cut list hides what a person came to see, and grouped in native `details` elements. What the docs cannot tell apart, an entry point from a true orphan and a symbol its own file uses from a dead one, the panel says in one sentence each rather than guesses.
- Rewritten on 2026-10-15 ([Turn 4](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-4); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)): "Nothing references these" became "Entry points", grouped as programs, commands, modules, openings served, tooling inputs, declared files and tests, a file with several reasons standing in each and a sample program's entries folded under its root, then "Unreachable from any entry" by archetype and "Reached only from tests". The field is the search bar's `createSearchField` over the whole bundle; a choice calls `onReachFrom`, the clear goes back to the entries, and beside a chosen start the line that would declare it in `.live-docs.config.json` is shown and copied, since a static page cannot write the file (the owner's thought: "the system inferred one sits in an omnisearch textinput ready for the user to adjust").

The History row (2026-10-18, ticket C4 and C7 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): what the bundle carries of its history, how many commits from when to when, the window when it carries one and whether the clone is shallow; or, when none was computed, one line naming `npm run live-docs:history` to copy, then a rebuild of the bundle, with the copy beside the value rather than inside it so that the design audit reads two boxes, not one on another. Nothing else appears for a bundle without history, as the plan's C7 says.
- Since 2026-10-22 ([Turn 8 of the October 21 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)) the unreachable section closes with "Not read": the files no start reaches whose kind no reader handles yet, by archetype, with one sentence saying that what reaches them, and what they reach, is unknown. They had been counted as unreachable once every file got a doc.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DownloadBundleType` {#symbol-downloadbundletype}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L31)

##### `DownloadBundleType` — Summary
Which documents the export takes: the Live Docs, the related markdown, or both.

#### `DownloadFormat` {#symbol-downloadformat}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L34)

##### `DownloadFormat` — Summary
One flattened markdown file, or a ZIP that keeps the folders.

#### `SourcesViewConfig` {#symbol-sourcesviewconfig}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L37)

##### `SourcesViewConfig` — Summary
What the panel needs from the client.

#### `HISTORY_COMMAND` {#symbol-history_command}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L70)

##### `HISTORY_COMMAND` — Summary
The command a person copies to compute a history the bundle lacks.

#### `renderSourcesView` {#symbol-rendersourcesview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L355)
- Parameters: `config`: [`SourcesViewConfig`](#symbol-sourcesviewconfig)

##### `renderSourcesView` — Summary
Render the panel into its container and wire its buttons and its field.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`graph-helpers.escapeHtml`](../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`sources-facts.FileByArchetype`](./sources-facts.ts.mdmd.md#symbol-filebyarchetype)
- [`sources-facts.SourcesFacts`](./sources-facts.ts.mdmd.md#symbol-sourcesfacts-interface)
- [`sources-facts.StartFile`](./sources-facts.ts.mdmd.md#symbol-startfile)
- [`sources-facts.SymbolsOfFile`](./sources-facts.ts.mdmd.md#symbol-symbolsoffile)
- [`sources-facts.symbolCount`](./sources-facts.ts.mdmd.md#symbol-symbolcount)
- [`graph-search.SearchHit`](../search/graph-search.ts.mdmd.md#symbol-searchhit) (type-only)
- [`graph-search.SearchIndex`](../search/graph-search.ts.mdmd.md#symbol-searchindex) (type-only)
- [`search-field.createSearchField`](../search/search-field.ts.mdmd.md#symbol-createsearchfield)
- [`types.LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective) (type-only)
- [`types.PathDestination`](../types.ts.mdmd.md#symbol-pathdestination) (type-only)
- [`staticExplorerData.BundledHistory`](../../shared/staticExplorerData.ts.mdmd.md#symbol-bundledhistory) (type-only)
- [`staticExplorerData.BundledMarkdownTreeNode`](../../shared/staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
