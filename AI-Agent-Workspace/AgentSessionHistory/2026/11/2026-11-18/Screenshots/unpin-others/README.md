# Fold others away, Unpin others and Wrap this group again

_Historical evidence, taken 2026-11-19 between 05:57 and 06:15 UTC by the builder of the round, from the branch `unpin-others` merged with main. The behaviour is described in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md) (the pinning paragraph); the owner's asks are [Turn 31](../../2026-11-18.1.record.md#turn-31) and [Turn 33](../../2026-11-18.1.record.md#turn-33) of the November 18 record._

**The setup.** The estate sample at 1440 × 900, served from this branch's own build on port 8824. Pins: `Portal/Services/GatewayClient.cs` (the subject), `PaymentService/PaymentService.cs` and `Portal/Models/PaymentResultModel.cs`, all whole, with the directory `Portal` opened. Every menu was opened and every item chosen from the keyboard (Enter on More, or Shift+F10 on a 3D name), so that the focus returns as it does for a person using one.

| Picture | What I see |
| --- | --- |
| `2d-1-three-pins-portal-open.png` | The 2D map with `Portal/Services` opened around GatewayClient.cs, the subject in the middle; the tray's toggle says 4 pins (three files and the directory). |
| `2d-2-menu-on-payment-service.png` | PaymentService.cs's card, at the right edge where the keyboard brought its More into view, with its menu open: Inspect, Unpin file, **Fold others away**, **Unpin others**, Centre. The two new items stand beside the card's own Pin. |
| `2d-3-after-unpin-others.png` | Unpin others chosen. PaymentService.cs is alone with its own neighbourhood, now the subject, its More still holding the focus ring; the tray says 1 pin. The card stayed where it was: its name moved 29 px left and 0 px down, the card having re-seated itself in its column. It stays partly beyond the right edge, as it stood before: the rule holds the thing under the hand where it was, and does not bring it into view. The page said "Unpinned 2 others, folded 1 directory away". |
| `2d-4-after-back.png` | Back: the four pins return, `Portal` open again, GatewayClient.cs the subject, the picture as in the first. |
| `2d-5-after-fold-from-gateway.png` | Fold others away chosen from GatewayClient.cs's More. Every pin stays (3 pins), `Portal` is closed, so `Portal/Controllers` stands as its own directory below; GatewayClient.cs did not move. The page said "Folded 1 directory away". |
| `tray-1-open.png` | The tray open: each entry now has a More (three dots) between its name and its release. |
| `tray-2-entry-menu.png` | PaymentResultModel.cs's entry's More opened: Fold others away, Unpin others. |
| `tray-3-after-unpin-others.png` | Unpin others chosen there: one entry left, its More gone since nothing else is left to release, and the entry itself holding the focus. PaymentResultModel.cs is the subject. |
| `3d-1-three-pins.png` | The 3D map, the same pins, GatewayClient.cs the subject. |
| `3d-2-menu-on-gateway-client.png` | The menu of GatewayClient.cs's name: Inspect, Unpin file, Fold others away, Unpin others, Centre. |
| `3d-3-after-unpin-others.png` | Unpin others chosen: GatewayClient.cs's sphere stands at the same point of the screen (850, 443) and its name keeps the focus; the picture now shows 13 of 36 files where it showed 26, with fewer wrapped groups around. The page said "Unpinned 2 others, folded 1 directory away". |
| `3d-4-after-back.png` | Back: 4 pins and the larger picture again. |
| `wrap-1-shells.png` | The Connections layout with PaymentService.cs pinned: directory shells named with their counts ("Hub · 3", "Gateway · 2"). |
| `wrap-2-popped-chip-at-rest.png` | "Hub" popped by the keyboard on its name. Its three files stand loose, and the directory's name, the only control that wraps it again, is the word "Hub" drawn at 45 % opacity with a faint frame (measured: opacity 0.45, frame `rgb(72, 81, 100)`), among the spheres it released, where every shell's name around it is drawn at full strength. Nothing says it can be pressed but its tooltip ("Hub · opened · Wrap its files again"). |
| `wrap-3-sphere-menu.png` | A right press on App.config, one of Hub's loose spheres: its menu holds **Wrap this group again**, with "Hub" beneath it, and Unpin others; no Fold others away, since the only thing open is Hub, which App.config, unpinned, is drawn only inside. |
| `wrap-4-after-wrap.png` | Chosen: Hub is one shell again and its grey word is gone. |

**The chip's plain fault, as asked.** The popped group's name is drawn as a context label: unframed, dimmed text at the centroid of what it released (`forceGraphView.ts`, where `chip.dataset.context = "true"`), so it reads as a stray caption, not a control. It also enters the label placement beside the files' names and is hidden whenever the placement leaves it no room, so on a crowded picture it may not be drawn at all (read from the code; not seen tonight). Nothing on screen tells a person that a popped group can be wrapped again. Not redesigned tonight.

**What the browser cases saw** (`tests/e2e/others.spec.ts`, run once at 05:58 against this build): the card, the symbol row, the fold, the absent items and a neighbour, the tray entry and the 3D sphere passed; the wrap case failed on its own words (the item's accessible name is "Wrap this group again Hub", its detail included), was corrected, and passed when run alone at 06:18. All seven have passed once; none has been run against main's bundle tonight.
