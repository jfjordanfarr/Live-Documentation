`scripts/live-docs/board.ts` depends on 16 files, directly or through other files. I got this from `live-docs inspect --reachable`, which lists what a file reaches, nearest first.

**Directly (1 hop):**
- `packages/engine/src/config/liveDocumentationConfig.ts`
- `packages/engine/src/live-docs/board.ts`
- `packages/engine/src/live-docs/boardGraph.ts`
- `packages/engine/src/live-docs/document.ts`
- `packages/engine/src/live-docs/graphFiles.ts`
- `scripts/live-docs/cli.ts`

**Through other files:**
- 2 hops:
  - `packages/engine/src/live-docs/estateGraph.ts`
  - `packages/engine/src/live-docs/graph.ts`
  - `packages/engine/src/live-docs/openings.ts`
  - `packages/engine/src/tooling/gitIgnored.ts`
  - `packages/engine/src/tooling/sourceText.ts`
- 3 hops:
  - `packages/engine/src/live-docs/coreTypes.ts`
  - `packages/engine/src/live-docs/processMark.ts`
  - `packages/engine/src/tooling/markdownLinks.ts`
- 4 hops:
  - `packages/engine/src/tooling/htmlEntities.ts`
  - `packages/engine/src/tooling/pathUtils.ts`
