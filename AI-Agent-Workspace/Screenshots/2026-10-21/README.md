# Explorer pictures — October 21, 2026

Historical evidence from the [no-network hardening](../../ChatHistory/2026/10/2026-10-20.1.record.md#turn-12), taken by the Claude Code root in installed Chromium at 1400 × 900, over bundles built from the working tree before the commit. The console showed no refusal by the page's Content-Security-Policy while they were taken.

- [A doc's raw HTML as text](reader-raw-html-as-text.png): the history sample's `docs/design.md`, served with an `<img>` that names an outside image and runs a handler, a `<script>`, an `<iframe>`, an image's markdown syntax, an outside link, an autolink and a `javascript:` link appended, as the no-network spec serves it. The tags read as written; the image is a link to it, never fetched; the `javascript:` link is its text alone.
- [Code spans literal](reader-code-spans-literal.png): this repository's `coreConstants.ts` in the reader. `SUPPORTED_SCRIPT_EXTENSIONS` and its neighbours keep their underscores; until this change the reader set the word between two underscores in italics, even inside code.
- [Data on another site refused](data-elsewhere-refused.png): the history sample opened with `?data=https://example.com/explorer-data.json`. The page asks nothing of that site and says why in its status line and the reader's error.

Seen while taking them, and not changed here: the reader of a bundled doc has no styles of its own (`detail-doc-content` and `bundled-doc-content` carry none, since 2026-01-07), so its text takes the browser's 16 px and every link the browser's dark blue, `rgb(0, 0, 238)`, hard to read on the dark panel; the picture of the raw HTML shows it.
