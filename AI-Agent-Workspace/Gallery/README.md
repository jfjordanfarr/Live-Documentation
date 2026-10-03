# Gallery: the same things, viewed different ways

This folder holds the pictures that get compared across chats: one representative picture of each subject in each view and probe, copied here under the subject's and the view's names, so that a side-by-side comparison starts from one folder rather than from a search through the dated screenshots and probe records. Every file here is a copy; its origin is named below, and the origin's record explains the state it shows. The dated folders stay the evidence of a day's work. The owner suggested this folder on [2026-10-01](../ChatHistory/2026/10/2026-10-01.1.record.md#turn-11), having watched the agent track pictures down turn after turn.

The sheets in `sheets/` put the pictures of one subject side by side at full size with a label under each; `sheets.sh` rebuilds them all with ImageMagick, which the devcontainer carries. Open a sheet at full size to read it; a 1600 by 1000 picture is one tile.

**To add a picture:** copy it to `<subject>/<view>.png` (a second state of the same view takes a suffix, as `rings-kept-chords-only.png` does), name its origin and date in the table below, add it to a sheet in `sheets.sh` if it belongs beside others, run the script, and look at the result. One picture per subject, view and state; a new picture of the same state replaces the old one, which the dated folder still keeps.

## The subjects

- **graph.ts and its five files**, this repository: `packages/engine/src/live-docs/graph.ts` with `document.ts`, `graphFiles.ts`, `packages/explorer/src/shared/staticExplorerData.ts` and `staticBuilder.ts`. This is the still-picture deck's scope, chosen on 2026-10-01 because the set had broken both shipped views on 2026-09-30; the deck's rows for it are in [the deck](../Probes/2026-10-01/still-picture-deck.md).
- **PaymentService.cs and its four kept files**, the estate sample: `PaymentService/PaymentService.cs` with `Contracts/IPaymentService.cs`, `Gateway/Wcf/HubProxy.cs`, `Hub/PaymentHub.cs` and `Portal/Services/GatewayClient.cs`, the deck's second scope.
- **Two symbols**: `LiveDoc` on `document.ts` and `GraphFile` on `graph.ts`, both pinned, the matched comparison Codex ran on 2026-10-01.
- **The estate from outside**: the seven systems of the estate's board.
- **The gateway's files**: `Gateway/Controllers/PaymentsController.cs` and the gateway's configuration, the estate file Codex's probes followed.

## The pictures

### graph.ts and its five files, this repository

| File | View, state | Date | Origin |
| --- | --- | --- | --- |
| `graph-ts/local-map.png` | Local Map (shipped), `graph.ts` selected; the deck's Local Map state | 2026-10-01 | [Screenshots](../Screenshots/2026-10-01/README.md) `still-picture-local-map-graph.png` |
| `graph-ts/membrane-map.png` | Membrane Map (shipped), all five files' symbols pinned, the recorded camera; the deck's Membrane state | 2026-10-01 | [Screenshots](../Screenshots/2026-10-01/README.md) `still-picture-membrane-five-files.png` |
| `graph-ts/rings.png` | Rings (probe), every reference between showing rows drawn | 2026-10-01 | [Rings record](../Probes/2026-10-01/rings.md) `repository-rings-all-references.png` |
| `graph-ts/rings-kept-chords-only.png` | Rings (probe), the first rule: chords between kept cards only | 2026-10-01 | [Rings record](../Probes/2026-10-01/rings.md) `repository-rings-state.png` |
| `graph-ts/folder-columns.png` | Folder columns (probe), fitted, no bundling, every reference drawn | 2026-10-01 | [Folder columns record](../Probes/2026-10-01/folder-columns.md) `repository-folder-columns-state.png` |
| `graph-ts/folder-columns-bundled-by-folder.png` | Folder columns (probe), bundled by folder | 2026-10-01 | [Folder columns record](../Probes/2026-10-01/folder-columns.md) `repository-folder-columns-bundling-folder.png` |
| `graph-ts/analysis-surface.png` | Analysis surface (Codex, GPT-6 Astra), the five files pinned, `staticExplorerData.ts` selected | 2026-10-01 | [Analysis surface record](../Probes/2026-10-01/analysis-surface.md) `05-probe-five-pins.png` |
| `graph-ts/analysis-surface-overview.png` | Analysis surface, the scoped overview of `src/live-docs/` with `graph.ts` selected | 2026-10-01 | [Analysis surface record](../Probes/2026-10-01/analysis-surface.md) `08-probe-overview.png` |
| `graph-ts/force-graph.png` | Force Graph (shipped), the whole repository with `graph.ts` as the context | 2026-10-01 | [Analysis surface record](../Probes/2026-10-01/analysis-surface.md) `04-force-graph.png` |
| `graph-ts/orientation.png` | Orientation (Codex), the fixed neighbourhood of `graph.ts`, laptop size | 2026-09-30 | [Orientation record](../Probes/2026-09-30/orientation.md) `01-laptop.png` |
| `graph-ts/interfaces.png` | Interfaces (Codex), `graph.ts` with its internal references shown, laptop size | 2026-09-30 | [Interfaces record](../Probes/2026-09-30/interfaces.md) `03-internal.png` |
| `graph-ts/depth-side.png` | Depth (Codex), six files' wires seen from the side, in lanes behind the card plane | 2026-09-30 | [Depth record](../Probes/2026-09-30/depth.md) `01-side.png` |
| `graph-ts/two-symbols-membrane-map.png` | Membrane Map (shipped), `LiveDoc` and `GraphFile` pinned | 2026-10-01 | [Analysis surface record](../Probes/2026-10-01/analysis-surface.md) `02-membrane-two-symbols.png` |
| `graph-ts/two-symbols-analysis-surface.png` | Analysis surface, the same two pins | 2026-10-01 | [Analysis surface record](../Probes/2026-10-01/analysis-surface.md) `01-probe-two-symbols.png` |
| `graph-ts/two-symbols-handoff.png` | Handoff (Codex), the same two pins, with the board docked | 2026-10-01 | [Handoff record](../Probes/2026-10-01/handoff.md) `04-two-symbols.png` |

### PaymentService.cs and its four kept files, the estate

| File | View, state | Date | Origin |
| --- | --- | --- | --- |
| `payment-service/local-map.png` | Local Map (shipped), `PaymentService.cs` selected; the deck's state | 2026-10-01 | taken by the still-picture instrument (`tests/e2e/still-picture.spec.ts`) into its untracked reports folder; the row is in [the deck](../Probes/2026-10-01/still-picture-deck.md) |
| `payment-service/membrane-map.png` | Membrane Map (shipped), all five pinned; the deck's state | 2026-10-01 | the same run of the instrument |
| `payment-service/rings.png` | Rings (probe), every reference drawn | 2026-10-01 | [Rings record](../Probes/2026-10-01/rings.md) `estate-rings-all-references.png` |
| `payment-service/rings-kept-chords-only.png` | Rings (probe), chords between kept cards only | 2026-10-01 | [Rings record](../Probes/2026-10-01/rings.md) `estate-rings-state.png` |
| `payment-service/folder-columns.png` | Folder columns (probe), fitted, no bundling | 2026-10-01 | [Folder columns record](../Probes/2026-10-01/folder-columns.md) `estate-folder-columns-state.png` |

### The estate from outside

| File | View, state | Date | Origin |
| --- | --- | --- | --- |
| `estate-outside/world-map.png` | World Map (shipped), the board at rest, before the offer and use colours were corrected | 2026-09-29 | [Screenshots](../Screenshots/2026-09-29/world-map-estate-01-at-rest.png) `world-map-estate-01-at-rest.png` (that day's folder has no README; its pictures are named in [the day's record](../ChatHistory/2026/09/2026-09-29.2.md)) |
| `estate-outside/interfaces.png` | Interfaces (Codex), the systems as light isometric cards with rows and pins | 2026-09-30 | [Interfaces record](../Probes/2026-09-30/interfaces.md) `01-estate.png` |
| `estate-outside/handoff.png` | Handoff (Codex), hub and gateway as cards with the live board docked top left | 2026-10-01 | [Handoff record](../Probes/2026-10-01/handoff.md) `01-interfaces.png` |
| `estate-outside/analysis-surface-board.png` | Analysis surface (Codex), the unchanged World Map renderer inside the probe's shell | 2026-10-01 | [Analysis surface record](../Probes/2026-10-01/analysis-surface.md) `10-estate-board.png` |

