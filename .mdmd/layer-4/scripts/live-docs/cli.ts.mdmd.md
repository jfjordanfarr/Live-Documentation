# scripts/live-docs/cli.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/cli.ts
- Generated At: 2026-11-19T19:37:35.644Z

## Authored
### Purpose
What the Live Docs commands share at their edge: the version each prints, read from the manifest of the package that does its work (the generator's for `generate`, the engine's for `inspect` and `lint`); the folder a person ran it from, which every path they type is taken from and which is the workspace when they name none; the configuration each reads, the file given, else the workspace's own `.live-docs.config.json`, else the defaults; how each ends, a refused command line said on one line with the command that lists the options, any other failure by its message, both with exit code 1; and a quiet end when the reader closes the pipe before a listing is done.

### Notes
- Written 2026-10-18 when the history build found `generate --version` printing a constant, 0.1.0, or an environment variable, while the generator package is 0.0.0 and the history's lens carries the manifest's version ([the record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#work-notes-continued-the-c1-hand-back)); `inspect` and `lint` printed the same constant, and `inspect` piped into `head` died with an EPIPE trace. A command's version is its package's and nothing of its own, so the three read their manifests here, and the two that print long listings end quietly when the pipe closes.
- `UsageError`, `optionValue`, `runCommand` and `readConfiguration` (2026-11-12), after [the first-visit evaluation](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md) found the Explorer's builder dying on `--help` with a stack trace and the other commands ending a refused argument each in its own way. Every script a `live-docs:*` npm script runs now takes `--help` and `-h`, and ends through `runCommand` under that npm script's name, so that the hint it prints is a command a person can paste. Each parses its own arguments by hand; `optionValue` is the one rule for the value after an option, refused when it is missing or is itself an option.
- `readConfiguration` is the rule `generate` and `inspect` already followed, and the history command's lens follows in `computeHistory.ts`; `lint`, `board` and `visualize-static` read only the file given until 2026-11-12, which the npm scripts hid by pinning this repository's configuration, and which made `--workspace <folder>` read this repository's configuration for another folder. The pins went the same day.
- `decodeText` (2026-11-19): the configuration is read by its byte-order mark, UTF-8 with or without one or UTF-16 in either order, after [the cold run](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md#every-crash) found a configuration saved by Windows PowerShell 5.1, which writes the mark, stopping every command. The PowerShell reader decodes scripts by the same rule for itself; the history's lens reads the configuration by its own copy of `readConfiguration` without it ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md)).
- `invocationFolder`, `typedPath` and `workspaceFolder` (2026-11-19): every command's help said `--workspace` defaults to "the current directory", but `npm run` starts a script in this checkout's own folder wherever the person stands, so the default workspace and every relative path were this checkout's, which [the cold run](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md#the-strangers-steps-and-stumbles) met. The guides run the commands from the root of this checkout, where the two folders are one, so nothing changes there; elsewhere, as under `npm --prefix <checkout> run`, the folder meant is the one npm records in `INIT_CWD`. It is honoured only when npm started this very script, read from `npm_lifecycle_script`, since a process another command or a test starts inherits npm's variables while its own working directory is the one meant.
- Since the same day `workspaceFolder` refuses a name that is no folder, with the path it looked for: a mistyped `--workspace` reported "processed 0 file(s)" as a success and `generate` made the misspelled folder ([the cold run](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md#the-strangers-steps-and-stumbles)). Every command takes its workspace through it.
- `--stack` (2026-11-19): every command takes it, through `runCommand`, which lifts it off the command line before the command reads its own options, and prints a failure's stack and each cause's with it. Without it a failure ends with a line saying how to see where it failed. [The cold run](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md#the-strangers-steps-and-stumbles) had to call the generator from a script of its own to learn which code a crash came from. Which source file a crash concerns is the generator's to say ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md)).
- `gitIgnoresUnasked` (2026-11-19): discovery reads what git ignores by git's own word, and when git cannot answer, the folder's own `.gitignore` alone, which the code said and the person was never told; the [cold run's review](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md#windows) suspected it, and [the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md) found a repository's `bin/`, which a nested `.gitignore` hid, documented once git was off the path. `generate` now warns when the folder lies in a repository, found by a `.git` at it or above it, that git cannot be asked about, and notes when it lies in none. Git's own reason is not kept by `gitIgnored`, so the warning names the two usual ones and the command that tells which.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `invocationFolder` {#symbol-invocationfolder}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L32)
- Parameters: `env`: `NodeJS.ProcessEnv`

##### `invocationFolder` — Summary
The folder the person ran the command from: the workspace when they name
none, and where every path they type is taken from. `npm run` starts a
script in this checkout's own folder, wherever the person stands, and says
where they stood in `INIT_CWD`; that folder is the one meant, when npm
started this very script. A process started otherwise, by a test, by
another command or by a person running the script directly, inherits npm's
variables without having been started by it, and its own working directory
is the one meant.

##### `invocationFolder` — Parameters
- `cwd`: The process's working directory, where npm's script line is read from.
- `env`: The environment, for `INIT_CWD` and the script npm ran (`npm_lifecycle_script`).
- `script`: The script this process runs, as Node names it.

#### `typedPath` {#symbol-typedpath}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L45)

##### `typedPath` — Summary
A path the person typed, made absolute from the folder they ran the command from ({@link invocationFolder}).

#### `workspaceFolder` {#symbol-workspacefolder}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L55)

##### `workspaceFolder` — Summary
The folder a command works on: the one `--workspace` names, from where the
person ran the command, else that folder itself. A name that is no folder
is refused with the path looked for, since a mistyped one would otherwise
map nothing and say so as success, and `generate` would make the folder.

#### `gitIgnoresUnasked` {#symbol-gitignoresunasked}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L77)

##### `gitIgnoresUnasked` — Summary
What a person must be told of how the files git ignores are found in a
folder, when it is not by git's own word: discovery then reads the folder's
own `.gitignore` alone (`keptByGitAndConfiguration` in the engine's
discovery), and what a nested `.gitignore`, `.git/info/exclude` or the global
excludes file hides, a .NET project's `bin/` and `obj/` above all, gets docs.
A warning when the folder lies in a repository git cannot be asked about, as
when git is not on the path or does not trust the folder's owner; a note when
no repository holds it; nothing when git answers.

#### `packageVersion` {#symbol-packageversion}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L93)

##### `packageVersion` — Summary
The version of one of this repository's packages, from its manifest: a command prints its package's version, never a constant of its own.

#### `endQuietlyWhenThePipeCloses` {#symbol-endquietlywhenthepipecloses}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L100)

##### `endQuietlyWhenThePipeCloses` — Summary
Ends the process quietly when the reader closes the pipe before the listing is done, as `head` does, instead of dying with a stack trace.

#### `UsageError` {#symbol-usageerror}
- Type: class
- Source: [source](../../../../scripts/live-docs/cli.ts#L110)

##### `UsageError` — Summary
A command line the command refuses: one plain sentence, printed with where its options are listed and never with a stack.

#### `optionValue` {#symbol-optionvalue}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L113)

##### `optionValue` — Summary
The value after an option, refused when it is missing or is itself an option.

#### `runCommand` {#symbol-runcommand}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L131)

##### `runCommand` — Summary
Runs a command to its end, by the name of the npm script that runs it: a
refused command line prints one line, naming what was refused and how to list
the options; any other failure prints its message, with how to see where it
failed, and with `--stack` on the command line, the stack of the failure and
of each failure that caused it; both exit 1.

#### `decodeText` {#symbol-decodetext}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L168)

##### `decodeText` — Summary
A text file's characters, in whichever of the encodings Windows writes by
default it was saved: UTF-8 with or without a byte-order mark (Windows
PowerShell 5.1's `Set-Content -Encoding UTF8` writes the mark), or UTF-16
little- or big-endian after its mark (its `Out-File` and `>`). The mark
itself is not part of the text.

#### `readConfiguration` {#symbol-readconfiguration}
- Type: function
- Source: [source](../../../../scripts/live-docs/cli.ts#L182)

##### `readConfiguration` — Summary
The configuration a command reads: the file given, from the folder the
command was run from ({@link typedPath}), else the workspace's own
`.live-docs.config.json` when it has one, else nothing, which leaves the
shipped defaults. The history command reads its lens by the same rule.
Saved by Windows PowerShell 5.1 with a byte-order mark, or as UTF-16, it is
read all the same ({@link decodeText}).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `statSync`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput) (type-only)
- [`gitIgnored`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-gitignored)
<!-- LIVE-DOC:END Dependencies -->
