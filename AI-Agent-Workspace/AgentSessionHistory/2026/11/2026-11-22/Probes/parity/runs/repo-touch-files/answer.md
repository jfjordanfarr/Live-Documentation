`packages/explorer/src/client/markdown.ts` is imported directly by six files. I searched the `packages` folder for imports of it. A string search won't catch dynamic imports or build-config references, so check those separately.

**What it exports**
- `renderMarkdown`
- `fenceClosing`
- `headingOf`
- `renderingSteps`
- the `RenderMarkdownOptions` type

**Direct importers**
- `detailPanel.ts` uses `renderMarkdown`.
- `views/localView/card-reading.ts` uses `renderMarkdown`.
- `reader-sections.ts` uses `fenceClosing` and `headingOf`. This is the only non-rendering use, so changing how those two parse fences or headings changes how sections are split.
- `markdown.test.ts` uses `renderMarkdown` and `renderingSteps`.
- `detailPanel.test.ts` uses `renderMarkdown`.
- `reader-sections.test.ts` uses `renderMarkdown`.

**Indirect importers, one step removed**
- Through `detailPanel.ts`: `client/index.ts`.
- Through `card-reading.ts`: `views/localView/controller.ts` and `views/localView/branch-renderer.ts`.
- Through `reader-sections.ts`: `detailPanel.ts` and `card-reading.ts`, which are already listed above.

`renderingSteps` isn't used outside `markdown.ts` and its own test.

If you only change the internals of `renderMarkdown`, the output of the detail panel and the local-view card reader changes, and so do the three test files that call it. If you change the signatures of `fenceClosing` or `headingOf`, `reader-sections.ts` breaks.
