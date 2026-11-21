# `packages/engine/src/tooling/leaveOut.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/leaveOut.ts`
- Generated At: 2026-11-21T05:14:50.025Z

## Authored
### Purpose
Decides what a scan leaves out from a folder's listing alone, before anything is read: given the paths, the texts of the `.gitignore` and `.tfignore` files the listing names, a starting list and a person's own patterns, it answers for each path kept or left out and by which file and line, entry or pattern; and for a folder, whether a walk may leave it unlisted. It reads nothing and imports nothing of Node, so both hosts can share it.

### Notes
- Written on 2026-11-21 at the owner's ask ([Turn 3](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-3)) for "a good solid way to create ignore patterns on what they scan, before they scan it", as the one function [the design of one engine with two hosts](../../../../../../.mdmd/layer-3/engine-and-hosts.mdmd.md) names; built standalone and not yet wired into discovery. What it was measured against is [the leave-out probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md).
- `.gitignore` follows git's own rules, ported from git's `dir.c` and `wildmatch.c`, and is held to `git check-ignore` rule for rule by `leaveOut.oracle.test.ts`. `.tfignore` follows Microsoft's open-source TFVC client, Team Explorer Everywhere, since Visual Studio's is not public, and is held to that code's recorded verdicts by `leaveOut.tfvc.test.ts`. The one deliberate difference: a pattern's folder part is compared without regard to case, as TEE does on Windows.
- Pruning is reported, never assumed. A folder git ignores can be left unlisted, since git never re-includes beneath one. A folder a `.tfignore` excludes cannot, since TFVC's change scanner judges every file beneath it and a `!` line can keep one; `tf add` would not go in.
- Not known from a listing: `.git/info/exclude`, a person's global excludes file, and git's keeping of a file it tracks beneath an ignored folder; nor TFVC's global exclusion list, which a server sends.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `IgnoreFileText` {#symbol-ignorefiletext}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L65)

##### `IgnoreFileText` — Summary
An ignore file the listing names, at its path relative to the scanned folder, with its text.

#### `LeaveOutRule` {#symbol-leaveoutrule}
- Type: type
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L71)

##### `LeaveOutRule` — Summary
The rule that decided a path: which file and line, which entry of the starting list, or which of the person's patterns.

#### `LeaveOutVerdict` {#symbol-leaveoutverdict}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L77)

##### `LeaveOutVerdict` — Summary
The answer for one path: kept or left out, and the rule that decided, if any did (a kept path's rule is one that re-included it).

#### `FolderVerdict` {#symbol-folderverdict}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L83)
- Extends: [`LeaveOutVerdict`](#symbol-leaveoutverdict)

##### `FolderVerdict` — Summary
The answer for a folder, and whether nothing beneath it can be kept, so that a walk need not go in.

#### `LeaveOutInput` {#symbol-leaveoutinput}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L90)

##### `LeaveOutInput` — Summary
What decides a scan's leaving out: the ignore files the listing names, a starting list and a person's patterns.

#### `LeaveOut (interface)` {#symbol-leaveout-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L97)

##### `LeaveOut (interface)` — Summary
The decider of one listing: a file's verdict and a folder's, the folder's with whether a walk may leave it unlisted.

#### `leaveOut (function)` {#symbol-leaveout-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L524)
- Returns: [`LeaveOut`](#symbol-leaveout-interface)
- Parameters: `input`: [`LeaveOutInput`](#symbol-leaveoutinput)

##### `leaveOut (function)` — Summary
The decider for one listing's ignore files, starting list and person's patterns.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
