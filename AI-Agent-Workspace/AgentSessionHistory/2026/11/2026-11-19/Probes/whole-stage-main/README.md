# The whole browser stage on `main` after the night's landings

_Historical evidence: a record of November 20, 2026 (UTC), taken by the root in the main checkout at `fb5b4141`, under Node 26.13.1 and Playwright 1.61.1 (Chrome for Testing 149), through the browser lane. It is not current documentation. Nothing was changed to take it._

## What was run

One lane hold, 08:35:33 to 09:26:28 UTC, 3,054.7 s, with nothing else in the lane (two builders worked beside it on code and waited for it):

1. `npm ci`, exit code 0.
2. `npx --no-install playwright install chromium`, the set-up script's own step without `--with-deps`: exit code 0 in 36 s, into the usual folder. This is the step that had hung for two hours under Playwright 1.58.2 ([the upgrade's record](../playwright-upgrade/README.md)).
3. The gate without the browser, each stage stamped by [`gate-time.sh`](../suite-time/gate-time.sh): exit code 0, 288.9 s, the load 8.1 at its end.
4. `npm run live-docs:visualize` and `npm run e2e:bundles`, each exit code 0.
5. The whole stage with each case's time, by the suite builder's reporter:

```bash
SUITE_TIME_OUT=<scratch>/main-cases.jsonl node scripts/e2e-passes.mjs \
  --reporter=list,$PWD/AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/suite-time/duration-reporter.cjs
```

## The result

Both passes' first line named the card: `ANGLE (Microsoft Corporation, D3D12 (NVIDIA GeForce RTX 3090), OpenGL ES 3.1)`. The load was 4.7 at the stage's start and 2.3 at its end.

| | Cases | Passed | Failed | Skipped | Wall clock |
| --- | ---: | ---: | ---: | ---: | ---: |
| First pass, two workers | 604 | 596 | 1 | 7 | 42.0 min |
| Second pass, the cases that run alone | 5 | 5 | 0 | 0 | 2.4 min |
| **Both** | **609** | **601** | **1** | **7** | 44.5 min |

- **The one failure is the known one:** `force-graph-discovery.spec.ts:70`, "the picture did not come to rest within 2700 substeps of its motion; after 2713 substeps, 1368 frames and 26.1 s it was still moving". Its bound is not touched; it waits on the owner's eye for Settle Hold.
- **The seven skipped** are the scenario table's rows that do not apply, by design.
- **The focus case,** red on `main` since the engine round, passed with the rest of its file (15 cases, none failed): the mend of `7997ffdd` and `a4723e34`.
- **`explorer-navigation.spec.ts:126`,** which failed once in the upgrade's stage under a load of 13.6, passed here.

The case time is 84.7 minutes (80.4 on the baseline of the same night under 1.58.2, [the suite's timing](../suite-time/README.md)), in the same shares: assertions that poll 23.5%, `waitForFunction` 14.5%, gestures 12.9%, locator waits 12.4%, the instruments' readings 12.3%, fixed pauses 9.1% (1,092 of them, 464 s), navigation 5.3%.

## Files here

- `README.md`, this record.
- [`cases.tsv`](cases.tsv): the 609 cases, one row each, written by the suite builder's [`cases-analyse.mjs`](../suite-time/cases-analyse.mjs) from the run's own data. It is the baseline on `main` that later changes to the suite's speed are to be held against.
