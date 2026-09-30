# Keeping your bearings between files

_Design experiment, 2026-09-30. Built by the root Codex agent from the owner's [orientation requirement](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-16). This is a bounded file-scale probe, not a replacement for a shipped view or a settled design._

## Intention

Following a connection should let a person recognize the file they left, the connection they followed, and the file they reached. Reading evidence should leave the map where it was. Returning should restore the viewpoint, including a manual pan. A still picture cannot establish any of those temporal properties on its own.

The experiment holds file positions fixed and moves one camera through them. All cards, pins and wires share the same transform. New neighbors extend the working map without relocating existing files. A locator and recent-file controls preserve a route back. Offscreen connections have named controls outside the canvas so their labels do not cover the drawing. On phones and portrait tablets, the inspector sits below the map; its space stays reserved when its contents change.

This is the root agent's first original probe after inspecting a small sample of the eleven interrupted navigation families. The bottom inspector and legible evidence list have useful precedents in that sample. It is not a claim to have completed the review of all eleven.

## Try it

The disposable page is `AI-Agent-Workspace/tmp/probes/2026-09-30/orientation/index.html`. Open it directly for an offline, standalone probe. For the live comparison with the current Explorer, run from the repository root:

```bash
node AI-Agent-Workspace/tmp/probes/2026-09-30/orientation/serve.cjs 8877
```

Open `http://localhost:8877/`. The footer opens the current Explorer's Local Map at the selected file, served from the existing `dist/explorer/` build. The server handles only the probe directory and that build.

The owner initially received `ERR_CONNECTION_REFUSED` at that address. The server returned HTTP 200 inside the container; the VS Code remote CLI then opened it through the connected editor, and the owner confirmed seeing and using the page. If the port is not forwarded in a later session, use VS Code's Ports view to forward 8877 and open the resulting address. The standalone `index.html` can also be saved/opened locally and needs no server; the comparison with `dist/explorer/` uses the server.

1. Start at `packages/engine/src/live-docs/graph.ts`.
2. In **Used by**, inspect **Evidence** for `staticExplorerData.ts`. The map should stay still.
3. Open `staticExplorerData.ts` from the evidence. Follow the camera while the former subject remains recognizable.
4. Go **Back**. The prior view and evidence return. Pan first and repeat to compare the restoration.
5. Switch **Travel** between **Continuous** and **Instant** and repeat the same journey. The geometry and data are identical under both choices.

**Find a file**, clickable map cards, connection lists, named offscreen connections and recent-file controls provide alternate routes. Drag or arrow keys pan; **Home** or **Recenter** returns to the selected file. Reduced motion uses the same destinations without camera travel. Live Docs and symbols open in a dialog whose focus returns to its opener.

## What the picture knows

The standalone page embeds a snapshot of all 593 files in the current derived `.mdmd/index.json`, plus their source Live Docs, at source commit `2a5e61b8`. It makes no runtime network requests. `build.py` rebuilds it from those local files; it creates no new product data model or inferred dependencies.

The first neighborhood places up to three providers and three consumers. It ranks implementation files before tests, then by inbound count and path; the complete connection lists and explicit placed/total counts remain available. Navigation places additional neighbors. Tests and unplaced files remain in the data and lists. Edges show their recorded kind, type-only flag, basis where present, and originating symbol where available. A dependency, especially a type-only import, does not establish runtime execution order.

## Boundaries

- This tests continuity at file scale. Symbol-row wiring, folder containment, the World Map and scale transitions remain outside this build. The original Local Map carries richer symbol information in one image.
- A fixed working map trades compactness for spatial memory. Large neighborhoods, dense cycles, very long journeys and accumulated crossings need further design.
- A phone shows less of the neighborhood at once. Named offscreen connections and the inspector make the rest reachable; this does not prove equal still-picture information at every size.
- Reserving space for evidence prevents a panel from moving the map, but costs canvas area. The probe makes that tradeoff visible rather than claiming it is settled.
- History preserves the local arrangement and viewpoint through reload within the tab. A copied file address identifies the file; it does not serialize the whole working arrangement for another person.
- Browser checks establish geometry and interaction behavior; the owner's verdict below is the qualitative comparison. Broader real-device comfort remains open.

## Owner's verdict

The [first review](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-18) confirms that the movement and Neighborhood minimap help: “Yeah the movement around is very nice.” The owner connected the minimap to a familiar node-and-folder overview in BMC Control-M.

They also identified the limitation: “What the totality of the Local Map and Membrane Map try to convey are more detailed than that.” At this level of information, the force graph supplies the same facts and may be superior when this probe's wires cross over nodes. This is acceptance of a navigation mechanism, not approval to replace a richer view with the simplified cards. The next comparison must carry symbol-level wiring and folder structure through the same continuity and address crossings over cards. Those remain outstanding design work.

## Verification and pictures

The disposable `check.cjs` exercises actual controls at phone (390 × 844), tablet (820 × 1180), laptop (1440 × 900) and wall (2560 × 1440) sizes. It checks stable existing positions, unchanged camera and selected-file bounds on evidence inspection, actual intermediate movement, restoration after panning, readable card dimensions, page overflow, page errors, contacted hosts, reduced motion and direct-file opening. `check-interaction.cjs` additionally samples camera positions, interrupts travel, resizes the viewport, reloads history, pans with touch, checks focus, and opens the actual current Explorer for comparison.

All four viewport journeys passed. The interaction check recorded 47 frames with 40 distinct camera positions, with monotonic progress and no overshoot; it passed resizing, interrupted travel, reload restoration, touch pan/tap, dialog focus and invisible-tab-stop checks. Both the standalone file and current-Explorer comparison opened successfully. The initial comparison check used a nonexistent `.local-node` selector; correcting it to the actual `.node-card.local-focus` exercised the current view successfully. No assertion was relaxed to obtain a pass.

Selected captures, inspected by the root agent:

- [Current Local Map, same file](orientation/00-current-local-map.png): richer symbol detail, retained as the teacher and comparison.
- [Laptop probe](orientation/01-laptop.png): the fixed neighborhood around `graph.ts`.
- [Phone evidence](orientation/02-phone-evidence.png): the map remains in place while the recorded type-only dependency is read below it.
- [Portrait tablet](orientation/03-tablet.png): the inspector sits below the map; some neighboring cards extend beyond the viewport.
- [Recorded journey](orientation/04-journey.webm): actual browser navigation, evidence inspection and return. Review this or the runnable page for motion; the still captures alone do not establish how the transition feels.

Working checks, frame samples and the disposable page remain in ignored tmp. Superseded videos from this experiment were removed after selecting the final recording. The eleven earlier prototype families remain intact for further review.

The full repository gate, `npm run safe:commit -- --e2e`, passed after the probe was built: lint (35 warnings, zero errors), build, 965 unit tests, 49 integration tests, all 593 Live Docs, SlopCop audits and all 53 Playwright tests. The earlier intermittent exact-image reload failure remains in the session record; this passing run does not establish that it was fixed. No product implementation or existing test assertion changed in this experiment.
