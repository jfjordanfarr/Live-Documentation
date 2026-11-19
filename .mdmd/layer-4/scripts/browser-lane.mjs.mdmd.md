# scripts/browser-lane.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/browser-lane.mjs
- Generated At: 2026-11-19T07:03:51.073Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

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
