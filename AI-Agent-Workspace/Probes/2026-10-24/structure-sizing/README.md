# Structure folder sizing — October 24, 2026

Historical visual probe. The owner reopened recursive sizing in [Turn 13](../../../ChatHistory/2026/10/2026-10-24.1.record.md#turn-13) and selected the non-recursive candidate's meaning in [Turn 14](../../../ChatHistory/2026/10/2026-10-24.1.record.md#turn-14): “Immediate files + subfolders, each counted once”. [Turn 15](../../../ChatHistory/2026/10/2026-10-24.1.record.md#turn-15) adds equal-sized folders as a candidate, and [Turn 16](../../../ChatHistory/2026/10/2026-10-24.1.record.md#turn-16) identifies overwhelming Structure label density. No new product default has been adopted.

## Comparison

The committed implementation is `8376288b`. Its shared legend already includes orange Directory nodes in Structure. Its folder volume is the sum of the symbol-weighted volumes of every descendant file. Each file contributes one baseline unit plus its public-symbol count at the default symbol scale. A file therefore contributes to each ancestor's sphere. The existing sidebar's generic size explanation does not distinguish this aggregation from individual files.

The disposable preview changes only folder sizing and the legend's explanation. File symbol sizing, colours, resistance, wire treatment, forces and label policy retain their committed defaults. A folder's immediate count uses the filtered graph's directly attached files and child folders, after the existing empty single-child chains collapse. An immediate child folder contributes one unit, regardless of descendants. At the default node-size setting, physical radius is four times the cube root of the count. Related documents count as immediate entries if their overlay is enabled; the captured default hides them.

Three bundles isolate appearance from layout:

- **Recursive:** the committed size rule, with the legend distinguishing file and folder meanings.
- **Immediate, display only:** the same physical layout and framing rule, with only rendered folder volumes changed. Labels retain their original placement rule. This isolates sphere area; it is not a completed alternate layout or interaction treatment.
- **Immediate, settled:** the candidate's folder volumes also feed collision clearance, spring distances, framing and labels through the existing shared geometry functions. This allows the layout to respond to the changed sizes.

Each begins directly in Structure with fresh browser settings, at 1600×1000 CSS pixels and DPR 1. The repo and estate were captured sequentially, with one Chromium process at a time. In both datasets, the recursive/display-only pair has exactly equal node centres, camera and file radii, checked from the observed scene. Closer and orbit captures exercise the ordinary mouse controls. The built pages live under `dist/explorer/structure-comparison/` for local review and are disposable, never committed. The existing bundle data and history are reused; history is not regenerated.

## Uniform folders and quieter names

The added flat candidates use physical radius **4** (the existing zero-symbol-file baseline) or **6.35** (four volume units, before rounding the displayed radius). Both retain the shared .45 node zoom resistance, so depth still changes apparent size. Four units is close to the repository's average immediate-entry count: its 288 hubs divide 1,164 containment links, about 4.04 entries per hub. It is a reasonable comparison scale, not a proposed scene-dependent sizing formula. The larger fixed value is the same in the estate and repository.

The label cause is in `forceGraphView.ts`: ordinary files have priority 5 and must reach a perspective radius of 6px at overview, or 14px when the view is scoped. Ordinary directories have priority 4 and were eligible at every overview distance. The collision placer keeps text rectangles apart, but cannot make all those eligible full paths useful. This explains how a picture can have no text overlap and still be overwhelming.

The quieter experimental admission rule applies the same proximity threshold to ordinary deeper directories as to files. The scan root and its immediate displayed child directories remain overview landmarks. Existing stronger priorities for focus, hover, inspection, pins, retained branches and path endpoints continue to bypass that gate. Text stays at its existing reading size, full directory paths remain available, and the collision-placement rules are unchanged. This is a candidate disclosure policy, not a completed navigation regression pass.

The three additional bundles are `immediate-quiet`, `flat-base-quiet` and `flat-quiet`. They share the quieter label policy. A corrected flat-size legend uses a single equal-size marker rather than the initial misleading pair of differently sized dots. File and folder size rows are adjacent.

## Initial measurements

These come from the existing bundle's 877 visible files at default settings, before projection or zoom resistance. Immediate-entry counts describe the visible documented tree, not arbitrary files outside its scope.

| Directory | Descendant files | Direct files | Direct folders | Recursive physical radius | Immediate-entry physical radius |
| --- | ---: | ---: | ---: | ---: | ---: |
| Scan root | 877 | 10 | 6 | 63.85 | 10.08 |
| packages | 324 | 0 | 4 | 46.92 | 6.35 |
| packages/explorer | 165 | 2 | 1 | 39.32 | 5.77 |
| packages/explorer/src/client | 151 | 15 | 7 | 36.73 | 11.21 |
| packages/explorer/src/client/views/localView | 46 | 46 | 0 | 24.86 | 14.33 |
| tests | 465 | 1 | 2 | 50.43 | 5.77 |

## Findings and status

Root viewed the committed overview first: the new Directory colour key is present, while large orange ancestors crowd the centre. Root subsequently inspected every sizing candidate's overview, the principal close comparisons and sampled orbit frames on both datasets. The [screenshot index](../../../Screenshots/2026-10-24/README.md#structure-sizing-reopened) identifies the captures.

- **Recursive volume:** parent spheres take substantial screen area around the centre. The scan-root radius in the matched repository overview is 27.17px; the immediate-entry rendering at that same position and camera is 4.29px. `packages` changes from 21.17px to 2.86px. These are appearance-only measurements, not different fits.
- **Immediate entries:** large ancestor bodies disappear; hubs with many direct files retain visual weight. It reads more clearly on both datasets, while still encoding local branching.
- **Flat, baseline:** the tree is calm, but directory junctions become easy to lose among their wires at overview. This is not grounds to reject uniform sizing at every scale.
- **Flat, larger:** junctions stay visible without making ancestors visually dominant. Root's provisional preference is this moderate uniform size with the quieter names. The immediate-count treatment is also viable and emphasizes busy local hubs more strongly. The owner's visual verdict remains outstanding.
- **Label disclosure:** this is the largest readability improvement. The repository overview with any quieter candidate shows eight names: the root, its six top-level directories and one file that meets the size threshold. In the immediate-count before/after pair, node centres and camera are exactly unchanged, isolating the label effect. More names appear when approaching. The estate shows many more names because its much smaller graph is framed closer; it does not need an arbitrary global label-count cap.

All twelve initial dataset/treatment observations completed with the expected 54 nodes/18 directories on the estate and 1,165 nodes/288 directories on the repository, and no reported page errors. The first attempt was interrupted between pages when the localhost server exited 143; it resumed only unfinished captures. The supplemental hover/inspection journey also passed: `tests/integration/programs/csharp`, unnamed at rest, revealed its full path on hover and opened the reader with its 68 descendant files and four child folders. Root viewed both captures, including the reader after its transition, and the refreshed estate flat-size picture. The reader still has awkward long-path wrapping and low-contrast default-blue directory links, visible follow-ups for its own styling pass; this probe does not claim those repaired.

No product source or default has changed, and no new regression tests were written before visual judgment. The normal Markdown link audit passed with 1,167 files and zero broken links; the earlier ad hoc invocation was interrupted without producing a result and is not counted as a pass. The screenshot index names all 45 Structure captures. Disposable review pages remain available locally until the owner has judged the comparison; their source transforms and temporary measurement scripts can be reconstructed from the rules above.
