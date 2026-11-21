# `packages/engine/src/tooling/leaveOut.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/leaveOut.ts`
- Generated At: 2026-11-21T06:36:28.088Z

## Authored
### Purpose
Decides what a scan leaves out from a folder's listing alone, before anything is read: given the paths, the texts of the `.gitignore` and `.tfignore` files the listing names, a starting list and a person's own patterns, it answers for each path kept or left out and by which file and line, entry or pattern; and for a folder, whether a walk may leave it unlisted. It reads nothing and imports nothing of Node, so both hosts can share it.

### Notes
- Written on 2026-11-21 at the owner's ask ([Turn 3](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-3)) for "a good solid way to create ignore patterns on what they scan, before they scan it", as the one function [the design of one engine with two hosts](../../../../../../.mdmd/layer-3/engine-and-hosts.mdmd.md) names; built standalone and not yet wired into discovery. What it was measured against is [the leave-out probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md).
- `.gitignore` follows git's own rules, ported from git's `dir.c` and `wildmatch.c`, and is held to `git check-ignore` rule for rule by `leaveOut.oracle.test.ts`. `.tfignore` follows Microsoft's open-source TFVC client, Team Explorer Everywhere, since Visual Studio's is not public, and is held to that code's recorded verdicts by `leaveOut.tfvc.test.ts`. The one deliberate difference: a pattern's folder part is compared without regard to case, as TEE does on Windows.
- Since the root's ruling of 2026-11-21 a folder left out is left out whole under either syntax: it is not entered, and a `!` line keeps something only where its folder is kept, as git and TFVC's `tf add` both have it. TFVC's change scanner, which looks inside, is given up for it, and where a `!` line at or above could have named something inside, the folder's answer carries a note naming the line. In the same round: `.gitignore`'s case became the repository's `core.ignorecase`, handed in; the tool's own output is never scanned, by a rule kind of its own; the person's patterns and a starting list are read without regard to case; the evidence rules joined the starting lists; and each folder's state is kept, so that 167,833 paths are decided in about half a second in Node ([the probe's second leg](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md#second-leg-later-on-2026-11-21-the-roots-five-rulings-built-and-measured)).
- In the third leg the same day the starting list was decided: the evidence rules, which leave a folder out by what it is, and no list of names, since each list measured left out real source in folders that bore its names (12, 63 and 29 files on DNN). The evidence rules apply beneath any ignore file, only a person's `!` keeps what they find, and they are one setting, applied or only reported, since in a git repository they can leave out files git tracks. A version control's own folder (`.git`, `.hg`, `.svn`, TFVC's `$tf` and `.tf`) is never scanned, nor a `.git` pointer file. Measured against today's discovery on this repository and every fixture, swapping the function in would change nothing but what discovery's own rules by name, the configuration's `exclude` and git's word on tracked files decide ([the probe's third leg](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md#third-leg-later-on-2026-11-21-the-starting-list-decided-the-swap-and-a-dropped-folder)).
- Not known from a listing: `.git/info/exclude`, a person's global excludes file, and git's keeping of a file it tracks beneath an ignored folder; nor TFVC's global exclusion list, which a server sends.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `IgnoreFileText` {#symbol-ignorefiletext}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L87)

##### `IgnoreFileText` — Summary
An ignore file the listing names, at its path relative to the scanned folder, with its text.

#### `LeaveOutRule` {#symbol-leaveoutrule}
- Type: type
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L93)

##### `LeaveOutRule` — Summary
The rule that decided a path.

#### `LeaveOutVerdict` {#symbol-leaveoutverdict}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L104)

##### `LeaveOutVerdict` — Summary
The answer for one path: kept or left out, and the rule that decided, if any did (a kept path's rule is one that
re-included it); for a path left out with its folder, the `!` lines that could have named it; and, where the evidence
rules are only reported, the rule that would have left a kept folder out.

#### `FolderVerdict` {#symbol-folderverdict}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L112)
- Extends: [`LeaveOutVerdict`](#symbol-leaveoutverdict)

##### `FolderVerdict` — Summary
The answer for a folder, and whether nothing beneath it can be kept, so that a walk need not go in.

#### `EvidenceSetting` {#symbol-evidencesetting}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L122)

##### `EvidenceSetting` — Summary
The evidence rules' setting: the names a folder holds (a folder's with a trailing `/`), which a lazy walk answers by
listing one level further; and whether a folder they find is left out (`apply`) or kept and reported.

#### `LeaveOutInput` {#symbol-leaveoutinput}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L128)

##### `LeaveOutInput` — Summary
What decides a scan's leaving out.

#### `LeaveOut (interface)` {#symbol-leaveout-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L140)

##### `LeaveOut (interface)` — Summary
The decider of one listing: a file's verdict and a folder's, the folder's with whether a walk may leave it unlisted.

#### `EVIDENCE` {#symbol-evidence}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L573)
- Returns: `ReadonlyArray`

##### `EVIDENCE` — Summary
The evidence rules: each leaves a folder out only where what the folder holds, or what stands beside it, shows it
to be a build's output or a package manager's, by the names alone. `bin` and `obj` beside a project file; `packages`
holding NuGet's `<Id>.<Version>` folders or a `repositories.config`; `node_modules` holding a package's
`package.json` in one of its first three folders.

#### `leaveOut (function)` {#symbol-leaveout-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/leaveOut.ts#L621)
- Returns: [`LeaveOut`](#symbol-leaveout-interface)
- Parameters: `input`: [`LeaveOutInput`](#symbol-leaveoutinput)

##### `leaveOut (function)` — Summary
The decider for one listing's ignore files, evidence rules, person's patterns and the tool's own output.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
