# The landing's four stages as one script, and the two runs of November 22 that stopped

Evidence of the November 22 dev day, kept by root at the day's close on 2026-11-23. Historical: it records what ran that day. The script is kept here because the next dev day begins with the same landing and root's scratch folder does not outlive a session.

## What a landing is

`main` moves only by an ordinary merge of a state its checks have passed. The checks are four stages, run one after another on the day branch with nothing run beside them and nothing committed until they end:

1. **The history levelled** with the commits made since its last rebuild (`npm run live-docs:history -- --remove-superseded --check-head`).
2. **The gate without the browser** (`npm run safe:commit`).
3. **The bundles** (`npm run e2e:bundles`), which are also what the owner's preview on port 8999 serves.
4. **The browser's whole suite through the lane** (`node scripts/browser-lane.mjs --label gate --max-seconds 5400 -- node scripts/e2e-passes.mjs`).

[landing.sh](landing.sh) runs them. It takes one argument, the path of a log; it writes one line there as each stage begins and ends, and each stage's whole output beside it as `<log>.<stage>.out`. It stops at the first stage that fails, and its own exit is that stage's number (1 to 4), 0 only when all four passed. It refuses to begin on a working tree with uncommitted changes (exit 9), untracked files not counted, and says so if the stages left the tree changed (exit 8).

Run it as the whole command, in the background, with no timeout and nothing after it on the line, so that the task's exit is the script's:

```bash
bash AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/landing/landing.sh <a log path in scratch>
```

On exit 4, read `<log>.browser.out` for the list of failed cases. A landing lands on a whole pass, or on a browser stage whose one failure is `force-graph-discovery.spec.ts:70` at "the largest group grows from its seed", the suite's known red since November 19, as the morning landing of November 21 did with the owner told so. Any other failure stops it.

**Before the four stages begin,** root runs on the merged state every spec a round changed and every spec whose subject a round changed, each in a hold of its own, and reads each exit. The second run below cost an hour for want of that.

## The two runs

| Run | On | Stages | The browser stage |
| --- | --- | --- | --- |
| 1, 16:54 to 18:09 UTC ([log](run-1.log)) | `2d2f18f2b` | history, gate and bundles passed; browser failed | 699 passed, 24 failed, 7 skipped by design; of the 5 alone, 3 passed and 2 failed ([the failed cases](run-1.failed.txt)) |
| 2, 20:40 to 21:47 UTC ([log](run-2.log)) | `a503db4d9` | history, gate and bundles passed; browser failed, exit 4 | 726 passed, 5 failed, 7 skipped by design; 3 of 3 alone ([the failed cases](run-2.failed.txt), with the five run again alone) |

The first run was started by an earlier form of the script whose line after it hid its exit; the form kept here is the second run's.

What each failure was, and what became of it, is in the day's record: [the first stop](../../2026-11-22.1.record.md#work-notes-the-landing-stopped-at-its-last-stage-the-whole-browser-suite-and-its-26-failures-sent-to-three-builders) and its three rounds of mends, all 26 mended and merged; [the second stop](../../2026-11-22.1.record.md#work-notes-the-landing-stopped-a-second-time-at-its-last-stage-on-five-browser-cases-and-each-sent-to-the-builder-who-knows-it), two of its five mended, one the known red; and [why no third run was begun](../../2026-11-22.1.record.md#work-notes-the-nights-rule-applied-the-round-does-not-leave-the-specs-whole-so-the-landing-waits-for-the-next-dev-day).

## Not kept here

Each stage's whole output, the second run's screenshots and traces of its five failures (31 MB) and the five run alone stood in root's scratch folder of that session at the close and were not committed. The lists above are the last lines of the browser outputs with the terminal's colour codes taken out; the builders' own measures of the second run's 3D cases are in [landing2-3d](../landing2-3d/README.md).
