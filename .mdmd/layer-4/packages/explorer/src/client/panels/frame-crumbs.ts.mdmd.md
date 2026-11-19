# packages/explorer/src/client/panels/frame-crumbs.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/frame-crumbs.ts
- Generated At: 2026-11-19T04:34:52.695Z

## Authored
### Purpose
The crumbs of the Bare frame's breadcrumb, read from the page's state: the scales from the outside in (the World Map when the bundle carries a board, the scan root, each directory down to the subject, the subject file), exactly one of them, the last, the place shown; and the crumb a narrow window's back chevron goes out to.

### Notes
- Written on 2026-11-19 for the Bare frame's trial ([Turn 34 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-34)), pure so that the crumbs can be tested without a page.
- Kept by `frame-crumbs.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CrumbSubject` {#symbol-crumbsubject}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/frame-crumbs.ts#L16)

##### `CrumbSubject` — Summary
What the Local Map is about: a file or a directory, by its path from the scan root ("" is the root).

#### `Crumb` {#symbol-crumb}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/frame-crumbs.ts#L19)

##### `Crumb` — Summary
One crumb: a view, the scan root or a directory, or the subject file.

#### `CrumbInput` {#symbol-crumbinput}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/frame-crumbs.ts#L25)

##### `CrumbInput` — Summary
What the crumbs are read from: the view shown, whether there is a World Map to go out to, and the Local Map's subject.

#### `crumbsOf` {#symbol-crumbsof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/frame-crumbs.ts#L32)
- Returns: [`Crumb`](#symbol-crumb)[]
- Parameters: `_unnamed_`: [`CrumbInput`](#symbol-crumbinput)

##### `crumbsOf` — Summary
The crumbs, outermost first; the last is always the place shown.

#### `outwardCrumb` {#symbol-outwardcrumb}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/frame-crumbs.ts#L49)
- Returns: [`Crumb`](#symbol-crumb)

##### `outwardCrumb` — Summary
The crumb a narrow window's back chevron goes out to: the one before the place shown, or none at the outermost.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
