# Guidance for reading on a software map

Historical research notes, November 3, 2026, prompted by the owner's [request for UI/UX guidance](../ChatHistory/2026/11/2026-11-03.1.record.md#turn-11). These sources inform the [zoom comparison](../Probes/2026-11-03/reading-zoom/README.md); they do not select its gestures or numerical thresholds.

## Established guidance and its application here

Jakob Nielsen's [usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) emphasize recognizable choices, visible system state, predictable conventions and reversible actions. They are broad evaluation principles, not a specification for this map. The application here is the root's interpretation: show matched examples instead of asking the owner to picture alternative layouts; visibly distinguish retention from reading; keep a name's action consistent across short, long and absent comments; and make closing a reading surface return to the exploration it came from. Consistency does not require every hyperlink, map mark and document control to do the same operation.

[Shneiderman's 1996 information-visualization framework](https://drum.lib.umd.edu/items/155a868e-fb83-4115-9899-9187ea8c0498) distinguishes overview, zoom, filtering, requested detail, relationships, history and extraction. For this project, that supports serving both a picture of connections and close reading of an explanation. It does not establish that a particular layout reveals meaningful software motifs. Apparent patterns must remain checkable against the documented relationships.

W3C's [hover/focus guidance](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus) requires applicable additional content to remain reachable by the pointer, persist while its trigger or content is being used, and be dismissible under the criterion's conditions. It also points to keyboard access. That supports allowing movement into a description and an explicit dismissal. It does not justify keeping every description visited elsewhere on the same card open indefinitely, nor dictate a particular dwell delay. The sticky card-visit policy is our prototype choice, already criticized by the owner.

W3C's [modal-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) describes focus entering the dialog, remaining within it, Escape and a visible close action, and return to the invoking control. A long document can start focus on its heading so the beginning stays available. Our application: an explicit full-text reader for overflow, with the graph and pins preserved. A dialog interrupts map interaction while open, so it is not a substitute for convenient ordinary inline reading.

## Concepts to explain before asking for a design verdict

**Semantic zoom** changes which information is presented with scale. Ordinary geometric zoom simply enlarges or shrinks everything. At 45%, 13 px prose draws at 5.85 screen pixels: the loss of readability is predictable without building a production variant. Folding prose avoids that texture, but changes card height and wire endpoints. The motion and the ability to find the same item again need visual evaluation.

**Progressive disclosure** means presenting additional information when it becomes useful. For this map, names and connections support exploration, inline descriptions support an immediate question, and an explicit full reader can hold a long explanation. The hidden content needs a discoverable route; silently cutting text or making it mouse-only is not a complete solution.

**Spatial continuity** means being able to recognize where the subject and its neighbors went after an action. It is a standing [workspace requirement](../../AGENTS.md), not established by an attractive still image. The fixed-scope prototype keeps card origins, but does not establish that a native layout with directory membranes and continuing optimization will remain intelligible while reading changes its geometry.

## The recommendation and its limits

The root recommends overview folding with explicit reading choices restored on zoom-in, ordinary inline text, and an explicit reader for unusually long passages. Keep retention independently controllable and shareable. Name-click behavior still needs evaluation in the context of the whole application. The current comparison's scale-only mode is a control illustrating a predictable cost, not an equally promising production candidate.

One huge comment and a card with many ordinary comments are different problems. Limiting individual passages can solve the first while leaving the second tall. A file-level reader provides access to all text but does not itself settle how much prose a file pin should show. The owner's initial file-pin-all default remains in force for the experiment.

Evaluate journeys: find a symbol, follow a reference, read its explanation, compare it with another, zoom out and back, and share/reopen the deliberate choices. Compare the same content, pins, viewport and start point. Use judgment to reject predictable failures before implementation, and use prototypes for the questions that genuinely depend on seeing and using the result. The owner's eye and automated geometry/accessibility checks answer different parts of that evaluation.

## November 4: the subject determines the starting view

The owner [grounds the next step in sharing one C# class](../ChatHistory/2026/11/2026-11-03.1.record.md#turn-15--november-4): compose and frame its card to teach the subject before zooming outward to its neighbors. That changes the calibration target. A raw zoom percentage is arbitrary until a useful reading view exists, and overview-first should not be treated as a universal entry requirement for a link whose subject is already known.

[Cockburn, Karlson and Bederson's review](https://doi.org/10.1145/1456650.1456652) distinguishes approaches that separate focused and contextual views spatially, approaches that move between them through zoom, and approaches that blend them in one view. It supports discussing these as different ways to serve a task; it does not select this card design or a numerical threshold. The root's application is a dependable card reference for 2D outward learning, complementary to the owner's 3D inward-discovery journey.

The [card comparison](../Probes/2026-11-04/card-reference/README.md) preserves readable type and tests its actual frame, including repeated returns and recipient viewports. The [3D wrapper comparison](../Probes/2026-11-04/cluster-wrap/README.md) separately tests an enclosure and its reveal over real frozen positions. A visual wrapper does not by itself establish cheaper graph simulation or a meaningful recursive hierarchy.
