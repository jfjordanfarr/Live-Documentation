# Shared Compact / Relaxed: tuning and verification

_Historical implementation report, October 13, 2026. The [owner’s approved grammar and advanced-control request](../../../ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation) is the scope; [the final pictures](../../../Screenshots/2026-10-13/presets/README.md) are the visual evidence._

One packing preference follows between 2D and 3D. Coupling and interface size retain their meaning across presets. The chosen values are starting defaults tested on the repository, Java warehouse and C# estate, including live changes; they are not universal optima.

## Selected controls

| Control | Compact | Relaxed |
| --- | ---: | ---: |
| 2D column gap | 72 | 100 |
| 2D card gap | 16 | 24 |
| 2D directory gap | 20 | 28 |
| 2D height cost | 12 | 5 |
| 2D membrane evenness | 1 | 2 |
| 2D membrane simplicity | 100 | 200 |
| 2D row levelness | 0 | 0.25 |
| 3D preferred link gap | 32 | 60 |
| 3D repulsion magnitude | 30 | 60 |
| 3D collision clearance | 2 | 5 |

Both use coupling 1, base sphere radius 4 and symbol-volume exponent 1. Those independent encodings are not overwritten by choosing another packing preset. Advanced packing edits read Custom. Values are validated against the actual public slider ranges and increments before rendering. Explicit older saved settings remain overrides.

## What was compared

The [24 headless candidates](tuning-candidates.md), with [complete configurations and measurements](tuning-candidates.json), used the corrected reference projection over the earlier 632-file bundle and the estate. The regularity candidate and refined Compact candidate were then rendered across six scenes: generator, warehouse, repository five files/chain and estate five files/chain. Coupling 0.5 was also inspected on generator and estate; 1 was retained as the starting value.

Compact can retain useful shape preferences: increasing its simplicity/evenness from the first provisional settings removed seven dense-repository steps without increasing that picture’s footprint. Relaxed’s stronger regularity removed seven steps there at 61 extra pixels of height and four estate steps while shortening that picture by 90 pixels. These are candidate-study measurements; the new code’s mirrors subsequently changed this repository’s own graph. The final 643-file results are separately preserved in [final-comparisons.json](final-comparisons.json) and the screenshot README.

## Final spatial reports

All reports use the shared D3 configuration for 300 deterministic ticks. The full filtered graph supplies the forces; the named scope identifies retained attention. The four stock-profile reports show tests and assets, with related documents off. The last report consumes the [actual UI-exported custom configuration](exported-layout-settings.json) with assets hidden and related documents enabled.

| Report | Files | File pairs | Documented references | Bounds in layout units | Sphere overlaps |
| --- | ---: | ---: | ---: | --- | ---: |
| [repository-five-files-spatial-compact](repository-five-files-spatial-compact.md) / [JSON](repository-five-files-spatial-compact.json) | 643 | 1457 | 3264 | 1815 × 1684 × 1716 | 0 |
| [repository-five-files-spatial-relaxed](repository-five-files-spatial-relaxed.md) / [JSON](repository-five-files-spatial-relaxed.json) | 643 | 1457 | 3264 | 2597 × 2404 × 2436 | 0 |
| [estate-five-files-spatial-compact](estate-five-files-spatial-compact.md) / [JSON](estate-five-files-spatial-compact.json) | 35 | 60 | 95 | 379 × 289 × 362 | 0 |
| [estate-five-files-spatial-relaxed](estate-five-files-spatial-relaxed.md) / [JSON](estate-five-files-spatial-relaxed.json) | 35 | 60 | 95 | 572 × 398 × 533 | 0 |
| [repository-five-files-spatial-exported-related](repository-five-files-spatial-exported-related.md) / [JSON](repository-five-files-spatial-exported-related.json) | 616 | 1360 | 3178 | 2365 × 2217 × 2406 | 0 |

Counts, node identities and intrinsic radii are equal between each stock-profile pair. Compact has a smaller extent in these runs. Browser simulations reheat from the current picture and run under a time limit; these cold tick-based reports are not claims of identical final browser coordinates. Apparent sphere size additionally depends on camera depth.

## Meaning and correctness

- Imports and linked signature occurrences are counted once each from documented facts. One estate pair previously yielded five display links for three facts because type relationships appeared twice; the projection now removes that duplication and preserves multiplicity on coalesced endpoints. The canonical graph is not filtered or rewritten.
- 3D keeps one line per file pair. Hover gives its documented-reference count. A logarithmic coupling term reduces preferred surface separation with diminishing returns, bounded by collision clearance; D3’s neighbor-degree spring-strength rule remains.
- Node value represents sphere volume: public-symbol count plus one baseline unit, raised to the chosen exponent. At exponent 1, radius already grows by a cube root. Assets and related documents retain a visible minimum without inventing public symbols.
- The shared spatial projection handles related-document overlays identically in the renderer and command, including Live Doc aliases, filtered source files and reciprocal links.
- Exported settings describe packing and spatial encodings, not a camera snapshot or a unique settled arrangement. Warm and cold starts can differ. The page can restore these settings from a shared URL, and the lab accepts the exported JSON as `--config @file`.

## Findings corrected during the work

Zero-duration placement could move cards without redrawing their wires; it now redraws the actual endpoints and holds the subject. A preset applied during unfinished automatic framing could move the selected file about five pixels; explicit tuning now takes over that camera before re-layout, without relaxing the existing 1.5-pixel regression bound. Final motion samples found about 0.001036 pixels of 2D drift and zero 3D anchor drift; the full [2D samples](motion-2d.json) and [3D samples](motion-3d.json) are retained.

Two older browser journeys assumed the previous on-screen geometry or a single Tuning disclosure. They now use the existing public pan-and-click helper and the actual Tuning control. Their original semantic assertions and timeouts remain. A separate read-only collision check placed unequal unlinked spheres together with zero charge: they separated to 37.5 units against a required clearance of 25, exercising collision independently of link or repulsion forces.

## Verification and reproducibility

`npm run safe:commit -- --e2e` passed 988 unit tests, 52 integration tests and all 104 browser tests, plus lint, builds, test type-checking, complete regeneration/lint and all documentation, asset and symbol audits. The final generator pass found all 643 mirrors unchanged. No product source changed after the successful gate. The [root session record](../../../ChatHistory/2026/10/2026-10-13.1.record.md) retains intermediate failures and the final closeout.

Example commands:

```sh
npm run layout:lab -- spatial repository/five --preset compact
npm run layout:lab -- spatial estate/five --preset relaxed
npm run layout:lab -- spatial repository/five --config @local-map-layout.json --assets false --related-docs true
npm run layout:lab -- capture estate/five --preset compact
npm run layout:lab -- refine estate/five --preset compact --config @local-map-layout.json
```

Build the repository and estate bundles first. The lab’s page captures and intermediate scripts are disposable; the named pictures, reports, candidate configurations and unique findings are retained here.
