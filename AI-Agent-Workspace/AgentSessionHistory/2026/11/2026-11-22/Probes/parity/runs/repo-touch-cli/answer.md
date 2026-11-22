Changing `packages/explorer/src/client/markdown.ts` could affect 12 files. I found them by running `live-docs inspect` for everything that depends on it, directly or indirectly.

**Direct dependents (1 hop):**
- `packages/explorer/src/client/detailPanel.ts`
- `packages/explorer/src/client/reader-sections.ts`
- `packages/explorer/src/client/views/localView/card-reading.ts`
- Tests: `detailPanel.test.ts`, `markdown.test.ts` and `reader-sections.test.ts`, all in the same folder.

**Indirect dependents:**
- 2 hops: `packages/explorer/src/client/index.ts`, `views/localView/branch-renderer.ts` and `views/localView/controller.ts`
- 3 hops: `views/localView/directory-ancestry.ts`, `views/localView/index.ts` and `.live-docs.config.json`

The `.live-docs.config.json` entry is probably just how the tool's graph links the config to the code. It isn't likely to be a real runtime dependency.

The further out a file is, the less likely it is to be affected. The 1-hop files and their tests are the ones to check first.
