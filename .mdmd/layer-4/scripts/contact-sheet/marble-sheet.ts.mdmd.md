# scripts/contact-sheet/marble-sheet.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/contact-sheet/marble-sheet.ts
- Entry: command `marble:sheet` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-19T01:28:12.469Z

## Authored
### Purpose
Draws marbles alone, large and side by side, with the Explorer's own shaders, so that their patterns can be judged: forty files in each pattern and at three Vein Bends, one file through a made-up run of changes, the history sample step by step, and the owner's open choice of what a marble is made from, set out over one file's recent commits.

### Notes
- Written on 2026-11-18 and 19 by the builder of the Marble Pattern trial, after the owner's wish in [Turn 20 of the November 18 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-20). The contact sheet pictures whole views; this one pictures the marbles themselves, which in a view are too small to judge.
- Node works out the marbles from a built bundle's graph, using the Explorer's own modules. A loaded 3D page lends its renderer, lights and marbled material. The script chooses the pattern and the Vein Bend through the Tuning levers, as a viewer does, then draws each row in front of the page's camera with the page's own picture hidden. Each row is a separate render, so no row may be taller than the page's canvas.
- `--sheet fork` adds a row made from the file's own text at each commit: one feature per distinct trimmed line, weighted by how often it occurs. That row exists only here, for the owner to judge the open choice. The product, the Live Doc format and the history do not have it.
- `npm run marble:sheet -- --bundle <built bundle> --sheet files|bends|run|history|fork --out <dir>`. The pictures it drew for the trial are in [the marble-patterns evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/marble-patterns/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `chromium`
- `node:child_process` - `execFileSync`
- `node:fs/promises`
- `node:path` - `path`
- [`document.parseLiveDoc`](../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`graph.GraphFile`](../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile)
- [`graph.deriveLiveDocGraph`](../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-derivelivedocgraph)
- [`graph.linkTarget`](../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-linktarget-function)
- [`sequence.seek`](../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-seek)
- [`snapshot.snapshotGraphOf`](../../packages/explorer/src/client/history/snapshot.ts.mdmd.md#symbol-snapshotgraphof)
- [`palette.DEFAULT_MARBLE_BEND`](../../packages/explorer/src/client/palette.ts.mdmd.md#symbol-default_marble_bend)
- [`palette.DEFAULT_PALETTE`](../../packages/explorer/src/client/palette.ts.mdmd.md#symbol-default_palette)
- [`palette.paletteNamed`](../../packages/explorer/src/client/palette.ts.mdmd.md#symbol-palettenamed)
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`types.MARBLE_PATTERNS`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-marble_patterns)
- [`types.MarblePattern`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-marblepattern)
- [`forceGraphAppearance.Marble`](../../packages/explorer/src/client/views/forceGraphAppearance.ts.mdmd.md#symbol-marble)
- [`forceGraphAppearance.marbleCounts`](../../packages/explorer/src/client/views/forceGraphAppearance.ts.mdmd.md#symbol-marblecounts-function)
- [`forceGraphAppearance.marbleOf`](../../packages/explorer/src/client/views/forceGraphAppearance.ts.mdmd.md#symbol-marbleof)
- [`forceGraphAppearance.marbleTint`](../../packages/explorer/src/client/views/forceGraphAppearance.ts.mdmd.md#symbol-marbletint)
- [`marbleSketch.SKETCH_TURN`](../../packages/explorer/src/client/views/marbleSketch.ts.mdmd.md#symbol-sketch_turn)
- [`marbleSketch.Sketch`](../../packages/explorer/src/client/views/marbleSketch.ts.mdmd.md#symbol-sketch)
- [`marbleSketch.SketchFeature`](../../packages/explorer/src/client/views/marbleSketch.ts.mdmd.md#symbol-sketchfeature)
- [`marbleSketch.fileFeatures`](../../packages/explorer/src/client/views/marbleSketch.ts.mdmd.md#symbol-filefeatures)
- [`marbleSketch.marbleFeatureSums`](../../packages/explorer/src/client/views/marbleSketch.ts.mdmd.md#symbol-marblefeaturesums)
- [`marbleSketch.marbleSketches`](../../packages/explorer/src/client/views/marbleSketch.ts.mdmd.md#symbol-marblesketches)
- [`marbleSketch.sketchDistance`](../../packages/explorer/src/client/views/marbleSketch.ts.mdmd.md#symbol-sketchdistance)
- [`marbleSketch.sketchOf`](../../packages/explorer/src/client/views/marbleSketch.ts.mdmd.md#symbol-sketchof)
- [`marbleSketch.strengthsOf`](../../packages/explorer/src/client/views/marbleSketch.ts.mdmd.md#symbol-strengthsof)
- [`graph.explorerGraphOf`](../../packages/explorer/src/shared/graph.ts.mdmd.md#symbol-explorergraphof)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`bundle-page.ORIGIN`](./bundle-page.ts.mdmd.md#symbol-origin)
- [`bundle-page.escape`](./bundle-page.ts.mdmd.md#symbol-escape)
- [`bundle-page.serve`](./bundle-page.ts.mdmd.md#symbol-serve)
- [`cli.UsageError`](../live-docs/cli.ts.mdmd.md#symbol-usageerror)
- [`cli.optionValue`](../live-docs/cli.ts.mdmd.md#symbol-optionvalue)
- [`cli.runCommand`](../live-docs/cli.ts.mdmd.md#symbol-runcommand)
- [`browser-launch.browserLaunchOptions`](../../tests/e2e/browser-launch.ts.mdmd.md#symbol-browserlaunchoptions)
- [`force-graph-observation.observeGraph`](../../tests/e2e/force-graph-observation.ts.mdmd.md#symbol-observegraph)
<!-- LIVE-DOC:END Dependencies -->
