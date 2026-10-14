# Pin one symbol of `branches.ts` with clicks alone

_A probe of 2026-10-14, the night of the day. Current as a record of what the built Explorer did on that date; the rules it exercises may since have changed._

## The brief

The owner, in [Turn 8 of the day's record](../../../ChatHistory/2026/10/2026-10-14.1.record.md#turn-8): "with clicks alone, attempt to pin only one symbol in `branches.ts` without accidentally pinning any other symbol. If it is impossible, let's discuss UX." The file is `packages/explorer/src/client/views/localView/branches.ts`, twenty public symbols.

## How it was tried

A scripted journey of clicks on the bundle built from `d2af43fb`, served from `dist/explorer`, 1600 by 1000, a fresh browser for every route, starting at `/` with nothing in the address. No typing anywhere: the search bar was not used. After every click the subject, the tray's count and the pins in the address were read; the whole log is [journey.log](journey.log). The script is disposable and was not kept.

## What happened

| Route | Clicks | Pins at the end |
| --- | --- | --- |
| 1. Land, Local Map, double-click a neighbour card to make it the subject | 2 | Two whole files: the subject that was, and the neighbour. The two clicks of a double-click each reach the card's click handler before the double-click recentres. |
| 2. Land, Local Map, click one symbol on a neighbour card | 1 | Two: the subject whole, and the symbol. The first pin of an exploration retains the subject whole so that it does not vanish. Then the tray: open it, release the subject, and the one symbol stands alone ([picture](route2-after-tray-release.png)). Three clicks after the accident. |
| 3. Land, Local Map, click a neighbour card's body, then one of its symbols | 2 | Five: the subject whole, and the card's other three symbols and its Internals, the clicked symbol being the one not pinned ([picture](route3-card-then-symbol.png)). A click on a symbol of a file pinned whole toggles that symbol out and pins the rest one by one. |
| 4. Knowledge Sources, open the folded groups, click `branches.ts`, the detail panel's Local Map action, then one symbol | 5 | One: `branches.ts#closedDirectoryNode` ([picture](route4-after-symbol-click.png)). The only route that answers the brief as asked. The subject is set by the panel, nothing is pinned on the way, and a symbol clicked on the subject's own card pins that symbol alone. |
| 5. World Map, click the `explorer` thing, "open explorer" in its panel, open four closed boxes down to `localView`, click the compact card's title to see its rows, then one symbol | 8 | Twenty-five: the five directories opened, and every symbol of `branches.ts` but the one clicked, with its Internals ([picture](route5-after-symbol-click.png)). The compact card shows no rows until it is pinned whole, and then the symbol click is the toggle of route 3. |

The landing subject of this repository's bundle is `tests/integration/programs/typescript/rosetta/src/main.ts`, the inferred entry, which connects only to the rosetta sample's own files; the Explorer's code cannot be walked to from it by any number of double-clicks.

## Where the rules come from

Three rules of the Local Map, each the owner's or an agent's reading of the owner's, make the accidents:

- A click on a card pins the file whole, and a click on a symbol of a file pinned whole toggles that symbol out and pins the others one by one. The owner's words of [2026-10-03](../../../ChatHistory/2026/10/2026-10-03.1.record.md#turn-1): "A click on any node causes all of its symbols to be pinned. A click on any symbol within that node causes just that symbol of that node to be pinned. Clicking additional symbols on that node causes them to be pinned in addition to the symbols already pinned on that node (adds, doesn't replace). Clicking the same already-pinned symbol on a node causes that symbol to un-pin." The agent of that day read a whole pin as every symbol already pinned, so a click on one is the un-pin of the last sentence, and the rest stay (`9641e5cd`, "effective symbol toggle expands a wildcard into the remaining explicit rows").
- The first pin of an exploration retains the subject whole. From the same words: "Why make this set of changes? Because clicking a node in the Local Map suddenly makes the thing you were looking at disappear." The agent kept the thing being looked at by pinning it whole, silently, on the first pin elsewhere (`9641e5cd`).
- A double-click recentres on a card. The card's click handler runs on each of its two clicks first; the agent of October 3 "preserved the existing recenter action" when the card click became a whole pin (`9969abe1`, `9641e5cd`).
