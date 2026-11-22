# `tests/e2e/local-map-hidden.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/local-map-hidden.spec.ts`
- Generated At: 2026-11-22T02:10:45.431Z

## Authored
### Purpose
Checks that Local Map work belongs to the visible view: 2D layout search pauses and resumes without redrawing unchanged cards, changed inputs appear on return, and reader pinning in Knowledge Sources does not restart hidden 3D rendering.

### Notes
- Written 2026-10-16 with [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-local-maps-work-stays-with-the-view-and-the-wires-keep-their-elements-recorded-2026-10-16), after [the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/Probes/explorer-performance/README.md) measured the search running behind Knowledge Sources and the return's 240 ms render of an unchanged picture ([Turn 12 of the October 15 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-15/2026-10-15.1.record.md#turn-12)).
- Seeds the tuning itself, as `local-map-search.spec.ts` does (the suite otherwise runs with the search off): the ranking's order alone before paint and eighty seeds with a patience of eighty, long enough for a view to be switched while the search runs and short enough to settle within the test's budget; the moves at zero length. Cards are told apart from cards drawn anew by a mark put on their elements. The views are switched by the navigation buttons; the page's visibility is set on the document and announced with `visibilitychange`, since a headless browser has no other way to hide a tab.
- The first run found a step already waiting when the view switched still ran once after it: the gate now stands in the waiting step as well as in the scheduling.
- The two pausing tests run the search's eighty seeds to the end after the return, 19 to 29 seconds on one worker, so since 2026-10-19 they declare a minute rather than the default half ([Turn 12 of the October 17 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-12)). Their wait for the search's end has been 45 s since 2026-11-04, when the trials that follow the seeds were added. **On 2026-11-18 the same search took 40 to 44 s with the machine to itself** (each case 44 to 48 s whole, twice each), and both went red beside a second worker; they are tagged `@alone` and run in the suite's second pass ([the run](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-first-whole-run-of-the-two-passes)). The margin is thin even alone, and neither the wait nor the limit was lengthened to hide it. **Measured the same evening** ([the measurement](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-rings-and-the-horizon-landed-and-three-waits-mended)): the search on this picture is its seeds and 121 boundary joins, the joins the same whatever the seeds (80 seeds 41.5 and 42.4 s, 40 seeds 35.6 and 35.3 s), so the doubling since October is the joins added on November 4, a cost that was chosen, and fewer seeds would not restore the margin. What changed instead: the case of the hidden page now asks only what it promises, that trials are made again once the page is visible, and no longer waits for the search's end; it runs in about ten seconds and carries no tag. The case of the other view still waits for the end, since it judges every adoption made after the return, and keeps its tag. Both now count every trial of the search, seeds, joins and cycles' orders, where they counted the seeds alone: a pause that let a join run would have passed before.
- **On 2026-11-22 the case of the other view ran out of its 45 s wait at the gate, alone**, and was measured before anything changed ([the probe's record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/hidden-map-search/README.md)): the search paused, went on after the return and ended, so the product was not at fault, and on the same picture the day's code and the day before's made the same trials at the same cost. The repository's five files had grown from 110 cards to 114, and the joins after the seeds from 107 to 278, each adopted picture bringing joins of its own; the search after the return took 55 s. Its wait was not lengthened, since the repository would outgrow it again: the case's subject is now the estate sample's twenty C# files retained whole (29 cards, 108 wires, 24 joins), with 160 seeds, which it switches away from once a quarter of them are tried, so that a search begun anew from its first seed is told apart, and waits 20 s for the search's end where it takes some six. Every claim it made stands. Run the same evening: alone at one worker 9.6 and 10.1 s, 10.6 s in the whole spec, and 12.6 s at two workers beside `force-graph-wires.spec.ts`, so by the rule in `playwright.config.ts` it no longer earns `@alone`, and it carries neither the tag nor a minute's limit. It can still fail: with the search allowed to step while the map is hidden it went red at "no start is tried while the map is not shown" (77 trials when the view was switched, 91 after 800 ms), and with the search's resume made to do nothing it went red at its wait for the search's end, which ran out at 20 s.
- The reader-retention regression follows the [October 20 integration review](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-2). It opens a real 3D scene, inspects the subject and navigates to Knowledge Sources before pinning through the reader. The Three observation helper counts actual WebGL render calls; after any already queued frame finishes, both the pre-action baseline and the post-pin interval must remain paused. Returning to the map must resume rendering and show the pin's attention in native mesh opacities without dropping the other nodes. No application-state hook supplies the result.

Since 2026-10-31 the returning 3D picture's dimmed spheres are the frontier's, at .3 (discovery, [Turn 4 of the October 31 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-4)), which the last check reads under .35.

The case that hover attention to open text pauses the layout search went on [November 5](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-1) with hover reading: the search no longer pauses for a pointer, since a pointer draws nothing; the acted-on row is held through its moves by the ordinary rule.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`force-graph-observation.engineActivity`](./force-graph-observation.ts.mdmd.md#symbol-engineactivity)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
- [`still-picture.AT_READING_SIZE`](./still-picture.ts.mdmd.md#symbol-at_reading_size)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