### The gateway's files

| File | View, state | Date | Origin |
| --- | --- | --- | --- |
| `gateway/interfaces-payments-controller.png` | Interfaces (Codex), `PaymentsController.cs` reached from the gateway's endpoint evidence | 2026-09-30 | [Interfaces record](../Probes/2026-09-30/interfaces.md) `02-source.png` |
| `gateway/handoff-folder.png` | Handoff (Codex), the gateway's folder opened as a list and one card | 2026-10-01 | [Handoff record](../Probes/2026-10-01/handoff.md) `02-folder.png` |
| `gateway/handoff-cross-system.png` | Handoff (Codex), `Gateway/Web.config` using an endpoint of `Hub/App.config` | 2026-10-01 | [Handoff record](../Probes/2026-10-01/handoff.md) `03-cross-system.png` |

## The sheets

The October 2 additions below use the same 602-file repository bundle. The four route variants retain the same five files, 40 symbol pins and 24 raw references, with `staticBuilder.ts` selected and the reading surface positioned at `graph.ts`. They are a matched comparison within this probe; the older pictures above have different graph snapshots and disclosure policies.

| File | View, state | Origin |
| --- | --- | --- |
| `graph-ts/force-graph-focused.png` | Shipped Force Graph, `graph.ts` centered from its URL | [October 2 screenshots](../Screenshots/2026-10-02/README.md) |
| `graph-ts/journey-lanes.png` | Journey probe, outer lanes without bundling | [Journey record](../Probes/2026-10-02/journey.md), `02-lanes-none.png` |
| `graph-ts/journey-file-bundles.png` | Same state, lanes shared by file pair | Same record, `02-lanes-file.png` |
| `graph-ts/journey-directory-bundles.png` | Same state, lanes shared by directory pair | Same record, `02-lanes-folder.png` |
| `graph-ts/journey-behind-cards.png` | Same state, long paths behind cards | Same record, `02-behind-none.png` |
| `payment-service/journey-five-files.png` | Estate's five retained files, with the last selected file in reading position; three raw references among the five | Same record, `estate-final-reading.png` |

