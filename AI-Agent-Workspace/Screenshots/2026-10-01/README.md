# Explorer inspection: October 1, 2026

_Historical visual record from [Turn 43](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-43). The root agent found and corrected a Membrane saved-camera defect while comparing the [analytical-surface experiment](../../Probes/2026-10-01/analysis-surface.md) against multi-file symbol pinning._

Both images use the same five-file pin set (`graph.ts`, `document.ts`, `graphFiles.ts`, `staticExplorerData.ts`, `staticBuilder.ts`) and the same saved URL followed by real wheel pan/zoom to the lower branch. Viewport: 1600 × 1000. Pointer moved to the header before capture to remove transient hover dimming.

- [Before](membrane-saved-camera-before.png): reopening the saved non-default camera renders cards at scale 1 but measures wires against the saved scale, leaving connectors detached. Later pan/zoom does not repair the stored coordinates.
- [After](membrane-saved-camera-after.png): the camera is applied before measuring/rendering. Wires meet their pins in the same scene. Long crossing connections and offscreen endpoints remain legitimate layout challenges; this repair does not resolve them.

The new `membrane-url-state.spec.ts` regression failed with `transform: none` before the change and passed afterward. It checks the saved camera, cable-to-pin proximity, reload and both retained symbols. The full local gate is reported in the experiment's verification section; this correction must not be confused with the separately observed exact-image checkbox discrepancy.
