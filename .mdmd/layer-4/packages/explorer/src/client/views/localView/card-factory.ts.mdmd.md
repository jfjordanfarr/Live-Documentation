# packages/explorer/src/client/views/localView/card-factory.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/card-factory.ts
- Generated At: 2026-11-09T04:43:26.883Z

## Authored
### Purpose
Builds the Local Map's file cards, symbol rows and closed-directory boxes, with connection anchors and separate accessible controls for inspection, retention and navigation.

### Notes

Current reading-refresh boundary, November 9 UTC: `hasCloseAction` holds the existing subject/retention/local-expansion predicate in one place for both construction and the in-place reading guard. A reading choice that changes those controls still requires a structural render; otherwise fixed-slot presentation may retain the native DOM. In the fixed-slot composition, names open the evidence reader and books control the descriptions shown on the card; growing-card names still share their books' reading choice. The November 5 description below records the earlier interaction change.

Extracted from the former `render.ts` in [December 19, Turn 04](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-19.2.SUMMARIZED.md#turn-04), separating card construction from scene layout. The factory receives presentation values, anchor registration and named actions through `CardContext`. Cards are rebuilt inside retained wrappers on each render; their pressed and subject appearance describes that render, while actions reach the application's current state through the controller.

A file's name and a symbol's label read what they name since [November 5](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-1): the tap opens or folds the description through the card context's `readNode`, and the evidence reader is behind More. The Internals endpoint, which has no description, still inspects, and the card's body has no action of its own; from October 20 to November 5 bodies and names inspected. Adjacent Pin controls change retention in one activation, with `aria-pressed` describing the explicit pin rather than merely its presence under a whole-file pin. A resolved type badge inspects the referenced file without pinning its source row. Nested controls stop the body action. The owner selected this separation in [October 19, Turn 24](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24), preserving fast connection-following as the acceptance journey; [October 20, Turn 2](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2) resumes its implementation.

The direct symbol Pin preserves the [October 15 retention rule](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15): narrow a whole-file pin, add another symbol, release a symbol, and return to a whole-file pin when its last symbol is released. The file's Pin, pressed again, releases only that file's pins and keeps the subject, so a Pin undoes itself; the X is the card's close, which releases the file under the subject policy and also closes a local reveal, with interfaces required by other pins remaining visible. Centre makes a different file the subject while keeping independent pins. Its visible control originated after the [October 14 double-click investigation](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-14/pin-clicks/README.md) showed the first clicks could alter the picture before navigation.

More controls identify file, symbol and directory targets for the shared application menu. The controller supplies right-click, hold and keyboard context gestures and suppresses activation after dragging; the factory owns the native Inspect, Pin and More buttons and their accessible names. A hold is an alternative way to reveal commands, never a prerequisite for pinning.

Symbol order is the Live Doc's appearance order, alphabetical when chosen in Tuning, or the branch renderer's subsequent layout order. Public symbol rows register both interface sides; Internals registers the private-implementation input and file-level fallback, while assets use file hubs instead. These anchors remain available independently of the controls drawn beside their labels.

`createClosedDirectory` represents a closed directory as a named, counted box without symbol pins, following the [directory disclosure design](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08). Its body and name inspect; its separate Open button discloses files and subdirectories. A directory containing a file that participates in a drawn connection is at least encasing, so no wire reaches a closed box. `countsOf` also supplies the count of contents hidden by an encasing membrane.

November 4 reading is attached through the card context after the native card is built. Canonical documentation and explicit reading choices remain owned by the separate reading surface; the factory keeps its pin actions and, since November 5, hands name taps to the reading surface; names carry aria-expanded for what is shown. See the [integration record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

Since [Turn 12](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) a file's name and a symbol's name carry their text in a span of their own (`local-file-name-text`, `symbol-label-text`): the card ladder scales the text, never the button, whose box fills its row and, scaled, covered the row's Pin so that a zoomed pin transition could not click it.

Since the far bands' round (2026-11-06, [Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3)) the file's name button also holds an empty, `aria-hidden` element, `local-file-name-held`, carrying the name: from the middle band out the card ladder draws the name from it, held at its reading size, in the lines the card reading chooses for each band and step in the room the header's departed lines leave. The text in the layout stays, not drawn, so that it keeps the header's height in every band and remains the name's one copy for the page's text and the perspective transition's reading of `textContent`; the button's label names the file for assistive technology. From the middle band out the page's find does not meet the name: that copy is hidden there, and the drawing is generated content, which find does not search.

Since the far bands' second milestone (2026-11-06) every card that is not an asset has a node-level hub on its using side too, at its left edge at the existing hub's height, where the overview band's gathered wires arrive; both node-level hubs are registered under `#hub` (`inbound:#hub`, `outbound:#hub`), so that the overview finds them while a file-level reference at the closer bands still arrives at Internals' dot (`inbound:*`). The using side's hub carries the class `overview-hub` since the root's fourth review (2026-11-07): the layout lab's capture had read it, as it reads every hub, as the card's `inbound:*` pin, and found 93 pins drifted on the repository's five files where the page's placement had not moved.

Since 2026-11-08 (the header round, [November 7 record, Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-07.1.record.md#turn-3) and [Turn 4](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-07.1.record.md#turn-4--november-8)) the node's controls stand in the card's header after the file's name, in its focus order, rather than in the card's top right corner beside a header padded to keep them clear: the name leads on the header's first line at its full width and the controls follow it at the right edge. The name's button ends with an empty, aria-hidden room as wide and as tall as the controls (`local-file-name-room`, sized in `local.css` by the header's own count of them), its last inline box, which shares the name's last line where it fits and wraps to a line of its own where it does not; the controls stand at the header's bottom right, which is that room's line. From the middle band out the card reading places them instead, for each band and step.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CardPresentation` {#symbol-cardpresentation}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L20)

##### `CardPresentation` — Summary
The values a fresh card reads while it is built. The wrapper may survive a render, but its card is rebuilt.

#### `hasCloseAction` {#symbol-hascloseaction}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L34)

##### `hasCloseAction` — Summary
A card can close its own retention, subject or locally expanded symbol list.

#### `CardContext` {#symbol-cardcontext}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L39)

##### `CardContext` — Summary
Only the facts and actions a card needs; navigation targets are looked up when their event occurs.

#### `NODE_HUB` {#symbol-node_hub}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L65)

##### `NODE_HUB` — Summary
The registry's name for a card's node-level hubs, `inbound:#hub` and `outbound:#hub`, by which the overview band's
gathered wires find them (2026-11-06); no symbol is named so.

#### `createNodeCard` {#symbol-createnodecard}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L80)
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
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L284)
- Parameters: `context`: [`CardContext`](#symbol-cardcontext); `closed`: [`ClosedDirectory`](./branches.ts.mdmd.md#symbol-closeddirectory)

##### `createClosedDirectory` — Summary
A closed directory's box: a pseudo-node with no symbols in the membrane's
style, named and counted, that can be inspected or explicitly opened.
It carries no pin: a directory with a party file
under it is at least encasing, so no wire ever reaches a closed box.

#### `countsOf` {#symbol-countsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L319)

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
