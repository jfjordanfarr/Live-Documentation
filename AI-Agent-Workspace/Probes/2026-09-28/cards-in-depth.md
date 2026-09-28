# Probe A: cards in depth. Findings, 2026-09-28

_The builder's findings for probe A, verbatim. Screenshot numbers refer to the builder's `shots/` folder; the three kept here are `shots/cards-01-connection-geometry-front.png` (01), `shots/cards-10-connection-geometry-orbit-60.png` (10) and `shots/cards-03-core-hub-front.png` (03)._

Sides follow the Local Map: dependencies left, consumers right, every wire from a blue pin on a right wall to a green pin on a left wall. The brief's reversed sentence was later corrected; nothing was flipped. Counts are the index's: `core.ts` has 26 inbound files (`adapters/index.ts` is on both sides), `connection-geometry.ts` 27 self edges.

## What was built and how to drive it

`node build.cjs` inlines `.mdmd/index.json` into `index.html`; `NODE_PATH=… node shoot.cjs [filter]` takes the shots. World units are the Local Map's pixels: card 300 wide, row 22, pin radius 6, pin centre exactly on the wall. A card is a 3-unit slab with a 3x canvas texture; a wire is a tube of radius 1.25 along the 2D cubic Bezier (`computeStubLength`, the 15 % offset also in z), blue to green with 10 % solid ends. Only the focus's neighbourhood exists in the scene.

`window.probe`: `focus(path)`, `enter(path)`, `orbit(yaw, pitch)`, `reset()`, `hover(path, slug | "internals")`, `level(0|1|2)`. Click focuses, drag orbits, hover fades: unrelated cards swap to a texture whose rows are smudges and whose name stays middling; unrelated wires drop to 16 %.

One side's layout: neighbours sorted by wire count, heaviest at the focus's height, alternating above and below, card k at z = -k·r·Zc with r the smallest recession that fits the column (r = 0 is the flat Local Map column); world x is divided by the same factor so the landing wall stays aligned in projection. Level 1, the default, cuts a neighbour's unwired rows first and recedes only if that still overflows; level 2 keeps every row; level 0 is pins, wires and names. Below a projected scale of 0.55 a card's name becomes a DOM label at constant size.

The lace, seen from above (z toward the viewer):

```
 left wall ────────────────────── right wall ● pin   stub tip = pin edge + (14, ±8)
           ┃                                 ┃╲  out 14, in plane             z = 0
 green stub┃                                 ┃ ╲ retrace on the camera ray    z = -14…-20
 mirrors it┃                                 ┃╱  back behind the wall         z = -26
           ┃ ─ ─ one lacing plane, every lace ┃  plunge inside the silhouette
           ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  z = -100
```

The retrace lies on the resting camera's rays through the stub, so front-on it hides behind the stub and the wedge tapers 2.5 to 1.6 as in 2D (93, 94). All laces of a pin share one retrace and diverge only behind the wall. A file on both sides sits where it has more wires, left on a tie, and its other-direction edge is the same lace routed behind the focus (09).

## What depth bought

- The corset is real and still reads as the stubs. Front-on (01, 93, 94) nothing differs from the 2D card. At 35 degrees (02, 95) each provider pin grows one hook curling behind the wall; at 60 (10) the dives run parallel like lacing; at 80 (13) the sheet of laces shows behind the card's edge. The hooks say at a glance "this file's functions take this file's types"; hovering `Point` (06) lights the seven green stubs of the functions that take it.
- A hub is present without a scroll (03): 25 consumers and 13 dependencies on one screen, the heaviest nearest and readable (`generator.ts`, 14 wires). Depth carries one ordinal a 2D column cannot: coupling as distance. Cutting unwired rows halved the recession needed (0.31 to 0.15 on the right).
- Wires from one pin to many consumers separate in depth; orbited (04) the fan is legible where the 2D ribbon was solid.
- Level 0 (12) is a free skeleton: a card as a bar of pins.

## What it cost

- Occlusion: at 35 degrees the card hides its own lacing beyond 70 units from the wall; the sheet shows only past 60 degrees, where row text is gone. DOM name labels ignore occlusion (04).
- Legibility: `core.ts` is 59 rows, so the resting camera fits it at 8 px per row, as in 2D. Of 38 neighbours, 8 are legible with rows at rest; the rest are names.
- Disorientation: the corridor holds from the resting camera only. Yaw 30 degrees and every consumer deeper than about 0.4·Zc swings left of the focus (04: `csharp.ts` … `lint.ts` left of `core.ts`), breaking the one non-negotiable law.
- Performance: 165 tubes (about 95k triangles) and 39 textures; a `core.ts` focus builds in 1.6 s on swiftshader; a 59-row texture at 3x is 15 MB, two per card.

## Facts the picture needed that the docs do not carry

1. A re-export's local row. `core.ts`'s 59 edges are `re-export` with `toSymbol` but no `from`, so all 59 dependency wires land on its Internals pin (03, the green fan) instead of the row each becomes; matching by name would be inference.
2. A re-exported symbol's kind. All 59 `core.ts` symbols are `kind: unknown`; the hub card's kind column is blank (03).
3. The consuming symbol of an import. Import edges have no `from`, so every import lands on the consumer's Internals (05, all six consumers) even when `readLiveDocGraph` is used in one function; type references carry `from`, imports would need per-symbol use.
4. A home for externals. `glob`, `node:fs`, `node:path` are wires from nowhere; the card shows them as a grey line (05). The picture wanted a provider on the left wall, or a wall for "outside the map".
5. A barrel flag. That `core.ts` is a barrel is derivable (every edge is a re-export) but unstated; the picture wanted a membrane, not a 59-row card.

## Transition points

One scale in, the symbol: hovering a row already renders it (06): one row, its wires, its laces; the symbol view is that state with the card redrawn at the same font, not a dolly.

One scale out, the folder: the line above the focus, `packages/engine/src/live-docs/ · 22 files`, is the pull. Crossing it re-renders rather than zooms: the focus card stays where it is at the same font, same-folder neighbours stay cards, and each other column collapses into wall pins with counts on a translucent box, Probe B's opening state. What must stay put: the focus card, its wall pins, the left/right reading.

## Keep and throw away

Keep: the lace geometry (shared retrace on the camera ray, one lacing plane), wall-aligned columns, cut unwired rows before spending depth, the dim texture that meets the dimming spec, constant-size names for far cards, level 0.
Throw away: recession beyond about r = 0.1 (overflow into a second column), tubes for plain wires (Line2 is cheaper and constant-width), 3x textures for tall cards, DOM labels once cards can occlude them.

## Open questions

- Order depth by coupling (this probe) or by directory distance, so the folder pull shows in the column?
- Should a neighbour ever show unwired rows at this scale, or is that the symbol scale's job?
- Is a two-column-per-side hub better than any recession, given the swing?
- The lacing shows only past 60 degrees; is one hook per pin at 35 enough, or should the resting camera carry a slight yaw?
