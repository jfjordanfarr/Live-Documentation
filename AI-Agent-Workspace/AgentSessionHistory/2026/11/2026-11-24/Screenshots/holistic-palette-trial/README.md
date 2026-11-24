# Holistic Palette & "Change is Golden" Trial — Verification & Comparison (2026-11-24)

**Status:** Side-by-side visual trial for Milestone 17 on `day/2026-11-24`. Default palette remains `today` until the owner chooses.

All 8 stitched 5-palette comparison sheets (`today`, `vividKinds`, `graphiteVivid`, `moonlitInk`, `slateStructure`) and all 9 full-resolution `1280×800` hero captures were inspected coldly by the root agent before commit. Every candidate verifies `shortfalls(palette) === []` under `palette.test.ts`'s OKLab (`≥ 15` full, `≥ 8` Machado protanopia/deuteranopia) and WCAG contrast rules (`≥ 3:1` marks, `≥ 4.5:1` words).

## Stitched 5-Palette Contact Sheets

1. [`sheet-2d-estate-reading.png`](sheet-2d-estate-reading.png) — 2D Estate reading scale (`PaymentService.cs`).
2. [`sheet-3d-estate-1hop.png`](sheet-3d-estate-1hop.png) — 3D Estate 1-hop (`PaymentService.cs`), contrasting frontier sphere legibility and bottom toolbar glare.
3. [`sheet-3d-repo-graph.png`](sheet-3d-repo-graph.png) — 3D Repo dense cluster (`graph.ts` 1-hop) with Implementation/Test spheres and directory shells.
4. [`sheet-3d-history-both.png`](sheet-3d-history-both.png) — 3D Repo History step `1754` (`de8b25c9`) on `forceGraphView.ts` under `Both` + Marbles On, showing linear-light Fresnel golden rims preserving kind colors and marble veins on top-level spheres and nested shell dots plus golden changed wires.
5. [`sheet-2d-history-dim.png`](sheet-2d-history-dim.png) — 2D Repo History step `1754` under `Dim`: crisp outer `1.5 px` golden ring preserving inner `.test-backed` borders and stacked `.local-focus` rings.
6. [`sheet-2d-history-both.png`](sheet-2d-history-both.png) — 2D Repo History step `1754` under `Both`: `2 px` ring + `14 px` soft outer glow preserving inner card borders.
7. [`sheet-world-estate-light.png`](sheet-world-estate-light.png) — Estate World Map (Light).
8. [`sheet-world-estate-dark.png`](sheet-world-estate-dark.png) — Estate World Map (Dark).

## Full-Resolution `1280×800` Hero Captures

- **3D Estate 1-Hop:** [`hero-3d-estate-1hop-graphiteVivid.png`](hero-3d-estate-1hop-graphiteVivid.png), [`hero-3d-estate-1hop-moonlitInk.png`](hero-3d-estate-1hop-moonlitInk.png), [`hero-3d-estate-1hop-slateStructure.png`](hero-3d-estate-1hop-slateStructure.png)
- **3D History `Both` + Marbles On:** [`hero-3d-history-both-graphiteVivid.png`](hero-3d-history-both-graphiteVivid.png), [`hero-3d-history-both-moonlitInk.png`](hero-3d-history-both-moonlitInk.png), [`hero-3d-history-both-slateStructure.png`](hero-3d-history-both-slateStructure.png)
- **2D History `Both`:** [`hero-2d-history-both-graphiteVivid.png`](hero-2d-history-both-graphiteVivid.png), [`hero-2d-history-both-moonlitInk.png`](hero-2d-history-both-moonlitInk.png), [`hero-2d-history-both-slateStructure.png`](hero-2d-history-both-slateStructure.png)

## Cold Visual Trade-Offs

- **A — `Graphite vivid`:** Keeps blue Implementation + green Test (`hasTests.mark = test`), breaks blue-on-blue with `#0c0d10` graphite ground and silver skins, cuts toolbar glare (`#c9ced8`, `11.2:1`), and renders crisp `#ffd335` gold rims/halos. **Flaws:** `0.4`-alpha cobalt frontier spheres still sit dark on their shadow hemisphere; 2D `Offers`/`Uses` wires (`#67dfff`/`#56ffad`) are louder/more pastel than `today` and `moonlitInk`; lime-green `Test-backed` borders sit close to green `Uses` wires on test-backed cards.
- **B — `Moonlit ink`:** Strongest 3D frontier silhouettes (pearl `#adb4ba`), calmest 2D wires (`#01aafd`/`#64e9a4`), preserves purple `Test-backed` border apart from green `Uses` wires, and gives `#ffd12a` gold the sharpest figure-ground pop. **Flaws:** drops blue Implementation / green Test completely, making all-implementation graphs (`estate`) look monochrome grey until tests/docs/changes appear; `#dfe5ef` selected chrome (`14.4:1`) remains brighter than A; violet tests sink darker at 0.4 frontier alpha than pearl implementation.
- **C — `Slate structure`:** Lifted `#141820` slate-dusk ground breaks the harsh black void and keeps cool-code / warm-content grouping. **Flaws:** pale-ice `Offers` (`#a2ddff`) reads washed-out next to mint `Uses` (`#46fdb6`) in 2D and Dark World Map; olive tests (`#749c12`) turn muddy in 3D shadow; `#ffdc58` gold reads paler over cyan/mint marbles; directories give up orange hubs/spokes for pewter grey.
- **Honest 3D ceiling:** `0.4` frontier alpha (owner's 2026-11-02 Choice B, untouched) caps contrast of even pure white over black at `3.45:1` and dark blue kinds near `1.8:1`. Lifting frontier alpha (e.g. `0.4 → 0.55` or `0.6`) is kept as a separate optional decision for the owner.
