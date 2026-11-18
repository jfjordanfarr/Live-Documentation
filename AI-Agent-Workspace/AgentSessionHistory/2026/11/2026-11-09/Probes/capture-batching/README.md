# Complete-capture batching comparison

This is a layout-lab instrument optimization, not a page or model change. The old source matches git HEAD `acf3311c181b0ccfee4c4fcd362984a17af1a2be` byte for byte. `capture-original-external.ts` changes only Node import paths and the absolute Pretext directory so the unchanged old algorithm can execute outside the checkout. `capture.candidate.ts` is the measured source. `site-manifest.json` identifies the immutable copied page assets; source-only reading work during this window did not change them.

`comparison.json` retains all 12 old/candidate/restored-old cases; each complete capture is separately gzipped. Deep equality excludes only the top-level capture timestamp. All 36 captures have empty warnings, every candidate and restored-old capture matches its original, and all cases have no page/console errors. Four deck scopes are measured in both fixed and growing compositions; additional narrow repository and indented-code estate cases include desktop and coarse-pointer phone contexts.

`summary.json` lists callback wall times. For the 102-card/711-row fixed repository chain, old/candidate/restored-old were 10,894.644 / 8,089.804 / 10,647.539 ms. These are one same-page sequence, not repeated benchmark means; the callback wall duration includes IPC/serialization. The improvement against the restored control is 24.02%. Smaller estate differences are not generalized as a benchmark.

`layout-lab.log` is the unchanged existing 12-case spec run, all passed in 1.6 minutes with one worker and the original 30/60-second case limits. No fixture, measurement field, assertion, tolerance or deadline was changed. This focused result does not replace the combined gate or erase the previous gate timeout.

Reproduction commands (from `/tmp/live-docs-20261109-reading`, after starting the copied site on port8911 outside the lock):

```sh
NODE_PATH=/tmp/live-docs-20261109-reading/node_modules flock /tmp/live-docs-20261108-browser.lock node_modules/.bin/tsx /tmp/live-docs-20261109-capture/compare.mts
LIVE_DOCS_E2E_PORT=8911 flock /tmp/live-docs-20261108-browser.lock node_modules/.bin/playwright test --config tests/e2e/playwright.config.ts tests/e2e/layout-lab.spec.ts --workers=1 --reporter=line --output /tmp/live-docs-20261109-capture/layout-lab-results
```

The initial comparison launch failed before any capture because the temporary original-copy adapter accidentally rewrote the embedded browser import strings. Those were restored to their original relative paths before the successful run. No production route, freeze or diagnostic modification exists in the candidate.
