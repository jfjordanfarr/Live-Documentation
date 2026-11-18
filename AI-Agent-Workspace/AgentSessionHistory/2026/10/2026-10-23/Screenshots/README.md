# Explorer firsthand review — October 23, 2026

Historical observations of the locally built Explorer, requested in [the session's opening turn](../../ChatHistory/2026/10/2026-10-23.1.record.md#turn-1). Codex personally navigated and inspected these captures before reading the implementation. This is a visual and interaction review, not a source diagnosis or an approved redesign.

Built with `npm run live-docs:visualize` and `npm run live-docs:visualize:estate`. Main graph: 867 files; estate: 36 files. Playwright Chromium, fresh browser contexts, 1600×1000 CSS pixels at DPR 1 except capture 26, at 1280×800. Ordinary mouse, keyboard and visible controls were used; DOM inspection supplied accessible names and distinguished hidden feedback from absent feedback. No private application state or layout hooks were used. The browser reported no page errors; this does not establish visual correctness. Still captures support the observations below; no video was recorded, so this is not a frame-by-frame motion audit or a performance benchmark.

## Judgment

The useful product is already visible: the World Map gives a comprehensible estate, the document reader explains a file, and a short 2D path makes a relationship inspectable. The 3D Local Map makes me work much harder to recover names, scope and direction. Its chief weakness is the loss of readable identity and context during ordinary tasks, followed by camera framing and visual interference. These problems also occur on the small estate, so graph size does not explain them all.

## Findings, in order of impact

1. **Path feedback disappears in 3D.** In Structure mode, search and pin `generator.ts`, then choose `document.ts` in “Path to…”. The reverse-only explanation exists in the DOM but is absent from the rendered 3D picture ([13](13-3d-path.png)). Switching to 2D makes the explanation and its actionable reverse-path link visible ([14](14-path-2d.png)). Taking the reverse path draws an excellent two-card explanation ([15](15-reverse-path-2d.png)); returning to 3D removes its readable breadcrumb/result surface and leaves only “Path: 2 files” in the toolbar, with one named endpoint in frame ([16](16-reverse-path-3d.png)). This interrupts a real task, beyond cosmetic polish.
2. **A selected file's arrival is too close to explain its neighborhood.** Search `generator` in 3D Connections mode and select `generator.ts`. The center sphere is huge, most neighbors are outside the frame, and broad gray wires lead offscreen ([06](06-generator-pinned-3d.png)). I have to zoom out before I can examine what I selected. The pin tray helps me return by name, but does not solve that initial composition.
3. **The 3D picture loses identity at the moment it needs it.** At root it is an unnamed cloud ([03](03-local-3d-first.png)); pinning supplies one persistent name, while nearby files still require individual discovery. The estate's Portal goes from named folders/cards ([23](23-estate-portal-2d.png)) to anonymous blue spheres ([24](24-estate-portal-3d.png)). I can see a shape but cannot say which piece is which without repeatedly hunting with the pointer.
4. **Structure mode needs readable structure.** Orange hubs and orange lines arrive, but directory names are not persistently visible and there are no readable boundaries to replace the 2D membranes ([10](10-3d-structure-arrival.png), [25](25-estate-structure.png)). Even Portal, which I just explicitly opened, has no visible spatial name in the 3D canvas. Its name survives in the search/context UI, separated from the shape.
5. **The legend does not explain the current picture.** It promises blue/green offers/uses and a test-backed outline while the 3D picture uses gray reference wires, blue/green spheres, and orange hubs in Structure mode. Green spheres disappeared when I unchecked Show Tests. The meaning of sphere size, orange hubs and gray line weight is not available in this legend. This is a mismatch visible to a reader, not a claim about the underlying data.
6. **Wires overpower nodes when close, and provide weak direction cues.** The pin arrival and Structure switch produce wide gray strokes across much of the canvas ([06](06-generator-pinned-3d.png), [10](10-3d-structure-arrival.png)). At distance they become fine gray threads; in neither view could I comfortably read provider versus consumer from the wires. Perspective makes a nearby connection look much heavier than a distant one without telling me whether that weight means anything.
7. **Occlusion makes 3D connections ambiguous.** Projected wires cross unrelated spheres, multiple spheres overlap, and lines remain visible across sphere faces ([09](09-3d-orbit.png), [25](25-estate-structure.png)). A crossing looks liable to be an attachment. On the small estate, adjacent orange hubs partially cover one another. This does not prove their world-space positions intersect; it is a problem in the picture a reader actually sees.
8. **Hover and selected labels collide.** Clicking the already pinned `generator.ts` sphere opens evidence and a small action toolbar; the hover text with the symbol count sits underneath the persistent `generator.ts` chip ([07](07-generator-inspect.png)). Two labels compete for the same pixels.
9. **There is no obvious 3D framing recovery beside its navigation controls.** After rotating and zooming I looked for the 2D view's reset/zoom controls or World Map's Fit. The 3D toolbar offers neither. Search, Centre and the pins drawer provide subject navigation, but the visible controls do not offer an obvious way to fit the current neighborhood.
10. **The selected neighborhood can become a few bright pixels in a nearly invisible context.** Pulling back in Structure mode produces a single readable chip amid very dark unnamed surroundings ([11](11-3d-structure-pulled-back.png), [12](12-3d-pins-drawer.png)). Fading is useful, but here the remaining surroundings give me little orientation. In the path view one endpoint is named while the other is not readily identifiable ([16](16-reverse-path-3d.png)).
11. **The navigation hint is both tiny and crowded.** “Left-click: rotate…” sits at the very bottom, underneath the floating toolbar, with low contrast and text reaching the viewport edge ([03](03-local-3d-first.png), [26](26-tuning-1280.png)). It is permanent text in a poor reading position, while the explanation I actually need—what the graph's colors and shapes mean—is missing.
12. **History claims a large amount of space for very little information.** Opening it on a commit with no visible doc change produces a nearly full-height black panel containing only a heading, metadata and one sentence ([17](17-history-controls.png)). The panel masks a large portion of the map. Scrubbing gives useful change facts ([18](18-history-scrub.png)), but the panel is still much taller than its contents. The history capture also shows selected files absent from the historical picture while the search/path and pin count remain; those controls give me no immediate explanation of that absence.
13. **Initial 2D framing also needs attention.** The repository root clips cards at both top and bottom despite large horizontal gaps ([02](02-local-first.png)). Opening Portal from the World Map places its whole directory group far to the right, with a broad empty area to the left and almost no margin on the right ([23](23-estate-portal-2d.png)). This is not solely a crowded-graph problem.
14. **Some 2D names break badly while controls consume their row.** `LiveDocGeneratorResult` wraps with the last `t` on its own line ([14](14-path-2d.png)). Small path/count text and faint folder controls require more effort than the bright wires. The small reverse-path example is much clearer overall, but its long directory labels still wrap awkwardly around Open and action controls ([15](15-reverse-path-2d.png)).
15. **Search gives a weak first ranking for a simple intent.** Typing `generator` puts a root tsconfig symbol and `GeneratorIdentity` ahead of `generator.ts`; the intended file is findable, but lower down ([05](05-search-generator.png)). Repeated paths are very faint and symbol subrows add considerable density. One capture also shows a large dark rectangle below the results; this was not independently reproduced, so it remains a capture observation, not a confirmed persistent defect.
16. **Several small pieces of chrome add friction.** The application name is already ellipsized at 1600px; Local Map and Knowledge Sources have blank icon slots where World Map has a diamond; 3D mode, layout mode and packing presets all use the same small blue-outline active treatment. I learned the icon meanings from hover/accessible names. “+1 symbols” is grammatically wrong on one-symbol cards. The successful 2D path repeats “2 files” in the top message and bottom toolbar, alongside the obvious two-node breadcrumb.
17. **Evidence is useful but unevenly presented.** The file reader's Purpose is easy to use, but long chronological Notes push symbols and dependencies far below the fold ([07](07-generator-inspect.png)). The World Map's portal facts are useful and linked, but the popup is dense with small monospace paths and covers much of the estate ([22](22-estate-portal-inspect.png)).
18. **Inventory numbers need clearer scope.** Knowledge Sources says “References between files: 4,491” while the sidebar simultaneously says “4462 references” ([20](20-knowledge-sources.png)). These may count different things; the page does not tell me why they differ. Display filters remain visible on this inventory page, making it still less obvious which totals are filtered.
19. **Tuning is discoverable but demanding at ordinary laptop size.** At 1280×800 the sidebar shows a long run of small sliders and is cut midway through Update Energy in the initial scroll position; legend and remaining controls are below ([26](26-tuning-1280.png)). The tuning control usefully opens this area, but the parameter names and numbers are not a sufficient explanation for someone trying to repair a confusing picture by eye.
20. **Sphere silhouettes look coarse when enlarged.** Orange and blue spheres show polygonal edges/facets in the close estate views ([25](25-estate-structure.png)). This is a smaller aesthetic issue than the naming and framing faults. The judgment is limited to this Chromium capture environment; antialiasing and performance on the owner's GPU were not measured.

## What worked

- World Map's estate gives me recognizable systems, regions and a chain I can explain ([21](21-estate-world.png)). Its portal popup lets me verify files, routes and dependencies, then open the directory.
- The short 2D path is the strongest explanatory picture in this review: named files, specific exposed symbols, and wires to the consumer ([15](15-reverse-path-2d.png)).
- Search, evidence and the pin tray are useful independent ways to find, learn about, and return to a subject. Opening evidence preserves the graph instead of throwing it away.
- Rotation reveals depth and separates some projected overlaps. Explicit 2D/3D controls let me choose the representation deliberately.
- Knowledge Sources makes the inventory and its limits inspectable. The history panel states what a commit changed and admits when the docs saw no change.
- A short Tab walkthrough moved from search through destination, path clearing and the active Local Map toolbar; it did not focus the hidden World Map controls. Hidden DOM text alone therefore did not establish a keyboard-focus defect.

My first priorities would be visible path feedback in both representations, readable identities and direction in 3D, useful arrival/recovery framing, then label/toolbar collisions. This is a recommendation for discussion; no repair or redesign was implemented.

## Capture index

| Capture | State or action |
| --- | --- |
| [01](01-world-first.png) | Repository World Map, fresh landing. |
| [02](02-local-first.png) | First switch to root Local Map, 2D. |
| [03](03-local-3d-first.png) | First switch to 3D Connections. |
| [04](04-3d-hover.png) | Pointer moved to a previously pictured sphere; picture had moved and no hover label appeared. No claim of indefinite drift. |
| [05](05-search-generator.png) | Search results for `generator`. |
| [06](06-generator-pinned-3d.png) | Search selection pins and approaches `generator.ts`. |
| [07](07-generator-inspect.png) | Click selected sphere to inspect; overlapping hover/persistent text. |
| [08](08-3d-neighbourhood-zoom-out.png) | Close evidence and wheel outward. |
| [09](09-3d-orbit.png) | Orbit the same pinned neighborhood with a left drag. |
| [10](10-3d-structure-arrival.png) | Switch to Structure at the current camera distance. |
| [11](11-3d-structure-pulled-back.png) | Zoom outward in Structure. |
| [12](12-3d-pins-drawer.png) | Hide tests, open pins drawer. |
| [13](13-3d-path.png) | Choose `document.ts` as path destination; explanation hidden in 3D. |
| [14](14-path-2d.png) | Switch to 2D; reverse-only explanation visible. |
| [15](15-reverse-path-2d.png) | Take the offered reverse path. |
| [16](16-reverse-path-3d.png) | Switch the successful two-file path to 3D. |
| [17](17-history-controls.png) | Open History at the newest bundled commit, October 20. |
| [18](18-history-scrub.png) | Click the timeline at February 18. |
| [19](19-related-and-citing.png) | Close History and enable related/citing documents with the path retained. This does not test their unfiltered full-graph layouts. |
| [20](20-knowledge-sources.png) | Open Knowledge Sources. |
| [21](21-estate-world.png) | Estate World Map in a fresh context. |
| [22](22-estate-portal-inspect.png) | Click the portal piece to inspect its facts. |
| [23](23-estate-portal-2d.png) | Follow “open portal” into its directory in 2D. |
| [24](24-estate-portal-3d.png) | Switch Portal to 3D Connections. |
| [25](25-estate-structure.png) | Switch the estate to Structure. |
| [26](26-tuning-1280.png) | Resize to 1280×800 and open Layout tuning. |

## Subsequent repair evidence

The [shared path-feedback playtest](path-feedback/README.md) records the first approved repair, with twelve new captures, after this baseline review. The numbered findings above retain what the original page showed; completion belongs to the [current remediation checklist](../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#remediation-work).

## Identity and framing follow-up

The [3D identity/framing comparison](3d-identity-framing/README.md) records like-for-like generator and Portal arrivals, then orbit/Fit recovery and a named four-file path. It keeps the remaining wire, legend and control defects explicit.
