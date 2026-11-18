# tests/e2e/force-graph-update.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-update.spec.ts
- Generated At: 2026-11-13T15:57:49.242Z

## Authored
### Purpose
Holds the 3D Local Map's membership updates to their visible contract: placement alone moves no existing sphere and ticks nothing, full and gentle updates settle and stay still, newcomers begin beside their connections, and surviving lines keep their objects. Written for the membership-update work in [the change-over-time plan](../../../layer-3/change-over-time.mdmd.md#open-questions), 2026-10-18.

### Notes
The first journey selects perspective nodes explicitly before deriving physical spring rest lengths from rendered radii. Zoom resistance changes their displayed size without changing those lengths. The second retains normal appearance defaults, and checks a tether increment against the slider's actual starting value and step. These distinctions were made explicit during the [October 24 visual tuning](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-24/2026-10-24.1.record.md#turn-12), which changed both sizing and the default tether.

**Original October 18 contract, historical:**
The stage is this repository's bundle in the connections layout at a modest viewport, where Show Tests brings 213 spheres in and out; the estate sample could not serve, since its related-doc links all target Live Docs, which the spatial projection leaves out, so a toggle there changes no membership. The first test opens with the tests hidden at energy zero, so showing them is a change with births: after it every unchanged sphere's rendered position is exactly what it was, the container was never busy, and each born sphere wired only to spheres that already stood stands at the mean of its springs' rest lengths from their mean position, read from the rendered spheres and lines, which is the page's placement rule and not the origin where D3 would seat it; hidden again, nothing else moves. The second opens at energy one, marks every line's object, toggles the tests out and reads the ticks as the frames between the container saying busy and saying settled (`settleTicksOf(1)`, three hundred, with three frames of slack for the library's deferred update and its stopping frame), the unchanged spheres' mean move, and that every line among the spheres that stayed kept its object; then it brings the tests back at full energy, sets the energy to a tenth by the slider under Tuning as a person would (which stirs nothing), toggles them out again and holds the gentle update to two hundred ticks and to less than six tenths of the full reheat's stir (the page measured 0.42 on 2026-10-18; a share not applied would give about 0.9), and the setting to the address and the container's layout settings. The ticks are predicted by the same pure function the page's schedule is built from, so the page and the lab's twin cannot disagree about them without this spec saying so. The Notes first described the estate as the stage, before the builder found it could not serve; corrected the same day.

Since 2026-10-21 the second test holds the motion ([Turn 5](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-5)): a change at full energy and one at half each come to rest, counted as frames between busy and still, and once the container says still, two readings of the scene half a second apart find every sphere where it was; the lines keep their objects; the energy slider stirs nothing and rides the address; the tether's slider starts at the shipped value, rides the layout settings, and a new tether unfolds the picture and lets it come to rest. That a lower energy moves more gently is left to the unit tests, which show it exactly, since in the page a gentler path to the same rest need not take more ticks (251 frames at half against 272 at full for one toggle, measured that day).

Since 2026-10-31 (discovery, [Turn 4 of the October 31 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-4)) the entry opens the root, so that the change moves the whole repository's spheres as the measure wants; the whole enters from one sphere and settles on screen in some eighty seconds of the software renderer, where the first piece's hidden warm-up once took a third of the ticks unseen, so the settle allowance is 150 seconds.

