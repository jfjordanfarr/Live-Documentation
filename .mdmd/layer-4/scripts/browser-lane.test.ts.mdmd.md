# `scripts/browser-lane.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/browser-lane.test.ts`
- Generated At: 2026-11-19T21:10:18.166Z

## Authored
### Purpose
Tests of the [browser lane](./browser-lane.mjs.mdmd.md): its queue's rules as pure functions, then the lane itself driven with stand-in commands in a lane folder and an older lock of each test's own, so that no test touches the lane builders are using.

### Notes
- Written with the lane on 2026-11-19 ([Turns 36 and 37 of the November 18 session](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-36)). The driven cases are: three callers served in the order they took their tickets, each with an older lock of its own so that the queue alone orders them; a ticket left by a process that is gone skipped; a command that outlives a one-second cap ended, the cut said on the last line, and the lane free for the next; a cut stand-in Playwright run whose last line counts the cases that had finished; a server started in a session of its own and left listening, ended, with its port named; a holder of the older lock outside the lane waited for; and a command that would take that lock again refused.
- No case asserts a duration, by the rule for that night's new cases ([Turn 36](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-36)): the stand-ins wait on files the test writes, and the cases wait on states (a mark written, a ticket present, the lane saying it waits) and read orders.
- Each case was seen to fail with the logic it guards broken on purpose: the queue sorted backwards and the older lock not taken (the order case, then the lock case, which until it waited for the lane's own "waiting for" line had passed by a race), a dead ticket counted as live, the cap never reached, and the sweep of what was left behind skipped.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawn`, `spawnSync`
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`browser-lane.CAPPED_EXIT`](./browser-lane.mjs.mdmd.md#symbol-capped_exit)
- [`browser-lane.GRACE_SECONDS`](./browser-lane.mjs.mdmd.md#symbol-grace_seconds)
- [`browser-lane.capReached`](./browser-lane.mjs.mdmd.md#symbol-capreached)
- [`browser-lane.cutNotice`](./browser-lane.mjs.mdmd.md#symbol-cutnotice)
- [`browser-lane.emptyProgress`](./browser-lane.mjs.mdmd.md#symbol-emptyprogress)
- [`browser-lane.laneTurn`](./browser-lane.mjs.mdmd.md#symbol-laneturn)
- [`browser-lane.parseArguments`](./browser-lane.mjs.mdmd.md#symbol-parsearguments)
- [`browser-lane.readProgressLine`](./browser-lane.mjs.mdmd.md#symbol-readprogressline)
- [`browser-lane.ticketName`](./browser-lane.mjs.mdmd.md#symbol-ticketname)
- [`browser-lane.ticketSeq`](./browser-lane.mjs.mdmd.md#symbol-ticketseq)
- [`browser-lane.ticketState`](./browser-lane.mjs.mdmd.md#symbol-ticketstate)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
