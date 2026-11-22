`scripts/live-docs/board.ts` depends on 16 repository files besides itself. I found them by following its imports and re-exports through the `@live-documentation/engine/*` path alias in `tsconfig.base.json`. Apart from Node built-ins, I saw no third-party imports in `board.ts` or `cli.ts`. I didn't check the engine files for third-party imports, and the script follows only static imports and `require`, so any dynamic path building would be missed.

**Direct imports from `board.ts`**
- `scripts/live-docs/cli.ts`
- `packages/engine/src/config/liveDocumentationConfig.ts`
- `packages/engine/src/live-docs/board.ts`
- `packages/engine/src/live-docs/boardGraph.ts`
- `packages/engine/src/live-docs/document.ts`
- `packages/engine/src/live-docs/graphFiles.ts`

**Reached only through other files**
- `packages/engine/src/live-docs/coreTypes.ts`
- `packages/engine/src/live-docs/estateGraph.ts`
- `packages/engine/src/live-docs/graph.ts`
- `packages/engine/src/live-docs/openings.ts`
- `packages/engine/src/live-docs/processMark.ts`
- `packages/engine/src/tooling/gitIgnored.ts`
- `packages/engine/src/tooling/htmlEntities.ts`
- `packages/engine/src/tooling/markdownLinks.ts`
- `packages/engine/src/tooling/pathUtils.ts`
- `packages/engine/src/tooling/sourceText.ts`

The script I used is `/tmp/tools/deps.py`.