**Measured on 2026-11-11** ([Turn 5 of the November 10 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-10/2026-11-10.1.record.md#turn-5)), alone on an idle machine, with a temporary probe of the second test's journey: the whole root with tests is 955 spheres and enters in 111.5 s over 494 frames (4.4 frames a second); hiding the tests at full energy takes 26.0 s (146 frames, 661 spheres left); showing them again 52.1 s (220 frames); the fifty slider steps 12.8 s; hiding them at half energy 28.1 s (166 frames); the tether's change 18.6 s (107 frames). The five settles alone are 236 s against the test's 240 s, before any of its own readings, so at that frame rate the test cannot pass; on November 8 it passed in 3.4 minutes. Its time grows with the repository's file count and falls with the renderer's frame rate, and its budget does neither. The budget was not changed: what should bound the test is an open question put to the owner on [October 30](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-30/2026-10-30.1.record.md) and since.

**Measured again on 2026-11-11, 10:22 to 10:40 UTC**, after the day's fourth gate run failed this case alone, 378 of 379, this time at its first wait: the whole repository had not settled in the 150 s `settled` allows. The same address, alone, the machine otherwise idle, timed from the page's load to stillness:

| Code | Data | Seconds | Frames | Frames a second |
| --- | --- | --- | --- | --- |
| The round's working tree | The round's (2,377 wires) | 165.0, 163.9 | 641, 641 | 3.88, 3.91 |
| `9bdbf7cd`, built apart | `9bdbf7cd`'s (2,376 wires) | 153.6, 158.2 | 608, 616 | 3.96, 3.89 |
| `9bdbf7cd`, built apart | The round's | 167.7 | 646 | 3.85 |

The night before, the same code and data as the second row settled in 111.5 s over 494 frames at 4.4 frames a second. So on this day the case fails on the commit it passed its neighbours on: the machine draws about a tenth fewer frames a second, and the settle takes a quarter more frames, which shows that the frames a settle takes are not fixed by the code and the data. The round's code draws at the old code's rate, and over the same data takes the same frames (641 against 646): the round did not slow this picture, which has no wrapper in it. No wait or budget was changed. What should bound this case is still the owner's question of October 30.

**Two bounds on coming to rest, since 2026-11-13.** The owner answered the question on November 12 ([Turn 3 of the November 12 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/2026-11-12.1.record.md#turn-3)): bound the wait in drawn frames, and keep the clock red: "I personally like that this keeps going red because it literally makes the perf a red-hot sticking point"; "A is a good idea though. I just don't want to see that urgency of bad perf going away." So the second test's five settles wait through `cameToRest` in [the observation instrument](force-graph-observation.ts.mdmd.md) under two bounds. The bound in drawn frames is hard: past it the picture is not coming to rest, whatever the machine. The clock is soft and keeps its figures, 150 s for each settle and 240 s for the case: on a slow machine the case still ends red, by the clock alone, after it has checked every reading at rest, so nobody has to rerun it to learn whether the picture was right. The hard timeout is only a net for a page that stops drawing: every frame bound at a pessimistic two frames a second, and a minute more (1,735 s). The first test keeps its own 150 s wait unchanged.

Measured on 2026-11-13, 15:25 to 15:35 UTC, in a run of the case as built but for the return's bound (then 600), while a recomputation of the repository's history ran three processes beside it (load average about 18 on twenty hardware threads); frames are counted from each wait's start, which for the tether is after the slider's change was seen in the layout settings:

| Settle | Frames | Seconds | Frames a second | Frames, November 11, idle | Bound |
| --- | --- | --- | --- | --- | --- |
| The whole repository enters | 556 | 232.6 | 2.39 | 494 to 646 | 1,300 |
| The tests hidden at full energy | 146 | 41.0 | 3.56 | 146 | 450 |
| The tests shown again | 372 | 162.4 | 2.29 | 220 | 800 |
| The tests hidden at half energy | 163 | 47.6 | 3.42 | 166 | 450 |
| A new tether | 110 | 29.4 | 3.74 | 107 | 350 |

The case took 552.8 s, and failed by the clock alone: the entry's 232.6 s and the return's 162.4 s against 150 s, and the case's 552.8 s against 240 s; every other expectation held. A loaded machine takes more frames to the same rest where spheres enter (the return took 372 frames against 220 idle), so each bound is at least twice the most frames measured idle or loaded: the repository's growth by a few dozen files adds a few percent (the entry went from 472 to 592 ticks as the repository grew toward 900 spheres in October), and a picture that never rests is caught within about six minutes at four frames a second, the longest bound being the entry's.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`forceGraphLayout.QUIET_TICKS`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-quiet_ticks)
- [`force-graph-observation.cameToRest`](./force-graph-observation.ts.mdmd.md#symbol-cametorest)
- [`force-graph-observation.caseClock`](./force-graph-observation.ts.mdmd.md#symbol-caseclock)
- [`force-graph-observation.engineActivity`](./force-graph-observation.ts.mdmd.md#symbol-engineactivity)
- [`force-graph-observation.markRenderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-markrenderedlinks)
- [`force-graph-observation.markedRenderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-markedrenderedlinks)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
