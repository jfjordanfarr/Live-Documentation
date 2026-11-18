# tests/e2e/scenarios/judgments.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/scenarios/judgments.ts
- Generated At: 2026-11-18T19:17:17.188Z

## Authored
### Purpose
The still picture's promises as pure functions over readings, each reporting every place it is broken, so that one scenario lists every promise it broke.

### Notes
Ranked as [the frame they accepted](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#roots-reply-to-turn-11-as-delivered) asks, each pushed as high as it goes: a floor, so that laws cannot pass on an empty page; laws that need nothing but the reading; relations between two readings of one run (a reload, three presses out against reading size, the picture against the data it was drawn from); and an oracle fact against the compiler's edges for the Rosetta programs.

The one baseline is the list of compiler edges the docs are known to lack at a scenario's subject (`KnownGap`), written by name in the table with a reason and a date. An excused edge keeps the oracle's cell green and is reported on a verdict line of its own, of rank baseline ("the compiler's edges the docs are known to lack at this file: 1"), so that a cell green by exception never reads as agreement with the compiler. The list is frozen on purpose: for one day it was computed from the docs' own comparison with the compiler, which excused whatever the docs lacked, so that a lost edge could never turn a cell red; the root corrected it on 2026-11-18. An edge the list does not name stays broken, and an entry the picture now draws, or that the compiler no longer has, is broken as stale.

Two laws were corrected after their first run on 2026-11-18, and each says what the screenshot showed. The law that no name breaks inside a word waits in `PENDING_LAWS` until a known open defect is mended ([the root's rulings on the scenario builder's first handback](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-scenario-builders-first-handback)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Rank` {#symbol-rank}
- Type: type
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L25)

#### `Verdict` {#symbol-verdict}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L27)

#### `Floor` {#symbol-floor}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L54)

##### `Floor` — Summary
What a scenario must at least show before its laws mean anything.

#### `judgeFloor` {#symbol-judgefloor}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L69)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading); `floor`: [`Floor`](#symbol-floor)

#### `textWhole` {#symbol-textwhole}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L92)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `textWhole` — Summary
No name or line collides with another, and at reading size none is cut off. Farther out the map holds names to their
room and cuts them at their end by design (the card ladder's looks): the screenshot three presses out (2026-11-18)
showed "Intern…" and "Inter…" ended by an ellipsis on the TypeScript program's cards, which this law first reported
as cut. There only collisions are judged here.

#### `cardsInsideDirectories` {#symbol-cardsinsidedirectories}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L101)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `cardsInsideDirectories` — Summary
Every card stands inside its own directory's outline, clear of its edge by the outline's padding.

#### `directoriesConnected` {#symbol-directoriesconnected}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L120)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `directoriesConnected` — Summary
Each directory is one connected shape: its segments run column after column, each meeting the next.

#### `siblingsApart` {#symbol-siblingsapart}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L136)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `siblingsApart` — Summary
Two directories of one parent never overlap in a column they share.

#### `EDGE_TOLERANCE_PX` {#symbol-edge_tolerance_px}
- Type: const
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L154)

##### `EDGE_TOLERANCE_PX` — Summary
How far from a card's edge an end or a dot may stand and still be on that edge, in screen pixels.

#### `usesLeftOfferingsRight` {#symbol-usesleftofferingsright}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L174)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `usesLeftOfferingsRight` — Summary
Uses enter on the left and offerings leave on the right: every route leaves its provider's card from the card's
right half and reaches its consumer's card in its left half, and every dot stands in the half its side names. First
written as "at the card's edge", it failed on every Rosetta map; the screenshot of the TypeScript processor in focus
(2026-11-18) showed why: each dot stands at the end of its row, inside the card's padding, some 21 px in from the
edge at scale 1, and the wires end on the dots. The promise is the side, not the edge.

#### `routesForward` {#symbol-routesforward}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L197)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `routesForward` — Summary
Every route reads forward, from what offers on the left to what uses on the right; a cycle's feedback is a stub.

#### `noRouteAcrossACard` {#symbol-norouteacrossacard}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L204)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `noRouteAcrossACard` — Summary
No route passes over a card it does not end at.

#### `lanesAtHome` {#symbol-lanesathome}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L211)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `lanesAtHome` — Summary
No lane lies in a directory that holds neither end of the wires through it.

#### `nothingOverTheTop` {#symbol-nothingoverthetop}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L217)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `nothingOverTheTop` — Summary
Nothing is drawn over the top of the picture: no route rises above the highest card or lane.

#### `framedWhole` {#symbol-framedwhole}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L234)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `framedWhole` — Summary
A picture with no subject is framed whole, on each axis: centred when it overflows the frame by no more than two
paddings, otherwise its near edge at the padding, like a page. The rule and its paddings are the map's own (the
owner's choices of 2026-10-30, `frameWhole` in the layout measure).

#### `edgeSignsHonest` {#symbol-edgesignshonest}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L255)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `edgeSignsHonest` — Summary
The signs at the frame's edges are honest: a sign stands at exactly the edges the picture continues past.

#### `subjectInFrame` {#symbol-subjectinframe}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L273)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `subjectInFrame` — Summary
The subject's card stands whole inside the frame.

#### `wiresPlainAtRest` {#symbol-wiresplainatrest}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L282)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `wiresPlainAtRest` — Summary
At rest no wire glows, and every route is drawn at one strength: the map fades the irrelevant and boosts nothing.

#### `SMALL_TEXT_CONTRAST` {#symbol-small_text_contrast}
- Type: const
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L290)

##### `SMALL_TEXT_CONTRAST` — Summary
WCAG's least contrast for small text, which every name and line on a card meets.

#### `NAME_LEADS_PROSE` {#symbol-name_leads_prose}
- Type: const
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L292)

##### `NAME_LEADS_PROSE` — Summary
How much more contrast a symbol's name has than the prose that describes it: names lead (2026-11-15).

#### `OUTLINE_SEEN` {#symbol-outline_seen}
- Type: const
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L294)

##### `OUTLINE_SEEN` — Summary
The least contrast at which an outline is seen against the map's surface.

#### `textTones` {#symbol-texttones}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L300)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `textTones` — Summary
A card's text stands in three tones, each legible: the file's name leads or equals a symbol's name, and a symbol's
name leads the prose that describes it.

#### `outlineIsGround` {#symbol-outlineisground}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L314)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `outlineIsGround` — Summary
An opened directory's outline is seen, is no stronger than a card's border, and is no filled box.

#### `outlinesDrawn` {#symbol-outlinesdrawn}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L325)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `outlinesDrawn` — Summary
Every directory but the root draws an outline, and the root draws none.

#### `rootColumnsAligned` {#symbol-rootcolumnsaligned}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L333)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `rootColumnsAligned` — Summary
A picture with no subject stands its root's independent columns at one top, so they read as a row of choices.

#### `proseOneTone` {#symbol-proseonetone}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L343)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `proseOneTone` — Summary
A symbol's description and the file's Purpose are prose of one tone.

#### `namesBreakAtSeams` {#symbol-namesbreakatseams}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L367)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `namesBreakAtSeams` — Summary
No name breaks inside a word: where a name is drawn on more than one line, every line begins at a seam. Ready, and
kept out of the table's laws until the open defect it would report (a symbol's name broken as "Process / orConfig" at
the connections look, seen 2026-11-18) is mended.

#### `pageHealthy` {#symbol-pagehealthy}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L380)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `pageHealthy` — Summary
The page logged no error and asked nothing of another site.

#### `LAWS` {#symbol-laws}
- Type: const
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L388)
- Returns: `ReadonlyArray`, [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `LAWS` — Summary
Every law, in the order a report lists them.

#### `PENDING_LAWS` {#symbol-pending_laws}
- Type: const
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L411)
- Returns: `ReadonlyArray`, [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `PENDING_LAWS` — Summary
Laws written and tested but kept out of the table until the defect each would report is mended.

#### `samePicture` {#symbol-samepicture}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L416)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `before`: [`Reading`](./reading.ts.mdmd.md#symbol-reading); `after`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `samePicture` — Summary
Two readings of one scenario agree within a pixel: the same cards in the same places, the same wires, the same signs.

#### `tonesHeld` {#symbol-tonesheld}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L453)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `near`: [`Reading`](./reading.ts.mdmd.md#symbol-reading); `far`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `tonesHeld` — Summary
Names held farther out keep the tones they have at reading size: the subject's file name and a symbol's name are
drawn in the same colours in both readings of one run.

#### `OracleEdge` {#symbol-oracleedge}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L464)

##### `OracleEdge` — Summary
One reference an independent oracle knows, file to file: the consumer uses the provider.

#### `CompilerRecord` {#symbol-compilerrecord}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L470)

##### `CompilerRecord` — Summary
What the compiler says of a program.

#### `KnownGap` {#symbol-knowngap}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L482)
- Extends: [`OracleEdge`](#symbol-oracleedge)

##### `KnownGap` — Summary
A compiler edge the docs are known to lack, written by name beside the scenario with its reason and date: a
recorded exception, the frame's lowest rank, a baseline. It is frozen on purpose. An excuse computed at run time from
the docs' own comparison with the compiler would excuse whatever the docs lack, so that a lost edge could never turn
the cell red (the root's correction of 2026-11-18).

#### `wiresMatchOracle` {#symbol-wiresmatchoracle}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L498)
- Returns: [`Verdict`](#symbol-verdict)[]
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading); `oracle`: [`CompilerRecord`](#symbol-compilerrecord)

##### `wiresMatchOracle` — Summary
The files wired to the subject are exactly the files the compiler says it uses or is used by: every compiler edge
with one end at the subject is drawn as a route or a stub, and no wire at the subject joins a pair the compiler
denies. Judged file to file, since a compiler names symbols in its own scheme.

Returns the oracle's verdict and, when the scenario lists known gaps for this map, a second verdict of rank
baseline that names each gap it excused, so that a green oracle cell says whether it agrees with the compiler or is
green by a recorded exception. That baseline is itself broken by a stale entry: a listed gap the picture now draws, or
an edge the compiler no longer has, so that the list cannot outlive its reason. A missing edge the list does not name
stays broken in the oracle's verdict.

#### `wiresMatchData` {#symbol-wiresmatchdata}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/judgments.ts#L524)
- Returns: [`Verdict`](#symbol-verdict)
- Parameters: `reading`: [`Reading`](./reading.ts.mdmd.md#symbol-reading)

##### `wiresMatchData` — Summary
The same comparison against the references the bundle itself carries, the data the picture was drawn from: a
relation between the picture and its data, not an oracle, since a defect that reached the data would pass it. It
catches a drawing that drops or invents a wire.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layout-measure.framePadding`](../../../packages/explorer/src/client/views/localView/layout-measure.ts.mdmd.md#symbol-framepadding)
- [`reading.Box`](./reading.ts.mdmd.md#symbol-box) (type-only)
- [`reading.CardRead`](./reading.ts.mdmd.md#symbol-cardread) (type-only)
- [`Reading`](./reading.ts.mdmd.md#symbol-reading) (type-only)
- [`reading.WireRead`](./reading.ts.mdmd.md#symbol-wireread) (type-only)
- [`still-picture-geometry.flowOf`](../still-picture-geometry.ts.mdmd.md#symbol-flowof)
<!-- LIVE-DOC:END Dependencies -->
