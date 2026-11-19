# scripts/browser-lane.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/browser-lane.mjs
- Generated At: 2026-11-19T07:09:25.750Z

## Authored
### Purpose
The browser lane: one command, `node scripts/browser-lane.mjs [--label <who>] [--max-seconds <n>] -- <command…>`, through which builders sharing one machine take the browser one at a time, first come, first served, and always give it back. `--status` says who holds and who waits, and for how long. It is a tool for developing Live Documentation, not part of the product; the [internal tooling reference](../../layer-2/internal-tooling.mdmd.md#the-browser-lane) says how to use it.

### Notes
- Written on 2026-11-19, after a night on which five to eight builders shared the browser by taking `flock -x /tmp/live-docs-browser.lock` round their runs by hand. The owner's rule that night was that builders "quickly hop in a browser, run their testing screenshots, and get back out" ([Turn 36 of the November 18 session](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-36)), and the next turn made many builders the standing way of work: "We are in the age of parallel builders" ([Turn 37](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)). Each part of the lane answers one fault of that night:
  - **First come, first served.** `flock` serves no queue: one builder held the browser thirty-six minutes while seven waited, and a late arrival was sometimes served before a long waiter. A caller takes the next numbered ticket in `/tmp/live-docs-browser-lane/tickets/`, created exclusively so that two arrivals cannot take one number, and holds the lane when every ticket before it is gone or dead. A ticket is dead when its process is: the pid is asked and, from `/proc`, its start time compared, so that a reused pid is not mistaken for the waiter. The folder is named under `/tmp` and not the session's temporary directory, so that sessions whose `TMPDIR` differ still meet in one lane, beside the older lock.
  - **A cap that ends the hold, and says so.** Holds had no cap; a hold that was cut by a cap of its own making then read as 21 failures, the remaining cases failing as the server went. The cap is 300 s unless `--max-seconds` says otherwise. At the cap the command's process group is sent SIGTERM, then SIGKILL after five seconds, and the exit is 124 as `timeout(1)` gives. While the command runs, the lane counts a Playwright run's announced cases ("Running 12 tests using 2 workers", once per pass of the two-pass runner) and the list reporter's rows for finished cases; its last line after a cut says "CUT", how many cases had finished and how many did not, and that a failure printed after the cut is the cut.
  - **Nothing left behind.** An `npx http-server` started inside a locked script kept the lock twenty minutes after its work was done, and twice a cleanup ended the `npx` wrapper and left the server holding its port. Playwright starts its web server in a process group of its own, so ending the command's group is not enough. The lane gives the command an environment variable, `LIVE_DOCS_BROWSER_LANE`, whose value is the hold's own token; every process the command starts inherits it whatever group or session it moves to, so at the end the lane reads `/proc/*/environ`, ends every process carrying the token, and names in its log the ports any of them listened on (from `/proc/net/tcp`). Where the lane itself was killed without a chance to clean up, its ticket stays live while processes carrying its token run and its cap has not passed; after that the next in line ends them and logs it.
  - **One lane while the old convention is still in use.** While holding, the lane also takes `/tmp/live-docs-browser.lock` by `flock` on a file it keeps open, so the lock is released when the lane ends however it ends; a builder still on `flock` never overlaps it. When someone outside the lane holds that lock, the lane says it is waiting for it. A command that would itself take the same lock is refused, since it would wait on the lane until the cap, and a lane started inside another is refused for the same reason.
  - **Builds stay outside.** Builders built bundles while holding the lock. The lane cannot tell a build from a browser run; its log's `held=` figures make such holds visible, and the reference asks for builds before the lane.
- Every hold appends one line to `/tmp/live-docs-browser-lane/lane.log`: the time, the label (the working directory's name unless `--label` gives one), seconds waited and held, the exit, whether it was capped, for a Playwright run the cases finished of those announced and how many failed, what was left behind with its ports, and the command.
- The pure parts (the queue's order and the skipping of dead tickets, a ticket's state, the cap, reading a run's progress, the cut's words) are exported and tested in [`browser-lane.test.ts`](./browser-lane.test.ts.mdmd.md), which also drives the lane with stand-in commands. Linux is assumed for `/proc` and `flock`; elsewhere the lane still queues and caps, but cannot find what left the group.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DEFAULT_MAX_SECONDS` {#symbol-default_max_seconds}
- Type: const
- Source: [source](../../../scripts/browser-lane.mjs#L24)

##### `DEFAULT_MAX_SECONDS` — Summary
How long a hold may last, in seconds, unless `--max-seconds` says otherwise.

#### `GRACE_SECONDS` {#symbol-grace_seconds}
- Type: const
- Source: [source](../../../scripts/browser-lane.mjs#L27)

##### `GRACE_SECONDS` — Summary
How long an ended command is given between the polite signal and the forceful one, in seconds.

#### `LANE_MARK` {#symbol-lane_mark}
- Type: const
- Source: [source](../../../scripts/browser-lane.mjs#L30)

##### `LANE_MARK` — Summary
The environment variable that marks every process a hold's command starts; its value is the hold's own token.

#### `CAPPED_EXIT` {#symbol-capped_exit}
- Type: const
- Source: [source](../../../scripts/browser-lane.mjs#L33)

##### `CAPPED_EXIT` — Summary
The exit code of a hold its cap ended, as `timeout(1)` gives.

#### `lanePlaces` {#symbol-laneplaces}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L42)

##### `lanePlaces` — Summary
Where the lane keeps its tickets and log, and which older lock it also takes. Named absolutely under `/tmp` where
there is one, beside the older lock, so that sessions whose temporary directories differ still meet in one lane; the
environment may name others, as the lane's own tests do.

#### `ticketName` {#symbol-ticketname}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L54)

##### `ticketName` — Summary
A ticket's file name for its place in the queue, padded so that the names sort as their numbers do.

#### `ticketSeq` {#symbol-ticketseq}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L59)

##### `ticketSeq` — Summary
The place in the queue a ticket's file name holds, or undefined for any other file.

#### `laneTurn` {#symbol-laneturn}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L68)

##### `laneTurn` — Summary
Whose turn it is. The tickets are taken in the order of their numbers; a ticket whose state is "dead" is skipped;
the first that is not holds the lane and the rest wait behind it in order.

#### `capReached` {#symbol-capreached}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L83)

##### `capReached` — Summary
Whether a hold begun at `heldSince` (ms) has reached a cap of `maxSeconds` at `now` (ms).

#### `ticketState` {#symbol-ticketstate}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L93)

##### `ticketState` — Summary
A ticket's state, from what the machine says of it. "live" while the lane process that took it runs; also while that
process is gone but processes its command started still run and its hold is within its cap and grace, since they may
still be using the browser. "abandoned" when such processes outlive the cap with no lane to end them: the next in
line ends them. Otherwise "dead", and skipped.

#### `emptyProgress` {#symbol-emptyprogress}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L101)

##### `emptyProgress` — Summary
A Playwright run's progress as its list reporter prints it: cases announced, and those finished by outcome.

#### `readProgressLine` {#symbol-readprogressline}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L113)

##### `readProgressLine` — Summary
The progress after one line of output. "Running 12 tests using 2 workers" adds to the cases announced (the two-pass
runner prints it once per pass); the list reporter's row for a finished case begins with its mark (✓ or "ok" for a
pass, ✘ or "x" for a failure, "-" for a skip) and its number.

#### `finished` {#symbol-finished}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L124)

##### `finished` — Summary
The cases a progress has seen finish.

#### `cutNotice` {#symbol-cutnotice}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L133)

##### `cutNotice` — Summary
What the lane says when its cap ends a hold: plainly that the run was cut, and, for a Playwright run, how many of its
cases had finished at the cut, so that the failures the cut itself causes (the server going away under the cases
still running) are not read as the product's.

#### `holdLine` {#symbol-holdline}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L145)

##### `holdLine` — Summary
The lane log's line for one hold.

#### `parseArguments` {#symbol-parsearguments}
- Type: function
- Source: [source](../../../scripts/browser-lane.mjs#L169)

##### `parseArguments` — Summary
The command line's request: `{ status: true }`, or `{ label, maxSeconds, command }`; throws with the reason when the
line cannot be read.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawn`, `spawnSync`
- `node:crypto` - `randomBytes`
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-2/internal-tooling.mdmd.md`](../../layer-2/internal-tooling.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
