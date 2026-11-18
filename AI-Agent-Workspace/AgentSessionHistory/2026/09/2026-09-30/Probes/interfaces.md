# Interfaces from systems to files

_Design experiment, 2026-09-30, built by the root Codex agent. Follows the [shared interface discussion](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-19) and the owner's [request to continue](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-22). The owner's subsequent review found it a step down from the existing views; see the verdict below. It is not a selected replacement for the Explorer._

## Question

Can a person recognize an exposed endpoint when following it into its implementation, read the connections between individual symbols, and retain their bearings while arranging and sharing the map?

The [first probe](orientation.md) established useful movement and a neighborhood overview but lost too much detail. This experiment gives systems and files the same rows and pins: blue offers, green uses. It keeps established piece positions while opening contents or revealing another file, moves an orthographic camera between subjects, and attaches camera-facing reading surfaces to fixed bodies. Connected rows appear first; other symbols and references remain accessible explicitly. Selecting an interface fades unrelated material.

The owner's invariant is that moving a card must not make the software appear more indebted. Internal-reference counts and connection identities therefore come from the graph, independently of position. Showing internal wires reveals those references; their number is not a debt score, and these source/type references are not a runtime call graph.

## Try it

The disposable working page is `AI-Agent-Workspace/tmp/probes/2026-09-30/interfaces/index.html`. It opens directly offline. The local preview runs with:

```bash
node AI-Agent-Workspace/tmp/probes/2026-09-30/interfaces/serve.cjs 8878
```

Open `http://localhost:8878/` through VS Code's forwarded port. The root agent invoked the connected editor's remote CLI to open this preview, following the successful access route for the first probe. The owner subsequently confirmed using it. `/current/` serves the existing Explorer for comparison.

1. In **Payments estate**, inspect **Evidence** for gateway's **Offers GET api/payments/{paymentId}**. Opening evidence leaves the map still.
2. Open `Gateway/Controllers/PaymentsController.cs` from that evidence. The source card carries the endpoint row; its enclosing folders are exposed and the previous pieces remain placed. Use **Back** to return.
3. Switch to **Repository files**, then **Show internal wires** on `graph.ts`. **All symbols** exposes its complete symbol set; **other references** exposes connections beyond the starting neighborhood.
4. Compare **Flat view** with depth, or orbit. Choose **Move piece** and rearrange a card. Its graph facts should remain unchanged.
5. **Save copy**, open the downloaded HTML offline, rearrange it and save another copy. Both data snapshots and the current arrangement travel with the viewer.

**Find** reaches any file. **Open contents** reveals one level, recursively. Dragging pans by default; right-drag or the orbit controls turn the camera. Arrow keys pan and **Home** recenters. Manual panning interrupts camera travel; reduced motion goes directly to the destination. The inspector sits below the map on phones and portrait tablets.

## Evidence and limits

The page embeds the current 593-file repository graph and 35-file estate graph, their board text and the source commit `b09b6216`. The builder uses the repository's board parser and derived-board module. Wires retain underlying edge identifiers, basis, reference kind and type-only status; evidence links to both files and identifies file-level references when no source symbol is known. Documentation opens the canonical graph's authored text and symbol records. No CDN or external request is needed.

The estate starts with contract/configuration service links; **Include source references** exposes its broader dependencies. The repository starts with four related files, with the full graph available through Find and the other-reference list. These are explicit working subsets, not claims that every dependency is on screen.

The following remain unresolved:

- Wires route around projected card faces and are recomputed when the camera moves. They are not fixed cables in space. Moderate tested orbits avoid faces, but this does not prove a general 3D layout solution or separate coincident wires. Overlapping pieces can prevent a route; the underlying reference remains in the inspector.
- Opening contents adds cards and travels to them; it does not morph a shell into its contents. Dashed containment frames and breadcrumbs provide context. Zoom-driven disclosure is not implemented.
- Board regions and the declared tunnel remain accessible as board text, not spatial drawings. Directory scanning, new connection authoring and merging a returned copy are outside the probe. Saving the HTML demonstrates a portable editable arrangement, not the final product format.
- Neighboring cards can extend beyond the viewport. Long rows truncate with full text available through hover and evidence. Large all-symbol cards require panning. Keyboard controls and DOM evidence accompany the canvas, but this is not a complete accessibility evaluation.

