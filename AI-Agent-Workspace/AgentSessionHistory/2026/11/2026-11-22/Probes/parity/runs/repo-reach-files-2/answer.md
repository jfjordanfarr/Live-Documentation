`scripts/live-docs/board.ts` depends on 16 other files, counting both direct and indirect imports. I found them by following each file's imports, using the `@live-documentation/engine/*` path alias from `tsconfig.base.json`.

**Direct imports**
- `scripts/live-docs/cli.ts`
- `packages/engine/src/config/liveDocumentationConfig.ts`
- `packages/engine/src/live-docs/board.ts`
- `packages/engine/src/live-docs/boardGraph.ts`
- `packages/engine/src/live-docs/document.ts`
- `packages/engine/src/live-docs/graphFiles.ts`

**Indirect imports, pulled in by those files**
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

Nothing from the `explorer` or `generator` packages is involved.

Outside the repository, the chain uses Node built-ins (`fs`, `path`, `process`, `url`, `child_process`) plus the npm packages `glob` and `typescript`.

My import scanner was a rough regex rather than a real TypeScript parser. It could in principle list a file that is only mentioned in a comment or string, but every file above resolved to a real file. All imports resolved, so nothing was missing.
