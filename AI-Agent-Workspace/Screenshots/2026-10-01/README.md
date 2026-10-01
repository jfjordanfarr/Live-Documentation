# Explorer inspection: October 1, 2026

_Historical visual record from [Turn 43](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-43). The root agent found and corrected a Membrane saved-camera defect while comparing the [analytical-surface experiment](../../Probes/2026-10-01/analysis-surface.md) against multi-file symbol pinning._

Both images use the same five-file pin set (`graph.ts`, `document.ts`, `graphFiles.ts`, `staticExplorerData.ts`, `staticBuilder.ts`) and the same saved URL followed by real wheel pan/zoom to the lower branch. Viewport: 1600 × 1000. Pointer moved to the header before capture to remove transient hover dimming.

- [Before](membrane-saved-camera-before.png): reopening the saved non-default camera renders cards at scale 1 but measures wires against the saved scale, leaving connectors detached. Later pan/zoom does not repair the stored coordinates.
- [After](membrane-saved-camera-after.png): the camera is applied before measuring/rendering. Wires meet their pins in the same scene. Long crossing connections and offscreen endpoints remain legitimate layout challenges; this repair does not resolve them.

The new `membrane-url-state.spec.ts` regression failed with `transform: none` before the change and passed afterward. It checks the saved camera, cable-to-pin proximity, reload and both retained symbols. The full local gate is reported in the experiment's verification section; this correction must not be confused with the separately observed exact-image checkbox discrepancy.

## The still-picture instrument, the same afternoon

_From [Turn 4](../../ChatHistory/2026/10/2026-10-01.1.record.md#turn-4): the first run of the instrument defined in [the still-picture deck](../../Probes/2026-10-01/still-picture-deck.md), and the two defects it found and the session fixed. Root agent: Claude Fable 5.1. Viewport 1600 by 1000; the pictures are the instrument's own, taken by `tests/e2e/still-picture.spec.ts`._

- [The Local Map at `graph.ts`](still-picture-local-map-graph.png): the measured state of the repository run. Scale 1, not the 0.6 floor the deck predicted; the fit centers on the subject and lets the dependents column run off the frame. 4 of the 15 facts in scope are legible, 6 are drawn but off frame, 5 are not drawn because they do not touch the selected file.
- [The Membrane Map with every symbol of five files pinned](still-picture-membrane-five-files.png): 42 cards, 7 in frame at the default camera, 2 of 15 facts legible, 13 drawn but off frame, 3 of 207 wires crossing a card they do not end at. The column labels call `graph.ts`, a pinned file, a dependent, because pinned files at depth one share the dependents' column.
- [The subject stays put when a symbol is pinned](local-map-pin-subject-stays-put.png): the Local Map after pinning `GraphFile` on `graph.ts`. Before the fix in `localView/controller.ts`, collapsing the neighbors' unrelated rows re-centered the columns and moved the selected card 862 px off the frame, and unpinning left it 692 px from where it started; after it, 0 and 0. The two consumers in frame are lit; three more sit below the frame.
- [Symbol names wrap instead of clipping](membrane-symbol-names-wrap.png): the estate's `PaymentService/App.config` pinned in the Membrane Map. Its address symbol `net.tcp://payments.onprem.example:8732/PaymentService` was cut off by 39 px until the labels took the Local Map's wrapping rule.
- [The detail panel covers the answer](still-picture-estate-membrane-journey.png): the estate journey that asks which files use `IPaymentService`. The pin finds all four consumers in the dependents column, and the panel that opened when the card was selected sits over them, so the instrument counts 0 of 4 legible. Not fixed; a design question for the owner.

## The expanded deck, that evening

_From [Turn 8](../../ChatHistory/2026/10/2026-10-01.1.record.md#turn-8): the nine measures the owner's reading of the first scoreboard added, the chain scope, and what the second scoreboard found. Root agent: Claude Fable 5.1. Viewport 1600 by 1000; the instrument's own pictures, except the first, which a disposable overlay took._

- [What the crossings measure counts](still-picture-crossings-local-map.png): the Local Map at `graph.ts` with every counted crossing point drawn in red. All 162 sit in the fan where twenty wires leave the subject's ten pins; 3 are more than 80 px from a pin. The overlay was how the measure was checked by eye before its numbers were trusted; the probe record holds the same picture for the ring.
- [The Membrane's columns are hops, not direction](still-picture-membrane-dependents-columns.png): the repository's five files pinned, columns labelled Pinned, Dependents, 2-hop, 3-hop. A file one hop away may provide or consume, so 110 of 208 wires run leftward against the view's own grammar.
- [The path mode draws the grammar backward](still-picture-local-map-path-mode.png): the estate's path from `GatewayClient.cs` to `IPaymentHub.cs`. FROM depends on TO, the path runs left to right, and every wire leaves a dependent's right edge to enter its dependency's green "uses" pin; 0 of 4 flow.
- [Clear does not bring the subject back](still-picture-local-map-after-clear.png): the repository after the path from `index.ts` was cleared. The view is `index.ts` selected again, scrolled to the top of a twenty-five-card dependencies column, with the subject 3,846 px below the frame.
- [The Membrane's own walk along a chain](still-picture-membrane-chain-walk.png): pin all of `index.ts`, then of `compressed-url-state.ts` as it appears, then of `pin-state.ts`. Three hops drawn at the folder's fitted scale, every name under 9 px, the first file carried 1,755 px: the camera question from the first scoreboard, met again.