`sheets.sh` accepts an optional sheet filename to rebuild only that sheet; without one it rebuilds the full comparison set.

| Sheet | Tiles |
| --- | --- |
| [graph.ts, six ways](sheets/graph-ts-six-ways.png) | Local Map, Membrane Map, Rings, folder columns, the analysis surface, Force Graph |
| [PaymentService.cs, four ways](sheets/payment-service-four-ways.png) | Local Map, Membrane Map, Rings, folder columns |
| [Two symbols, three ways](sheets/two-symbols-three-ways.png) | Membrane Map, the analysis surface, the handoff |
| [The estate from outside, four ways](sheets/estate-outside-four-ways.png) | World Map, interfaces, the handoff, the analysis surface's docked board |
| [graph.ts in Astra's four navigations](sheets/graph-ts-astra-four-ways.png) | orientation, interfaces, depth from the side, the analysis surface's overview |
| [Five retained files, four route choices](sheets/graph-ts-journey-routes.png) | outer lanes, file bundles, directory bundles, behind-card paths; matched October 2 state |

## Verdicts on record

The owner's words about these pictures, dated, so that a reader knows what has already been judged. Each is history until the owner re-affirms it.

- 2026-09-29, the World Map: "This is really cool! An exciting early prototype of this new view! Lots to still solidify, but we'll get there." ([record](../ChatHistory/2026/09/2026-09-29.2.md))
- 2026-09-30, orientation: "Yeah the movement around is very nice." Accepted as a navigation; the reduced cards were not. ([Turn 18](../ChatHistory/2026/09/2026-09-30.2.record.md#turn-18))
- 2026-09-30, interfaces: "really really rough"; the wires changed route under a pan. ([Turn 23](../ChatHistory/2026/09/2026-09-30.2.record.md#turn-23))
- 2026-09-30, depth: "Looks like we've got a high bar to clear on beating the current visualizations!" ([Turn 33](../ChatHistory/2026/09/2026-09-30.2.record.md#turn-33))
- 2026-10-01, the handoff: "definitely more polished than the last pass", with the docked board named as the interesting part. ([Turn 45](../ChatHistory/2026/09/2026-09-30.2.record.md#turn-45))
- 2026-10-01, the Local Map against Rings: "on the local map, there is a real sense of directionality. You have a good idea of where things come from and go to." ([Turn 7](../ChatHistory/2026/10/2026-10-01.1.record.md#turn-7))
- 2026-10-01, the Local Map against Rings and folder columns, apples to apples: "far more aesthetically pleasing ... there is no grammar to node orientation. Connections fly out in all directions". ([Turn 11](../ChatHistory/2026/10/2026-10-01.1.record.md#turn-11))

## Native file perspectives, October 2

The TypeScript Rosetta processor is selected, with `helpers.format` and the processor file independently pinned. Both pictures use the repaired 609-file graph; tests are shown and assets hidden. They show different presentations of the same exploration state. In the [October 3 review](../ChatHistory/2026/10/2026-10-02.1.record.md#turn-12), the owner preferred the Local Map’s card aesthetics but the Membrane Map’s multi-hop functionality and directory context, and judged the perspective switch to feel like a hard cut.

| Picture | Origin |
| --- | --- |
| [Native Local Map](rosetta-native/local-map.png) | [October 2 screenshots](../Screenshots/2026-10-02/README.md), `local-native-branches.png` |
| [Native Force Graph](rosetta-native/force-graph.png) | Same record, `native-perspective-graph.png` |
| [Two perspectives together](sheets/rosetta-native-perspectives.png) | Rebuild with `bash AI-Agent-Workspace/Gallery/sheets.sh rosetta-native-perspectives.png` |

The [motion recording](../Screenshots/2026-10-02/native-branches-journey.webm) and its [frame sheet](../Screenshots/2026-10-02/native-branches-motion-frames.png) preserve the transition evidence; these two stills alone do not establish continuity.

## Native zoom experiment, October 3

[Local Map](slopcop-native-zoom/local-map.png) and [Force Graph](slopcop-native-zoom/force-graph.png) show the Markdown helper selected with it and the symbol-reference file wholly pinned. Both are copied from the [October 3 screenshot inventory](../Screenshots/2026-10-03/README.md), which names the graph state and preserves the motion recordings. This pass combines actual directory bands with native cards and tests a deliberate zoom boundary; no owner verdict has been recorded for it.
