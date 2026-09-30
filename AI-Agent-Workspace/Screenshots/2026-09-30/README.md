# Explorer, September 30, 2026

Historical visual record. The earlier `explorer-history-01-fresh.png` and `explorer-history-02-after-back.png` captures and their context are described in [the gallery](../README.md#2026-09-30).

The following pictures were taken by Codex from the rebuilt `dist/explorer`, served locally, at 1600 × 1000 with Playwright Chromium. Requests outside the local server were blocked during verification.

- [force-graph-provenance.png](force-graph-provenance.png): the Force Graph with Show Related Docs checked. Purple summary nodes and their connections are present again after narrowing the repository's archive exclusion. The bundle carries 18 linked summaries and 50 links to them from 38 source files, with no raw transcript content.
- [provenance-summary-open.png](provenance-summary-open.png): the November 8 summary opened by clicking its entry under Related Documentation in Knowledge Sources. Its historical Commit Correlations section is visible in the detail panel. The narrow panel wraps the title and clips long commit hashes; this capture records existing reader limitations, not a new layout design.
- [provenance-live-doc-to-summary.png](provenance-live-doc-to-summary.png): the current session's summary opened from the authored Notes of `githubSluggerRegex.ts`, after finding that file through Omnisearch. The summary explicitly states that a native conversation capture is missing.

The browser check also verified the bundle's link from `packages/engine/src/config/liveDocumentationConfig.test.ts` to the November 8 summary, the rendered turn record, and absence of page errors. The Force Graph was inspected visually; opening summaries was exercised through both the Sources tree and a Live Doc's authored provenance link.
