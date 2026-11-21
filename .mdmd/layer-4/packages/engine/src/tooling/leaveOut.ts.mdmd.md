# `packages/engine/src/tooling/leaveOut.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/leaveOut.ts`
- Generated At: 2026-11-21T18:33:55.126Z

## Authored
### Purpose
Decides what a scan leaves out by one list of patterns the person sees, read as one `.gitignore` at the top of the scanned folder: given the list's text, whether its names match without regard to case and the tool's own output folders, it answers for each path kept or left out and by which line of the list, and for a folder, whether a walk may leave it unlisted. A version control's own folder and the tool's own output stand outside the list and are never scanned. Beside the decider it holds the two translators that take a folder's ignore files into the list, `fromGitignores` and `fromTfignores`, each with what it could not carry, and `proposeLines`, which proposes lines naming the folders a listing shows to be build output or packages. It reads nothing and imports nothing of Node, so both hosts can share it.

### Notes
- Written on 2026-11-21 at the owner's ask ([Turn 3](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-3)) for "a good solid way to create ignore patterns on what they scan, before they scan it", as the one function [the design of one engine with two hosts](../../../../../../.mdmd/layer-3/engine-and-hosts.mdmd.md) names; built standalone and not yet wired into discovery. What it was measured against is [the leave-out probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md).
- Until the probe's eighth leg it weighed five layers in turn (the tool's own folders, a person's patterns, the ignore files in place, the evidence rules applied by default, an ignore file's `!`). The owner's model of that evening replaced them: "The list the user sees for ignore patterns is the source of truth for our software, and we can take that in from other ignore patterns as needed." Ignore files became sources a person chooses to use, add or ignore, and the evidence rules became proposals, never applied in silence ([the probe's eighth leg](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md)).
- The list follows git's own rules, ported from git's `dir.c` and `wildmatch.c`. `fromGitignores` puts a nested file's folder in front of its lines and orders the files shallowest first, so that last-match-wins gives what git gives; `leaveOut.oracle.test.ts` holds the result to `git check-ignore` with the files in place, and the probe's `git-agreement.ts` did the same on three real folders, 50,051 paths, without a difference. The one difference a list cannot remove is said, not hidden: where a list matching without case meets a folder spelled otherwise than one holding a nested file, which only a disk that tells case apart can hold.
- `fromTfignores` follows Microsoft's open-source TFVC client, Team Explorer Everywhere, since Visual Studio's is not public, and is held to that client's 468 recorded verdicts by `leaveOut.tfvc.test.ts`; its lines need a list that matches without regard to case. It cannot carry TFVC's rule that a final `.` matches a name with no extension, and says so.
- A folder left out is left out whole, as git and TFVC's `tf add` both have it; where a `!` line could have named something inside, the folder's answer carries a note naming the line.
- Not known from a listing: `.git/info/exclude`, a person's global excludes file, and git's keeping of a file it tracks beneath an ignored folder; nor TFVC's global exclusion list, which a server sends.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `IgnoreFileText` {#symbol-ignorefiletext}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L52)

##### `IgnoreFileText` — Summary
An ignore file the listing names, at its path relative to the scanned folder, with its text.

#### `DecidingLine` {#symbol-decidingline}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L58)

##### `DecidingLine` — Summary
The line of the list that decided a path: its number from 1, and its text as written.

#### `LeaveOutVerdict` {#symbol-leaveoutverdict}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L68)

##### `LeaveOutVerdict` — Summary
The answer for one path: kept or left out; the line that decided, if one did (a kept path's line is a `!` that
re-included it); `fixed` where the path is a version control's own or the tool's own output, which no line can keep;
and, for a path left out with its folder, the `!` lines that could have named it.

#### `FolderVerdict` {#symbol-folderverdict}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L76)
- Extends: [`LeaveOutVerdict`](#symbol-leaveoutverdict)

##### `FolderVerdict` — Summary
The answer for a folder, and whether nothing beneath it can be kept, so that a walk need not go in.

#### `LeaveOutInput` {#symbol-leaveoutinput}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L81)

##### `LeaveOutInput` — Summary
What decides a scan's leaving out.

#### `LeaveOut (interface)` {#symbol-leaveout-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L91)

##### `LeaveOut (interface)` — Summary
The decider of one list: a file's verdict and a folder's, the folder's with whether a walk may leave it unlisted.

#### `EVIDENCE` {#symbol-evidence}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L469)
- Returns: `ReadonlyArray`

##### `EVIDENCE` — Summary
The evidence rules: each leaves a folder out only where what the folder holds, or what stands beside it, shows it
to be a build's output or a package manager's, by the names alone. `bin` and `obj` beside a project file; `packages`
holding NuGet's `<Id>.<Version>` folders or a `repositories.config`; `node_modules` holding a package's
`package.json` in one of its first three folders.

#### `leaveOut (function)` {#symbol-leaveout-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L509)
- Returns: [`LeaveOut`](#symbol-leaveout-interface)
- Parameters: `input`: [`LeaveOutInput`](#symbol-leaveoutinput)

##### `leaveOut (function)` — Summary
The decider of one list. Each folder's answer is kept, so that a walk asks of each folder once, before going in.

#### `TakenIn` {#symbol-takenin}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L562)

##### `TakenIn` — Summary
One kind of ignore file rewritten as lines of the one list, and what the rewrite could not carry.

#### `fromGitignores` {#symbol-fromgitignores}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L589)
- Returns: [`TakenIn`](#symbol-takenin)

##### `fromGitignores` — Summary
A folder's `.gitignore` files as lines of the one list that decide as the files did in place: each line of a file in
a folder below the top has that folder put in front (`docs/*.md` in `sub/` becomes `sub/docs/*.md`, a name alone
becomes `sub/**` and the name, so that it still matches at any depth below `sub`), anchoring and `!` and a trailing
`/` kept; the files go shallowest first, so that the last matching line is the deepest file's, as git asks the
deepest file first. Names match as the repository's `core.ignorecase` says, which the list's own setting must follow.

#### `fromTfignores` {#symbol-fromtfignores}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L624)
- Returns: [`TakenIn`](#symbol-takenin)

##### `fromTfignores` — Summary
A folder's `.tfignore` files as lines of the one list, by TFVC's rules as Team Explorer Everywhere reads them: `\`
becomes `/`; a leading separator, "this folder only", anchors the line at its file's folder (`/bin`), else the name
matches at any depth below it (`sub/**` and the name); a path before the name names a folder literally; only `*` and
`?` are wildcards, every other character is written literally. An exclusion in TFVC leaves out whatever lies
beneath a folder it names even where a `!` keeps the folder itself, so where any file has a `!`, each exclusion is
followed by the same line with `/**`. Names match without regard to case, so the list must too.

#### `ProposedLine` {#symbol-proposedline}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L659)

##### `ProposedLine` — Summary
A line proposed for the list, the rule of what the folders are that proposed it, and the folders it names.

#### `proposeLines` {#symbol-proposelines}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L671)
- Returns: [`ProposedLine`](#symbol-proposedline)[]

##### `proposeLines` — Summary
Lines naming the folders a listing shows to be build output or packages, by the evidence rules, for the person to
take into the list or not. A name alone (`bin/`) is proposed only where it leaves out no folder of that name that
the exact lines would keep, and, for a list that matches case, only where every such folder is spelled alike; else
one anchored line a folder (`/src/App/bin/`). A folder inside another proposed folder is not named again.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
