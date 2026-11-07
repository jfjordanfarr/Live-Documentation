# Probe: the cost of the 2D and 3D switches under force-graph-focus.spec.ts:70

_Status: an instrument of 2026-11-07 with its numbers. It is a Playwright spec that uses the browser suite's own observation helper (`tests/e2e/force-graph-observation.ts`), so it runs from inside the suite's tree: copy it to `tests/e2e/_probe/`, run `NODE_PATH=$PWD/node_modules npx playwright test --config tests/e2e/playwright.config.ts _probe/switch-cost` from the repository root, and remove the folder afterwards, since the suite would otherwise run it. It needs the bundle built first (`npm run live-docs:visualize`); the config serves it on 8766, and `LIVE_DOCS_E2E_PORT` points it at another build served on another port._

`switch-cost.spec.ts` walks the steps of the suite's case "a focused URL centers its node, direct clicks pin it, and More opens its details" with the clock on each: the focused load of the repository's 3D picture, the click on the sphere, Inspect and Centre, the press of 2D until the call returns and until the focus card shows, the press of 3D until the call returns and until the focus is centred. A press returns when the page's main thread has run its handler, so the two "click returned" laps are the switches' synchronous cost. It prints one `SWITCH-COST` line.

## The numbers of November 7

The case ran at 29.7 s in the gate over the 3D shells' third round and timed out at 31.9 s in the gate over that round with the root's two changes and the 2D column clearance; its budget is the suite's default 30 s. The question was whether the round had made a switch dearer. Two builds, each measured twice, alone on the machine, headless Chromium at about four frames a second that day:

| Build | 2D press returned | 3D press returned | Whole case |
| --- | --- | --- | --- |
| The branch head `343c3ef6`, without the third round | 10.2 s, 10.7 s | 15.2 s, 15.7 s | 31.1 s, 32.4 s |
| The working tree: the third round, the root's changes, the clearance | 10.5 s, 9.9 s | 15.2 s, 14.9 s | 31.9 s, 30.9 s |

The round added nothing: the two switches cost the same on both builds, and together more than the case's budget on this machine today. The profile of November 5 had measured the same two blocks at 8 and 11 s and named them a product cost in `perspectiveTransition.ts`, a freeze a person sees too; the case passed alone at 25.3 s that day and failed in that day's gate at 34 s. The cause to fix is the switch's synchronous work, not the budget.
