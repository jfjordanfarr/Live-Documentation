# An authored board and an analytical reading surface

_Historical experiment, September 30–October 1, 2026. Built by the root Codex agent during [Turns 40–43](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-40), from source commit `ae4071cd`, followed by the saved-camera correction described below. The owner liked incoming pictures but has not given an interactive verdict. This is an attempt to compare, not a selected replacement for any Explorer view._

## Question and boundary

Can a stable structural overview and full native symbol cards share an analytical surface, while the authored World Map remains free to improve independently? The [preceding paper exercise](../2026-09-30/interaction-game.md#boundaries-that-permit-independent-improvement) supplies the responsibility boundary and counterexamples. Protecting somebody's arrangement does not establish truth precedence when authored connections and scanned evidence disagree.

The owner required matched comparisons with Local Map, Force Graph and Membrane Map, plus the estate World Map's Claude-era record. They then corrected an insufficient Membrane comparison: its distinctive capability is **symbols pinned across several files and successive hops**, not just directory browsing. That changed the implementation: retaining whole cards was insufficient; symbol selections now persist independently using the shipped Membrane pin-state functions.

## The working attempt

The ignored page at `AI-Agent-Workspace/tmp/probes/2026-09-30/analysis-surface/` serves on port 8880. It embeds the repository and C# estate bundles, imports the existing World Map and Local Map card factory, and adds no dependencies. A native saved-camera defect found during comparison was corrected separately below. Its Compare menu opens the shipped Explorer at the current subject; the Membrane link carries the actual symbol pins. The Force Graph link selects context but does not frame that file automatically.

The analytical surface has a directory-scoped overview, a scrollable reading space and a connection list. The overview contains every file in the scope plus directly connected files outside it, with an explicit count. Filled points are inside; hollow points are outside. Positions are solved once per scope and held while exploring. The initial `packages/engine/src/live-docs/` scope contains 80 files and 24 direct outside neighbors. This is a scoped graph, not an estate hierarchy or the whole repository.

Cards retain all public symbol rows, native type badges and attached test references. Each pin selection retains its file; Keep retains a file without selecting symbols. A connection opens its other file alongside those retained. Blue offers and green uses. The original graph references supply the wires and evidence, including source/target symbols when known, reference kind, type-only status and basis. Unknown source symbols remain file-level references; these are not runtime-flow claims. Reading a Live Doc uses the canonical renderer on the complete parsed document.

The first self-reference routes wrapped around cards like containers. The owner found their meaning unclear and subsequently corrected the agent's unnecessary renaming of the **French Corset**. The revision uses short paired curls at the sides, preserving the raw self-reference evidence. They are strokes rather than the Local Map's tapered polygons. This experiment does not use card placement or route shape as a debt measurement.

Cards use provider-before-consumer ordering where possible, with a deterministic fallback for cycles. Adjacent references cross the gutter; longer references use fixed upper lanes. Panning never changes those paths. Changes of selection can move cards through a short transition; reduced motion disables it. Internal Back/Forward restore subject, multiple pins, retained files, overview camera and reading position. Evidence does not change either layout. A real board drag survives entering a directory and returning.

## Matched comparisons

All main desktop captures are 1600 × 1000. The same names identify files across views; their disclosure policies differ, so card counts are not scores.

| Case | Existing view | Probe observation |
| --- | --- | --- |
| `graph.ts`, initial context | Local Map renders 19 cards around the subject, with native symbol wiring, test references and compact French Corset. Much of the consumer column extends beyond the viewport. | Starts with two complete cards, `document.ts` and `graph.ts`, and 12 raw references between them. The other relationships are reachable through overview/list. Less simultaneous detail is a real cost of the calmer picture. |
| `LiveDoc` on `document.ts` and `GraphFile` on `graph.ts`, both pinned | Membrane preserves both selections and reveals branches, including tests and further consumers. Its enclosing directories explain where those branches live. | Preserves the same two pins and aligns the selected relationship. Both full cards fit. The surrounding branches are represented as overview points and connection-list entries instead of symbol cards. |
| Five files, all symbols pinned | Membrane grows to 42 cards; 14 intersect the viewport at the recorded final camera. The lower `staticExplorerData.ts` / `staticBuilder.ts` branch is readable after pan/zoom, with all five file pin sets retained. | Five full cards, 40 pins including Internals, and all 24 raw references among them. Two complete cards fit at once; the rest require horizontal travel. Upper lanes keep long wires off intervening cards but do not make both distant endpoints visible. |
| `graph.ts` in Force Graph | Whole-workspace dependency shape, with 593 file nodes in its dataset; a selected-file URL does not make this a directory-scoped or file-centered capture. | Scoped two-dimensional overview supports selecting files while retaining a separate reading arrangement. It does not reproduce the global three-dimensional structure. |
| Dense `core.ts` | Local Map renders 42 cards; the selected file exposes 58 public symbols. Membrane browse also captured, but browse alone is not evidence about multi-pin quality. | All 58 symbols remain in the native card at reading size, accessible by scrolling. This trades simultaneous coverage for text size. |
| Estate `Gateway/Controllers/PaymentsController.cs` | Local Map renders six cards; Membrane initially shows a mostly empty directory around one collapsed file. | Full card and a selected peer, including `Gateway/Wcf/HubProxy.cs`, remain readable. This small case alone would flatter the probe and miss Membrane's main strength. |

The all-symbol sequence in Membrane was `graph.ts` → `document.ts` → `graphFiles.ts` → `staticExplorerData.ts` → `staticBuilder.ts`. Its rendered-card counts were 19, 31, 35, 39 and 42. The probe used the same five identities, with the last two reached in reverse order through its connection list; its retained-reference counts were 12, 12, 19, 22 and 24. These counts include documented references of different kinds and must not be compared to aggregated line counts in another renderer. They are a stress case, not a claim that Pin all is the best way to explore.

The estate comparison also read [the original black-box probe](../2026-09-28/black-boxes.md) and inspected the [September 29 board at rest](../../Screenshots/2026-09-29/world-map-estate-01-at-rest.png) and [built-on layer](../../Screenshots/2026-09-29/world-map-estate-09-built-on-settled.png). Closed pieces, named regions, the shared Contracts piece and connections supported by evidence are the baseline. The new composition reuses that renderer; it does not claim a redesigned World Map. Earlier pictures predate a later correction of the offer/use colors.

## A camera-restoration defect found during comparison

The first lower-branch capture reopened the five-pin URL with its saved non-default camera. Cards initially rendered at scale 1, but wire measurements were divided by the saved scale. Subsequent pan/zoom applied the camera without repairing those already-wrong wire coordinates. The resulting detached connectors were an implementation defect, not evidence that the directional layout inherently fails.

The correction in `membraneView/index.ts` applies the current transform at the start of rendering, before card or wire measurement, and removes a redundant later application in snapshot restoration. A new Playwright regression opens two pinned symbols with translation `(80, -120)` and scale `0.65`, checks the rendered camera and wire-to-pin proximity, then reloads and verifies camera and pins persist. It failed before the fix (`transform: none`) and passed afterward. Regeneration updated the test's Live Doc with its `lz-string` import; no new dependency was added. The [before/after gallery](../../Screenshots/2026-10-01/README.md) preserves the defect and the corrected same-camera comparison. The retained lower-branch comparison uses the corrected build.

## What this establishes, and what it does not

The experiment makes authored arrangement and analytical navigation independently manipulable without losing shared file identity. Exact pins can also transfer into the existing Membrane Map. That is a working boundary, not evidence that two presentations are the final architecture.

The finite-space counterexample survives: five full cards do not fit merely because a second representation of them exists nearby. The overview preserves a stable place for each identity, while the reading surface exposes exact details sequentially. Whether that division is intuitive enough is still a human judgment. Directory grouping is more explicit in Membrane, and its simultaneous branching neighborhood is substantially richer than this reading strip. The strip can become a long ribbon with remote endpoints, and a tiny overview cannot identify every file without interaction. Neither overview dots nor hidden full cards count as simultaneous symbol-level understanding.

The hypothesis worth carrying forward is **independent presentation with shared exploration state**. The unresolved comparison is whether a richer arrangement of several retained branches can improve on the strip without losing readable cards, stable routes or orientation. This attempt does not evaluate force-positioned full cards, solve arbitrary depth, add cross-scale pathfinding, classify debt, author new connections, or implement receive/edit/return sharing. Existing capabilities and stretch goals remain in the [boundary comparison](../2026-09-30/interaction-game.md#boundaries-that-permit-independent-improvement).

## Verification

Focused Chromium checks passed at 1600 × 1000, 820 × 1180, 390 × 844 and 2560 × 1440. They exercise actual symbol, connection, Keep, Read, search and Back controls; all symbol rows and raw references among displayed cards; canonical Live Doc round-trip; unchanged overview positions during pinning; invariant wire routes under scroll/pointer pan; restored multi-pin/camera/scroll state; and board-placement isolation. Selected-label clipping, page overflow and page errors were checked. This is not a general proof of readability or accessibility. A phone symbol target measured 234 × 34 CSS pixels; only one full card can be read at a time there, and tall cards scroll.

A final recorded journey exercises evidence, overview pan, retained cards, board dragging, directory entry/Back and the estate. A separate one-second animation sample saw 60 frames and 19 distinct intermediate vertical card positions, with a maximum sampled gap of 33.4 ms. This establishes that the tested move had intermediate positions, not a performance benchmark or a human verdict on orientation. A three-card route check found no intersection with an unrelated card's body in that state; it does not certify arbitrary graphs.

`npm run safe:commit -- --e2e` passed lint (35 warnings, zero errors), build, 965 unit tests, 49 integration tests, generation/lint over 593 unchanged Live Docs, and documentation audits. **Playwright passed 52 of 53.** The unchanged `pin-active layout is pixel-stable across page reload` assertion failed:

```text
Pixel buffer sizes should be identical across renders (got 153013 vs 153041)
Expected: 153041
Received: 153013
```

Both failure PNGs were attached. Decoding this pair found 32 differing pixels, all at the sidebar checkbox edges, within x=20–35 and y=432–481, with maximum per-channel difference 1/255. Diagram pixels match in this pair. This is a different result from the earlier five-pin-edge-pixel reproduction; neither establishes the underlying painting cause. At that point no check, threshold, test or product source had changed. That initial full gate failed; the complete run after the camera fix is recorded below. The camera fix does not establish the cause of this separate checkbox discrepancy. The PNG SHA-256 values are `7c335fd51e3a4e38543320be36ac0f33fda812a45f9b24e0c676f1729369c42c` and `11f1c2cae32b27dd803dafe0ed793fd95ba76e79dcd53d75ae6fc88e5a32ede9`. Local diagnostic output is `/tmp/live-docs-analysis-surface-reload-diff.json`; the full log is `/tmp/live-docs-analysis-surface-safe-commit.log`.

The complete run after the camera fix again passed lint (35 warnings, zero errors), build, all 965 unit and 49 integration tests, generation/lint and documentation audits. **Playwright passed 53 of 54**, including the new camera regression and existing history/estate checks. The same exact-image test failed with PNG lengths 153118 versus 153145. Decoding this pair again found 32 pixels within the sidebar checkbox bounds, with maximum channel difference 1/255; the diagram matches. The full gate therefore still fails on the unresolved painting discrepancy. The new run is `/tmp/live-docs-analysis-surface-camera-safe-commit.log`; its image analysis is `/tmp/analysis-surface-camera-reload-diff.json`. Inbound dependency-path JSON for the corrected controller is byte-identical before/after. Direct links and headings passed across seven affected documents, including normally excluded archives.

## Retained pictures and motion

These files preserve distinct observations; intermediate and duplicate captures are disposable. Directory browse and dense/estate interior cases were also inspected, with their findings recorded above.

| Capture | What it records |
| --- | --- |
| [Two pinned symbols in the probe](analysis-surface/01-probe-two-symbols.png) | Native cards, persistent selections, exact selected relationship and French Corset. |
| [The same two pins in Membrane](analysis-surface/02-membrane-two-symbols.png) | Multi-focus detail and branching context, opened by the probe's Compare link. |
| [Local Map at graph.ts](analysis-surface/03-local-map-graph.png) | The established file-card baseline and its wider immediate neighborhood. |
| [Force Graph at the same file context](analysis-surface/04-force-graph.png) | Whole-workspace shape; not an equivalent directory camera. |
| [Five pinned files in the probe](analysis-surface/05-probe-five-pins.png) | Readable cards, long upper routes and offscreen endpoints. |
| [Five pinned files in Membrane](analysis-surface/06-membrane-five-pins.png) | Expanding neighborhood at the final pinning camera. |
| [Membrane's lower branch after pan and zoom](../../Screenshots/2026-10-01/membrane-saved-camera-after.png) | Readable staticExplorerData/staticBuilder area with the five pin sets preserved. |
| [Expanded probe overview](analysis-surface/08-probe-overview.png) | Same identities in the scoped structural presentation. |
| [Phone reading surface](analysis-surface/09-probe-phone.png) | Fixed reading size and the cost of moving between endpoints. |
| [Estate board in the probe](analysis-surface/10-estate-board.png) | The unmodified World Map renderer inside the new composition. |
| [Pointer journey](analysis-surface/11-journey.webm) | Interaction and movement accompanying the mechanical assertions; not a claim of owner review. |

After retaining the selected evidence, 55 duplicate/intermediate capture files and superseded diagnostic scripts were removed from this experiment’s ignored directory (19,774,087 bytes). The page, build source, substantive check scripts and structured measurements remain ignored for local review. The probe has been opened through VS Code's preview workflow. No production view was replaced or retired; the camera correction repairs the existing Membrane Map.
