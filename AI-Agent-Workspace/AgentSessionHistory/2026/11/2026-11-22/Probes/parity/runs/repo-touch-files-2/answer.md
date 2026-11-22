Changes to `packages/explorer/src/client/markdown.ts` could affect these files. I found them by grepping for imports of the module. I did not trace indirect dependents or build config.

**Exports of `markdown.ts`:** `renderMarkdown`, `RenderMarkdownOptions`, `fenceClosing`, `headingOf` and `renderingSteps`.

**Direct importers (production code)**
- `packages/explorer/src/client/detailPanel.ts` uses `renderMarkdown`.
- `packages/explorer/src/client/reader-sections.ts` uses `fenceClosing` and `headingOf`. Changing how fences or headings are parsed changes how reader sections are split.
- `packages/explorer/src/client/views/localView/card-reading.ts` uses `renderMarkdown`.

**Tests that import it directly**
- `packages/explorer/src/client/markdown.test.ts` uses `renderMarkdown` and `renderingSteps`.
- `packages/explorer/src/client/reader-sections.test.ts` uses `renderMarkdown`.
- `packages/explorer/src/client/detailPanel.test.ts` uses `renderMarkdown`.

**Indirect effects**
- Anything that imports `detailPanel.ts`, `reader-sections.ts` or `card-reading.ts` could see changed behavior. That likely includes `views/localView` and the client `index.ts`. I didn't trace these.
- `tests/e2e/no-network.spec.ts` (line 105) references `markdown.ts` by path. Check that test if you add anything that makes network requests, such as image or link handling.
- If you change the HTML that `renderMarkdown` emits, such as class names or tags, check the CSS in `packages/explorer/src/client/styles.css` and `styles/`. Also check any DOM code that queries the rendered output, such as `reader-links.ts`. I didn't verify those.

The riskiest parts are the exported signatures and the output format of `renderMarkdown`. `fenceClosing` and `headingOf` matter mostly to `reader-sections.ts`.
