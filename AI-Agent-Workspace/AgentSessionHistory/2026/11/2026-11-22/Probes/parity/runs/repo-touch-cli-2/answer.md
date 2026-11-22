Changing `packages/explorer/src/client/markdown.ts` could affect 12 files. I found them by tracing the dependency graph with `live-docs inspect`, which follows imports and similar links. I haven't opened the files to check how each one uses the module.

**Direct dependents (1 hop)**
- `packages/explorer/src/client/detailPanel.ts`
- `packages/explorer/src/client/reader-sections.ts`
- `packages/explorer/src/client/views/localView/card-reading.ts`
- Tests: `detailPanel.test.ts`, `markdown.test.ts` and `reader-sections.test.ts`, all in the same folder.

**Indirect dependents**
- 2 hops: `packages/explorer/src/client/index.ts`, `views/localView/branch-renderer.ts` and `views/localView/controller.ts`.
- 3 hops: `views/localView/directory-ancestry.ts`, `views/localView/index.ts` and `.live-docs.config.json`.

The `.live-docs.config.json` entry is probably a tooling link and not a runtime dependency. The paths under `views/localView/` are relative to `packages/explorer/src/client/`.

The most likely breakage is in the three direct source dependents and their tests. The further files are only affected if the change alters an exported signature or behavior that passes through the files in between.
