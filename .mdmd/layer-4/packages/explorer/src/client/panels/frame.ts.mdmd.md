# packages/explorer/src/client/panels/frame.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/frame.ts
- Generated At: 2026-11-19T04:34:52.707Z

## Authored
### Purpose
The Bare frame, a trial of a page without its sidebar. With Tuning's Page group's Frame set to Bare, it moves the sidebar's own elements to where they are used: the views and the places into a breadcrumb at the left of the top bar, with Back and Forward beside it; the display filters and the legend into a key opened from the bottom strip; Tuning into a sheet opened from the strip's tuning button. Under Sidebar it puts them back. Moving rather than copying keeps one implementation of every lever and filter.

### Notes
- Written on 2026-11-19 for the owner's question of [Turn 34 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-34), how the page could get out of the way so that the scanned materials do the talking, perhaps without the left sidebar, and their "That would be great!" to building the sidebar-free page behind a lever, to judge in the app. A trial, not a production decision: the default frame stays the sidebar.
- The crumbs are read by `frame-crumbs.ts`; the subject they end at is chosen by `frameSubject` in `index.ts`, and a directory's crumb calls the same centring a directory's Centre does.
- The design and what is left open are in the Explorer design's section on the frame (`.mdmd/layer-3/live-documentation-explorer.mdmd.md`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FrameConfig` {#symbol-frameconfig}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/frame.ts#L17)

##### `FrameConfig` — Summary
What the frame reads from the page and what its crumbs ask of it.

#### `Frame` {#symbol-frame}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/frame.ts#L31)

#### `FRAME_KEY_ICON` {#symbol-frame_key_icon}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/panels/frame.ts#L47)

##### `FRAME_KEY_ICON` — Summary
The key's drawing, for the strip's button.

#### `createFrame` {#symbol-createframe}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/frame.ts#L49)
- Returns: [`Frame`](#symbol-frame)
- Parameters: `config`: [`FrameConfig`](#symbol-frameconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`frame-crumbs.Crumb`](./frame-crumbs.ts.mdmd.md#symbol-crumb)
- [`frame-crumbs.CrumbSubject`](./frame-crumbs.ts.mdmd.md#symbol-crumbsubject)
- [`frame-crumbs.crumbsOf`](./frame-crumbs.ts.mdmd.md#symbol-crumbsof)
- [`frame-crumbs.outwardCrumb`](./frame-crumbs.ts.mdmd.md#symbol-outwardcrumb)
- [`icon-button.DIRECTORY_ICON`](./icon-button.ts.mdmd.md#symbol-directory_icon)
- [`icon-button.iconButton`](./icon-button.ts.mdmd.md#symbol-iconbutton)
- [`types.FrameChoice`](../types.ts.mdmd.md#symbol-framechoice) (type-only)
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
- [`template.filter-toggle-tests`](../../shared/template.html.mdmd.md#symbol-filter-toggle-tests)
- [`template.history-back`](../../shared/template.html.mdmd.md#symbol-history-back)
- [`template.history-forward`](../../shared/template.html.mdmd.md#symbol-history-forward)
- [`template.main`](../../shared/template.html.mdmd.md#symbol-main)
- [`template.map-legend`](../../shared/template.html.mdmd.md#symbol-map-legend)
- [`template.sidebar`](../../shared/template.html.mdmd.md#symbol-sidebar)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