The root agent's initial assessment was that symbol/endpoints and evidence survived the navigation experiment. The review below establishes that this did not amount to a successful navigation or visual design.

## Owner's verdict and diagnosis

In [Turn 23](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-23), the owner called the probe “really really rough.” Panning caused connectors to snap into substantially different routes; the root objects did not clearly read as directories, nor did opening them clearly communicate directory navigation. They judged navigability, appearance and feature set a step down from the cumulative Local, Force, Membrane and World Map work and asked the agent to explain its intended direction.

The agent reproduced the routing defect with six ordinary horizontal pans: 6, 7, 7, 7, 3 and 6 of the seven wires changed shape, despite unchanged piece positions. Comparison removed each path's translation and collinear intermediate points; changes were not simply the expected screen movement. The source rebuilds every wire and reruns routing in projected coordinates on every draw, without retaining route choices. Earlier checks tested intersection avoidance and graph identity, not route stability during camera motion. The observation is a design failure, not a request to accept roughness because the checks passed. Diagnostic samples remain in ignored `pan-diagnosis.json` beside the probe.

The root objects are board things backed by directories. The common card renderer gives those containers, nested folders and leaf files essentially the same silhouette. The agent conflated shared interface meanings with identical object presentation; file counts and dashed frames did not communicate containment sufficiently.

The agent initially proposed a narrower comparison of a containing object, its interface and a detailed file card. In [Turn 24](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-24), the owner asked what distinguished that from the Membrane Map. The agent acknowledged that the proposal supplied no meaningful difference and withdrew it. Readable interfaces, explicit containment and stable navigation across scales remain the intended direction; another container/card rendering does not itself advance it. Camera movement must preserve routes under ordinary pan; physical routing and readable interfaces during orbit remain design work. No new renderer is selected and no UI code changed during this diagnosis.

## Verification and captures

Disposable Playwright checks exercise actual controls at 390 × 844, 820 × 1180, 1440 × 900 and 2560 × 1440. They check unchanged camera on evidence inspection, stable existing positions on reveal, Back restoration, unchanged graph facts after dragging, preserved edge identities between flat/depth views, no page overflow/errors, reduced motion and offline saved-copy equality. All four passed. `graph.ts` retained 5 internal references, 50 external references and 10 symbols; enabling internal wires added five retained edges to the ten initially drawn between files.

Additional browser checks passed opening contents, moderate orbit, projected wire/card intersection checks, touch pan, keyboard navigation, dialog focus, reload restoration, sampled camera travel and receiving/editing/returning a saved copy. Motion samples exposed a small initial reversal: clamping elapsed animation progress corrected it. Manual input now cancels travel and the interruption check verifies that the camera stays where it was left. Earlier pictures caught a body intersecting its reading surface and a phone header overflowing; both were corrected with the assertions retained.

Selected captures, inspected by the root agent:

- [Estate interfaces](interfaces/01-estate.png): service endpoints use the same rows and pins as file symbols.
- [Endpoint implementation](interfaces/02-source.png): evidence leads into `PaymentsController.cs`.
- [Internal references](interfaces/03-internal.png): `graph.ts` with its five internal references exposed.
- [Phone source view](interfaces/04-phone.png): the inspector sits below the selected card.
- [Tablet file view](interfaces/05-tablet.png): readable rows with neighboring context extending beyond the viewport.
- [Recorded journey](interfaces/06-journey.webm): evidence, source reveal, return, file symbols, movement and save.

The working source, checks, frame samples and unselected pictures remain ignored. Superseded videos from this probe were removed after choosing the final recording. Earlier prototype families remain intact.

The full local repository gate, `npm run safe:commit -- --e2e`, passed: lint with 35 warnings and zero errors, build, 965 unit tests, 49 integration tests, Live Docs and SlopCop checks, and all 53 Playwright tests. No production source or existing assertion changed. This passing run does not resolve the intermittent exact-image reload failure recorded earlier in the session.
