# packages/explorer/src/client/panels/tuning-levers.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/tuning-levers.ts
- Generated At: 2026-11-05T23:55:54.985Z

## Authored
### Purpose
The one place that says, in a short sentence each, what changing a tuning control does to the picture. The Tuning block applies each sentence as its control's tooltip and as a screen reader's description, so the sidebar draws none of this text itself.

### Notes
- Written on 2026-10-30 for the remediation item "Tuning is usable at the available size": before it, the help was hover-only `title` text written into `template.html`, seven of the 2D controls had none, and several sentences described the mechanism (wires per pixel, weighted vertical wire pixels) rather than the effect. The owner's rule of that day, that text we author on screen is the last resort and a control explains itself by its tooltip as Microsoft Teams does, is why the sentences live here and appear only on hover and to assistive technology ([Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)).
- Each sentence was written from the code that reads the setting: the wire curve in `branch-routing.ts`, the scene and the price of a picture in `branch-scene.ts` and `branch-restarts.ts`, the search in `branch-renderer.ts` and `branch-search.ts`, the 3D field in `forceGraphPhysics.ts` and `forceGraphLayout.ts`, the sizes in `forceGraphSizing.ts` and `forceGraphView.ts`, and the scrubber in `history/tick-model.ts`. When the code that reads a setting changes what it does, the sentence changes with it.
- Hops Shown and Reveal Frames (discovery, 2026-10-31) read `forceGraphScope.ts` and `forceGraphReveal.ts`; Changed Files reads `forceGraphEmphasis.ts`.
- The keys are the controls' element ids. `tuning-levers.test.ts` holds the table and the template to each other, so a control cannot be added without its sentence, and checks that each sentence is one sentence.
- Group Wrappers (2026-11-05) reads `forceGraphWrappers.ts` and the view's wrappers ([the experiment](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)).

- Card Text and Slot Lines ([2026-11-05](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-4)) read `card-reading.ts` and `reading.css`.

- Text Resistance and Control Resistance ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-9)) read `controller.ts`'s `applyLevelOfDetail` and `reading.css`.

Name Growth's sentence joined on [Turn 11](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11), and Card Text's names the fixed-slot composition first, as the default.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TUNING_HELP` {#symbol-tuning_help}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning-levers.ts#L16)

##### `TUNING_HELP` — Summary
One short sentence per tuning control, keyed by the control's element id.

#### `tuningHelpId` {#symbol-tuninghelpid}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning-levers.ts#L88)

##### `tuningHelpId` — Summary
The id of the visually hidden element that carries a control's sentence.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
