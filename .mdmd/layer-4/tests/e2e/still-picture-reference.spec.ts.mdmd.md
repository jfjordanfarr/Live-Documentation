# `tests/e2e/still-picture-reference.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/still-picture-reference.spec.ts`
- Generated At: 2026-11-22T19:23:40.441Z

## Authored
### Purpose
Holds the still-picture instrument to itself as it stood until 2026-11-22: on a retained picture of the estate sample (wires that pass directories, lanes and other cards) and on a path, [`readPicture`](still-picture.ts.mdmd.md) and [`readPictureReference`](still-picture-reference.ts.mdmd.md) read the same page back to back and must agree as their JSON, so to the last digit of every sample, count, length and point, with the wires sampled and without.

### Notes
- Made on November 22, 2026, with the instrument's faster reading ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/instrument-and-look-cost/README.md)). The estate is used because the old reading is quick there; the probe's script makes the same comparison on the lanes case's picture of this repository, 247,314 samples, where the old reading takes about a minute.
- Seen failing: with each point asked of the short path of the segment before its own, both cases fail, the readings differing from their first wire's points on.
- Since the evening of 2026-11-22 two cases stand a card that is neither end of a wire across it, a route and then a returning connection's lace, and each reading must count covered samples there. Two readings that agree prove nothing about a fault they share, and they shared one: the page's topmost element along a wire had become the wire's own band, so no card across a wire was seen. Seen failing on the readings as they were: "the instrument sees `Portal/Controllers/PaymentsController.cs` across the wire: expected more than 0, received 0" ([what was measured](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/gate-six-cases/README.md)).
- Later that evening the bands came to take no pointer, and the route's case, which had checked that the page's hit test found a band where its card stood, failed on that check. The route has two cases since: one on the page as it ships, which holds the law's plain sight and would pass on a reading that asked only for the topmost element; and one that makes its own input, an undrawn stroke along the wire in the wires' own drawing that takes the pointer, checks that the hit test is handed it, and then asks both readings to see the card. The second and the lace's case are what hold the rule that the reading looks past the wires' drawing by where a thing stands: both fail against a copy of the reading that takes the plain topmost element, and all three against one that sees no card.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`search-bar.pathAddress`](./search-bar.ts.mdmd.md#symbol-pathaddress)
- [`still-picture-reference.readPictureReference`](./still-picture-reference.ts.mdmd.md#symbol-readpicturereference)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.PictureReading`](./still-picture.ts.mdmd.md#symbol-picturereading) (type-only)
- [`still-picture.arriveAtReadingSize`](./still-picture.ts.mdmd.md#symbol-arriveatreadingsize)
- [`still-picture.displayNames`](./still-picture.ts.mdmd.md#symbol-displaynames)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.localMapUrl`](./still-picture.ts.mdmd.md#symbol-localmapurl)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
- [`still-picture.readPicture`](./still-picture.ts.mdmd.md#symbol-readpicture)
- [`still-picture.scoreOcclusion`](./still-picture.ts.mdmd.md#symbol-scoreocclusion)
<!-- LIVE-DOC:END Dependencies -->
