# packages/explorer/src/client/views/forceGraphEmphasis.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphEmphasis.ts
- Generated At: 2026-11-11T05:50:56.278Z

## Authored
### Purpose
Give the displayed commit a stable visual event: changed nodes become white immediately, while the rest keep their normal colour or an optionally dimmed background. The next commit replaces the changed set; playback time does not alter brightness. Since 2026-11-11 the same event reaches inside the wrappers: each change is shown at the innermost thing the picture draws for it.

### Notes
Created for the [October 31 change-emphasis request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-8), then corrected after the owner's [November 1 live playback observation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/Summarized/2026-11-01.1.SUMMARIZED.md#turn-3): the old fade reduced darkening over an interval, making unaffected nodes steadily brighten before the next commit reset them. The owner's metaphor is a network of occasionally firing fireflies, with sharp local events against a steady field.

Glow uses white for the whole displayed commit. Dim leaves unaffected nodes and wires at a fifth of their base alpha; Both combines the two; None keeps ordinary appearance. A changed wire can rise to .85 alpha. There is no clock or play-state input. Pair keys are undirected so both endpoints name the same counted wire.

Since 2026-11-11 ([Turn 6 of the November 10 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-6), the owner's "I don't see any of the nodes deep inside the bubbles lighting up when they were affected by a commit") the step reaches what a wrapper's skin shows within it, in both layouts, by one rule: a change is shown at the innermost thing the picture draws for it. `bodyChanges` reads one body: a changed file drawn as a dot is that dot; a changed file not drawn, inside a veiled bubble or a veiled body, is that bubble; a file the step deleted, which has no dot, is the innermost drawn bubble of the directory it stood in; and a change no bubble drawn holds, or one a cloud look hides, is the skin itself. Every bubble around a change holds it. A wrapped group's seed is a sphere of its own and never a unit, so its change lights nothing within the skin though the body holds it, and a file the body does not hold (a pinned file standing apart) lights nothing in it, since membership is read from the body's own files. `deletionHomes` gives each deleted file to the body of the deepest directory the picture draws something for, none when that is a hub drawn as a sphere, which lights by its own emphasis. `emphasizedUnits` colours a dot by `emphasizedSphere` at full strength, so that a dot and a sphere cannot drift apart: white and whole under Glow, at a fifth of its alpha when unchanged under Dim. A bubble is lit only under Glow and only as the innermost thing drawn for a change; an open bubble whose changes are lit dots is not lit, since the dots say where. Under Dim a bubble or a skin holding no change dims with the unchanged dots and one holding a change keeps its alpha (`emphasizedSkin`); nothing is enlarged. The work is bounded by the units drawn and the step's changes, never by the files a veiled body holds. [The evidence](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-10/history-bubbles/README.md) shows this repository at steps 695 and 697 before and after, and a temporary sample large enough to veil.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `glows` {#symbol-glows}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L30)

##### `glows` — Summary
Whether the mode glows the changed.

#### `dims` {#symbol-dims}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L32)

##### `dims` — Summary
Whether the mode dims the unchanged.

#### `emphasizedSphere` {#symbol-emphasizedsphere}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L45)
- Parameters: `mode`: [`ChangeEmphasis`](../types.ts.mdmd.md#symbol-changeemphasis)

##### `emphasizedSphere` — Summary
A sphere's colour for the displayed commit: changed spheres white and whole where the mode glows; unchanged ones
dimmed where the mode dims. The result remains constant until the changed set, mode or deliberate attention changes.

#### `emphasizedWireAlpha` {#symbol-emphasizedwirealpha}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L53)
- Parameters: `mode`: [`ChangeEmphasis`](../types.ts.mdmd.md#symbol-changeemphasis)

##### `emphasizedWireAlpha` — Summary
A white reference wire's alpha under the emphasis: a changed wire's raised toward the glow, an unchanged one's reduced, where the mode says so.

#### `pairKey` {#symbol-pairkey}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L60)

##### `pairKey` — Summary
The key of an undirected pair of files, the same whichever end is named first.

#### `ShownUnit` {#symbol-shownunit}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L67)

##### `ShownUnit` — Summary
A unit a body's skin shows within it, as the emphasis reads it: a file's dot or an inner bubble, by its id (a file's
path, a bubble's directory), the bubble it stands in, and, at depth -1, the one veiled bubble that fills a body none of
whose files are drawn (`veiledUnits`).

#### `BodyChanges (interface)` {#symbol-bodychanges-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L75)

##### `BodyChanges (interface)` — Summary
Where a body shows the step of the history displayed.

#### `bodyChanges (function)` {#symbol-bodychanges-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L97)
- Returns: [`BodyChanges`](#symbol-bodychanges-interface)
- Parameters: `members`: `ReadonlySet`; `changed`: `Iterable`; `deleted`: `Iterable`

##### `bodyChanges (function)` — Summary
Where a body shows the step: at the innermost thing the picture draws for each change. A changed file drawn as a dot
is that dot; one not drawn, inside a veiled bubble or a veiled body, is that bubble; a file the step deleted, gone from
the picture, is the innermost drawn bubble of the directory it stood in; and a change no bubble drawn holds, or that a
look drawing nothing within the skin hides, is the skin. Every bubble around a change holds it. `units` are what the
skin draws within it (none under a look that veils them); `members` the files the body holds, by path; `seed` the
body's own node, which for a wrapped group is a file drawn as a sphere of its own and never a unit, so that its change
lights nothing within the skin, though the body holds it; `changed` the
step's changed files; `deleted` the step's deleted files that the picture gives this body (`deletionHomes`). The work
is bounded by the units and the changes, never by the files a veiled body holds.

#### `deletionHomes` {#symbol-deletionhomes}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L142)
- Parameters: `deleted`: `Iterable`; `homes`: `ReadonlyMap`

##### `deletionHomes` — Summary
The body each of a step's deleted files is shown in: the body drawn for the deepest directory, among those the picture
draws something for, that holds the file's directory. `homes` maps each such directory to its body's id, or to null
where the picture draws it as a hub's sphere, which lights by its own emphasis, so that no body outside it claims the
file. A file no directory drawn holds is shown in none. By body, each body's files in the order given.

#### `emphasizedUnits` {#symbol-emphasizedunits}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L162)
- Returns: `U`[]
- Parameters: `changes`: [`BodyChanges`](#symbol-bodychanges-interface); `mode`: [`ChangeEmphasis`](../types.ts.mdmd.md#symbol-changeemphasis)
- Constraints: [`ShownUnit`](#symbol-shownunit)

##### `emphasizedUnits` — Summary
A body's units as the step colours them: a file's dot as `emphasizedSphere` colours a sphere at full strength, from
its kind's `#rrggbb` colour; a bubble lit where the mode glows and it is lit, and, where the mode dims, at the dimmed
share of its alpha unless it holds a change. Nothing is enlarged: the irrelevant fades rather than the relevant grows.

#### `emphasizedSkin` {#symbol-emphasizedskin}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L169)
- Parameters: `changes`: [`BodyChanges`](#symbol-bodychanges-interface); `mode`: [`ChangeEmphasis`](../types.ts.mdmd.md#symbol-changeemphasis)

##### `emphasizedSkin` — Summary
How a body's own skin carries the step: lit where the mode glows and the skin shows a change; dimmed where the mode dims and it holds none.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ChangeEmphasis`](../types.ts.mdmd.md#symbol-changeemphasis) (type-only)
- [`directory-bands.parentDirectory`](./localView/directory-bands.ts.mdmd.md#symbol-parentdirectory)
<!-- LIVE-DOC:END Dependencies -->
