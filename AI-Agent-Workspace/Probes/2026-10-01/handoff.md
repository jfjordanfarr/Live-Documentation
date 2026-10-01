# Board and scope handoff

_Historical design probe, October 1, 2026. This records an experiment, not an adopted Explorer architecture. Root agent: Codex. The owner's request and the agent's checkpoints are preserved in [Turn 44](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-44)._

The owner liked the [analytical workspace](analysis-surface.md), particularly its readable cards and minimap, while identifying wires hidden beneath destination cards and excessive text on action buttons. They asked for another probe exploring its relationship with the World Map. Their competing possibilities remain variables: spatial outside/abstract inside, or representations usable at multiple scopes. They also confirmed that the Force Graph's absent file focus is a standing defect.

## Hypothesis and historical counterexamples

A change of presentation need not be a change of scope. An authored board can stay spatial while an analytical workspace reads either systems' interfaces or files' symbols. They share identities and evidence without sharing a coordinate system. The owner accepted the authored-placement/computed-presentation boundary, not this particular implementation.

The [paper comparison](../2026-09-30/interaction-game.md#boundaries-that-permit-independent-improvement) supplies the responsibility boundary and explicit costs. The [failed depth probes](../2026-09-30/depth.md) supply counterexamples: edge-on cards lose identity; directory corridors hide cross-branch relationships; camera continuity alone does not compose a useful scene. The September board already experimented with opening a lid into an interior panel. This probe instead moves the whole, still-live board into a persistent context surface. It does not turn a system into a literal room or assume exactly two levels of containment.

## What was built

The native World Map contracts into a light thumbnail in the analytical sidebar. Returning expands the same instance, with its camera and authored positions intact. The transition crops empty viewport margins; it does not reroute the native board. A marker and system name identify the current file's owning thing. The dark dependency minimap remains a computed survey of the current scope.

The analytical surface now has system cards as well as native file cards. A system's card lists its documented interfaces; its folder action opens the scanned files. Directories have a folder glyph, a child-directory list and clickable breadcrumbs. File scopes can descend repeatedly while outside connections remain available. The nearest authored board remains the spatial context. No spatial placement is fabricated for unboarded directories, and arbitrary nested authored boards are not implemented.

System cards derive from the same parsed board, board join and World model as the native view. The estate has ten piece-to-piece relationships supported by 44 raw graph edges; aggregated relationships retain those edges for inspection. The declared region crossing remains on the board and is not treated as a source-code call. Selecting evidence can open the underlying file or canonical Live Doc. No synthetic system Live Docs or claims of runtime traffic are introduced.

Repeated card actions use icons with accessible names, keyboard activation, pressed state where applicable and hover/focus explanations. Entity names, symbol names, file paths and evidence remain readable. Long cables stay behind cards, with short foreground segments joining the actual pins across their own card's padded edge. These segments avoid symbol text. The **French Corset** remains paired short curls for self-references; the underlying raw references remain inspectable.

The working page is disposable and ignored at `AI-Agent-Workspace/tmp/probes/2026-10-01/handoff/`. Build with its `build.cjs`, serve with `serve.cjs 8881`; `index.html` embeds the existing repository and estate bundles. This is a probe over production data and renderers, not a production view replacement. The source baseline is commit `327e1f99`.

## Journey and costs

| Starting point | Action | Result and preserved context |
| --- | --- | --- |
| Estate board | Double-click gateway | System interfaces; the live board docks. On a phone, select the piece then use Analyze. |
| Gateway interface card | Folder icon | Gateway's scanned files; the same board remains in the corner. |
| A directory | Child-folder button or breadcrumb | New analytical scope; outside references remain available. Five successive directory levels and Back were exercised. |
| Gateway's connection to hub | Evidence, then exact source references, then Source Live Doc | Three button activations to inspect the actual configuration evidence without rearranging either map. |
| Any analytical scope | Board thumbnail | The same authored board and camera return; the analytical subject, pins and reading state remain recoverable. |
| A retained card offscreen | Named card tab | Scroll to that card without resizing its text. This still costs travel and does not make all branches simultaneously visible. |

The two system cards use the same offers/uses grammar as the file cards, but the ordering is computed. It does not overwrite the user's board arrangement or imply that board placement determines evidential precedence.

## Pictures and comparisons

| Capture | What to inspect |
| --- | --- |
| [System interfaces](handoff/01-interfaces.png) | Gateway and hub, native-style cards, compact controls, authored and analytical context together. |
| [Directory opened](handoff/02-folder.png) | Gateway's files and recognizable subdirectories; no literal doorway or corridor. |
| [Cross-system configuration](handoff/03-cross-system.png) | `Gateway/Web.config` using an endpoint in `Hub/App.config`, with terminals reaching their pins. |
| [Two pinned symbols](handoff/04-two-symbols.png) | `GraphFile` and `LiveDoc`, matching the prior comparison; tests and French Corset retained. |
| [Phone reading position](handoff/05-phone.png) | A full-width card reached through its tab; other cards remain available through scrolling and named tabs. |
| [Motion recording](handoff/handoff.webm) | Pan the board, change presentation, open a folder, inspect a cross-system call, open evidence and return. |

Use the [prior native Local, Membrane, Force and World comparisons](analysis-surface.md#matched-comparisons) as the baseline; duplicating their committed images adds no new evidence. This turn again opened the native Membrane Map with the exact two-symbol pin set and inspected its capture. Its five-file branching neighborhood remains the stronger simultaneous survey: the probe retains five full cards and 24 raw relationships among them, rather than presenting Membrane's 42-card neighborhood. The native Force Graph still provides whole-workspace shape, not an equivalent focused camera. The [estate board reference](analysis-surface/10-estate-board.png) is the same production renderer used here, with its known depth-order limitations.

## Verification and limitations

Focused Chromium journeys passed at 1600×1000, 820×1180, 390×844 and 2560×1440. They exercise real board dragging, desktop double-click/phone explicit handoff, file search, cross-system references, evidence, Back, exact board text/camera preservation, two persistent symbol pins, card icon labels, complete wire/terminal counts and route stability under reading-pane panning. The phone run uses reduced motion. Text truncation checks cover card names, paths, symbols and connection rows; they do not declare the native phone board legible.

A separate depth journey passed five successive directory levels and Back; exact pin transfer to the native Membrane Map; five retained files, 40 symbol pins and 24 raw references; retained scope, camera, scroll and pins across presentation changes; and system-to-raw-source evidence. Sampling the foreground terminal segments found no intersections with symbol-label boxes. This checks the local pin fix, not arbitrary global cable crossings.

Keyboard controls, visible focus tooltips, inactive-surface focus exclusion, rapid reversal of the handoff and zero-duration reduced-motion transitions also passed.

The motion run samples intermediate transform frames, verifies that the native camera matrix stays identical throughout the handoff, and checks the panned board and authored text after the complete return. These invariants support continuity; the owner's perception remains the test of whether the transition actually preserves orientation.

The first cross-system test incorrectly looked for a configured call in `HubProxy.cs`; graph inspection located it in `Gateway/Web.config`. The test was corrected to the actual source. The initial phone double-click failed because the native popover interrupted the gesture. The explicit Analyze control now uses the selected board piece; the native phone board still has crowded labels and small piece targets. This probe does not claim to fix those defects.

Remaining design costs: two context maps consume sidebar space, full cards still require horizontal travel, system-region hierarchy is not yet an analytical grouping, and no nested authored-board editor or snapshot comparison was added. World Map wire depth remains unchanged. The World Map could improve doors and depth ordering independently while the analytical workspace improves simultaneous branching and detail; shared identity, evidence and navigation state carry the handoff. The two presentations may coexist without forcing a universal renderer, but neither this probe nor its passing checks selects that architecture.

The full `npm run safe:commit -- --e2e` chain passed: lint (35 warnings, zero errors), build and test type checks, 965 unit tests, 49 integration tests, generation and lint of 593 unchanged Live Docs, documentation/asset/heading audits, and all 54 Playwright tests. The previously intermittent exact-image reload test passed on this run; this does not establish the cause of its earlier pixel discrepancy or claim a cure. The log is `/tmp/live-docs-handoff-safe-commit.log`. A final probe-only correction preserves keyboard focus when card contents refresh; its focused control check passed. Direct link/heading checks also cover all six changed Markdown files, including the chat archive. No production source changed for this probe.
