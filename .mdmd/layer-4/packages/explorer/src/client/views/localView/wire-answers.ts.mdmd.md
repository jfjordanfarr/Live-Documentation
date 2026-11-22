# `packages/explorer/src/client/views/localView/wire-answers.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/wire-answers.ts`
- Generated At: 2026-11-22T07:12:56.343Z

## Authored
### Purpose
The page side of Tuning → 2D Wires → Wire Answers, a trial: a 2D wire's band takes a rested pointer, a press and the keyboard's focus; the wire is kept and the rest faded by [`symbol-highlight.ts`](symbol-highlight.ts.mdmd.md)'s `lightConnections`, as a returning lace's are; and its words ([`wire-words.ts`](wire-words.ts.mdmd.md)) stand beside it in the World Map wire panel's form, a peek on a rest and pinned by a press. [`connections.ts`](connections.ts.mdmd.md) draws the bands and gives each its answer; [`controller.ts`](controller.ts.mdmd.md) makes one per map, moves the words with the camera and keeps a band twelve of the screen's pixels wide.

### Notes
- Made on November 21, 2026, from the root's brief ([the probe](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/line-direction/README.md)), within the owner's words: "text expansion does not occur on hover but instead on tap/click" (2026-11-05) and "words are only warranted on a modestly long hover" (2026-11-19). So a pointer that passes over draws nothing; the rest is the product's one rule of hover intent ([`pointerRest.ts`](../pointerRest.ts.mdmd.md)), not a second.
- A drag begun on a wire still pans the map: the band takes the pointer only to be found, a press on it gives it no focus (its `mousedown` is cancelled), and a press counts only if it travelled no more than the 2D map's slop of 6 px. Escape and a press elsewhere let go of a pin; a pin's light is put back once another hover has ended (`relight`, from the controller's `clearSymbolHighlight`).
- The panel's side is the World Map's rule for a panel beside its subject (`panelBeside`), the wire's own two cards counted four times, chosen once and kept while the picture moves. The first pictures stood it below and right of the pointer, where it hid the very card it named.
- The keyboard: no wire is a stop of Tab (`tabindex="-1"`); from a focused card the arrows walk its wires, right to what uses it and left to what it uses, up and down along that side, on to the far card, Enter to pin, Escape back. A bundle's run is not a stop; its wires are. The pictures are [the line-direction evidence](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Screenshots/line-direction/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WireAnswer` {#symbol-wireanswer}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-answers.ts#L32)

##### `WireAnswer` — Summary
What a wire's band answers with: its words, and the references it carries, which a rest or a press keeps lit.

#### `WIRE_LIT` {#symbol-wire_lit}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-answers.ts#L38)

##### `WIRE_LIT` — Summary
The class that marks a highlight as the wire answers' own; the highlight's clearing takes it off (symbol-highlight.ts).

#### `setAnswer` {#symbol-setanswer}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-answers.ts#L46)
- Parameters: `band`: `SVGElement`; `answer`: [`WireAnswer`](#symbol-wireanswer)

##### `setAnswer` — Summary
Gives a wire's band its answer, and its spoken name the same sentence, written only when it changes.

#### `answerOf` {#symbol-answerof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-answers.ts#L53)
- Returns: [`WireAnswer`](#symbol-wireanswer)

##### `answerOf` — Summary
The answer a band carries; undefined for anything else.

#### `WireAnswersHost` {#symbol-wireanswershost}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-answers.ts#L64)

##### `WireAnswersHost` — Summary
What the wire answers need of the 2D map: its view and layers, the camera's scale, and whether they are on.

#### `WireAnswers` {#symbol-wireanswers}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-answers.ts#L77)

##### `WireAnswers` — Summary
The wires' answers on one 2D map: the panel, and the pointer, the press and the keyboard that ask for it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`icon-button.CLOSE_ICON`](../../panels/icon-button.ts.mdmd.md#symbol-close_icon)
- [`icon-button.iconButton`](../../panels/icon-button.ts.mdmd.md#symbol-iconbutton)
- [`symbol-highlight.clearSymbolHighlightDOM`](./symbol-highlight.ts.mdmd.md#symbol-clearsymbolhighlightdom)
- [`symbol-highlight.lightConnections`](./symbol-highlight.ts.mdmd.md#symbol-lightconnections)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`wire-words.WireWords`](./wire-words.ts.mdmd.md#symbol-wirewords-interface) (type-only)
- [`wire-words.headText`](./wire-words.ts.mdmd.md#symbol-headtext)
- [`wire-words.listText`](./wire-words.ts.mdmd.md#symbol-listtext)
- [`wire-words.referencesText`](./wire-words.ts.mdmd.md#symbol-referencestext)
- [`wire-words.sentence`](./wire-words.ts.mdmd.md#symbol-sentence)
- [`pointerRest.NO_REST`](../pointerRest.ts.mdmd.md#symbol-no_rest)
- [`PointerRest`](../pointerRest.ts.mdmd.md#symbol-pointerrest) (type-only)
- [`pointerRest.restAt`](../pointerRest.ts.mdmd.md#symbol-restat)
- [`pointerRest.restedOn`](../pointerRest.ts.mdmd.md#symbol-restedon)
- [`pointerRest.restsAt`](../pointerRest.ts.mdmd.md#symbol-restsat)
- [`layout.Avoid`](../worldMap/layout.ts.mdmd.md#symbol-avoid) (type-only)
- [`layout.panelBeside`](../worldMap/layout.ts.mdmd.md#symbol-panelbeside)
<!-- LIVE-DOC:END Dependencies -->
