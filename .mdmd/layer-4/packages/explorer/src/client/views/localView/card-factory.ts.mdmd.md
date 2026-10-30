# packages/explorer/src/client/views/localView/card-factory.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/card-factory.ts
- Generated At: 2026-10-30T19:08:33.254Z

## Authored
### Purpose
Builds the Local Map's file cards, symbol rows and closed-directory boxes, with connection anchors and separate accessible controls for inspection, retention and navigation.

### Notes

Extracted from the former `render.ts` in [December 19, Turn 04](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-19.2.SUMMARIZED.md#turn-04), separating card construction from scene layout. The factory receives presentation values, anchor registration and named actions through `CardContext`. Cards are rebuilt inside retained wrappers on each render; their pressed and subject appearance describes that render, while actions reach the application's current state through the controller.

File bodies and native name buttons inspect the file; a symbol's label inspects that symbol, including the Internals endpoint. Adjacent Pin controls change retention in one activation, with `aria-pressed` describing the explicit pin rather than merely its presence under a whole-file pin. A resolved type badge inspects the referenced file without pinning its source row. Nested controls stop the body action. The owner selected this separation in [October 19, Turn 24](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24), preserving fast connection-following as the acceptance journey; [October 20, Turn 2](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2) resumes its implementation.

The direct symbol Pin preserves the [October 15 retention rule](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15): narrow a whole-file pin, add another symbol, release a symbol, and return to a whole-file pin when its last symbol is released. The file's Pin, pressed again, releases only that file's pins and keeps the subject, so a Pin undoes itself; the X is the card's close, which releases the file under the subject policy and also closes a local reveal, with interfaces required by other pins remaining visible. Centre makes a different file the subject while keeping independent pins. Its visible control originated after the [October 14 double-click investigation](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-14/pin-clicks/README.md) showed the first clicks could alter the picture before navigation.

More controls identify file, symbol and directory targets for the shared application menu. The controller supplies right-click, hold and keyboard context gestures and suppresses activation after dragging; the factory owns the native Inspect, Pin and More buttons and their accessible names. A hold is an alternative way to reveal commands, never a prerequisite for pinning.

Symbol order is the Live Doc's appearance order, alphabetical when chosen in Tuning, or the branch renderer's subsequent layout order. Public symbol rows register both interface sides; Internals registers the private-implementation input and file-level fallback, while assets use file hubs instead. These anchors remain available independently of the controls drawn beside their labels.

`createClosedDirectory` represents a closed directory as a named, counted box without symbol pins, following the [directory disclosure design](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08). Its body and name inspect; its separate Open button discloses files and subdirectories. A directory containing a file that participates in a drawn connection is at least encasing, so no wire reaches a closed box. `countsOf` also supplies the count of contents hidden by an encasing membrane.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CardPresentation` {#symbol-cardpresentation}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L20)

##### `CardPresentation` — Summary
The values a fresh card reads while it is built. The wrapper may survive a render, but its card is rebuilt.

#### `CardContext` {#symbol-cardcontext}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L34)

##### `CardContext` — Summary
Only the facts and actions a card needs; navigation targets are looked up when their event occurs.

#### `createNodeCard` {#symbol-createnodecard}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L65)
- Parameters: `context`: [`CardContext`](#symbol-cardcontext); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `columnRole`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

##### `createNodeCard` — Summary
Creates a node card element for the Local Map view.

##### `createNodeCard` — Parameters
- `columnRole`: The role of the column this card belongs to
- `context`: The card's presentation inputs and live actions
- `node`: The node data to render

##### `createNodeCard` — Returns
The created card element

#### `createClosedDirectory` {#symbol-createcloseddirectory}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L234)
- Parameters: `context`: [`CardContext`](#symbol-cardcontext); `closed`: [`ClosedDirectory`](./branches.ts.mdmd.md#symbol-closeddirectory)

##### `createClosedDirectory` — Summary
A closed directory's box: a pseudo-node with no symbols in the membrane's
style, named and counted, that can be inspected or explicitly opened.
It carries no pin: a directory with a party file
under it is at least encasing, so no wire ever reaches a closed box.

#### `countsOf` {#symbol-countsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L269)

##### `countsOf` — Summary
"3 files, 2 directories", either part left out at zero; "empty" when both are.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.setSeamedText`](../../dom.ts.mdmd.md#symbol-setseamedtext)
- [`types.SymbolOrder`](../../types.ts.mdmd.md#symbol-symbolorder) (type-only)
- [`branches.ClosedDirectory`](./branches.ts.mdmd.md#symbol-closeddirectory)
- [`branches.compareSymbolNames`](./branches.ts.mdmd.md#symbol-comparesymbolnames)
- [`directory-bands.parentDirectory`](./directory-bands.ts.mdmd.md#symbol-parentdirectory)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`word-seams.countOf`](./word-seams.ts.mdmd.md#symbol-countof)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](../../../shared/types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
- [`types.ExplorerTypeReference`](../../../shared/types.ts.mdmd.md#symbol-explorertypereference) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
