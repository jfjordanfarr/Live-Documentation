# `packages/generator/src/history/generatorIdentity.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/generator/src/history/generatorIdentity.ts`
- Generated At: 2026-11-20T15:11:43.928Z

## Authored
### Purpose
The generator's half of the history's lens: its package version and, when it runs from this tool's checkout, the commit and the committed and uncommitted identities of its code and dependency lock.

### Notes
- Written 2026-10-17 for C1, scenario 13 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md): "A sequence says which generator and configuration made it". The commit alone would let a cache made before an edit serve a run after it; the diff and untracked files under `packages/engine` and `packages/generator` close that.
- A checkout of this repository is recognized by the generator standing at `packages/generator` of the git top level, so a copy installed into another repository reports no commit.
- The code as committed (the evening of 2026-10-18): the tree ids of the engine and the generator at the commit, read by one `git rev-parse` and hashed, so that the lens follows the code and not the commit; the commit is still named for the reader.
- Since 2026-11-19 the code is the blob of each file that makes a summary, not the two trees whole: every file of the two packages but their tests (`*.test.ts`) and the modules of their `history` folders that only read summaries into a sequence, the summarizing process's own (`SUMMARY_MODULES`: `summary.ts`, `textStore.ts`, `summarizeChange.ts`) kept in. Keyed on the trees, an edit to a test or to the codec began a new cache folder and a full rebuild, and the owner's three rungs of history in 2D ([Turn 37 of November 18](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)) were to be built over several commits of those modules after one rebuild. A file of the two packages whose part in a summary nobody has weighed is keyed, not trusted: the rule leaves out only the history folders' modules, and `generatorIdentity.test.ts` walks the summarizing process's run-time imports with the TypeScript parser and fails if it reaches a module the key leaves out (it was seen to fail on a deliberate import of the codec). The uncommitted half hashes the working bytes, or the absence, of each keyed file `git status` names.
- Why the key holds a rule and not the closure itself: the closure of the summarizer's imports is the TypeScript modules it runs, but a summary also depends on what those modules read at run time that no import names, the parser grammars under `packages/engine/grammars/` and any data file beside the code; a rule that keeps every file of the two packages but the tests and the history folders' other modules covers those without knowing them, while a key of the closure alone would miss them. The guard test computes the closure from `summarizeChange.ts` and fails if any module it reaches is outside the rule; it follows dynamic `import()` and `require()` calls, which the summarizer's own closure does not use today. A type-only import cannot hide a value: TypeScript refuses to use a name brought in by `import type` as a value, and an import that mixes values and types counts as a value import in the walk. The installed dependencies, the parsers among them, are keyed by the tool's `package-lock.json`, as before. Until a later edit of 2026-11-19 the version-control seam (`git.ts`) and the command's code that starts the summarizing process were not keyed, and [the independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/README.md) found that they decide which files and which environment a summary sees. Both are now keyed (`SUMMARY_MODULES` gained `git.ts` and `regenerate.ts`), the guard walks the imports of both sides (`SUMMARY_ENTRIES`), JSON and `import x = require()` included, refuses an import it cannot follow, and keys every module of the history folders that starts a process or implements the version control: what runs in the command on a summary's behalf is known by those two acts. Every file of the history folders that is not a TypeScript module is keyed, and so is the runtime's version of Unicode (`process.versions.unicode`), which the anchors and the engine's order depend on through the case of letters. What the key cannot see is written in [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-history-carries-each-commits-rows-and-words-recorded-2026-11-19).
- This tool checkout's root `package-lock.json` also belongs to the lens: its committed Git entry joins the code hash, and the working file's actual blob is compared with that entry whether Git tracks or ignores it. A differing blob joins the modified hash; an absent lock has a stable marker. The scanned project's lock never enters the generator identity; an installed copy without this tool checkout retains the existing version-only identity rather than borrowing its host's lock. This corrects the cache-identity gap found in the [October 19 generation-cost investigation](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-19/Probes/generation-cost/README.md#the-cache-boundary-to-investigate).
- Since [the second review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/second-review.md) the key also holds `tsconfig.base.json`, whose paths decide that the summarizing process loads the packages' sources. The guard finds a process started by any import of `child_process`, a call of `execFile`, `spawn`, `fork` or `exec`, or the engine's `execFileAsync`, allowing this module alone unkeyed, and holds the members of `RegenerationContext` and `SummaryTask` to a reviewed list, each with why it cannot change a summary unkeyed.

- Since 2026-11-20 ([the record of making a run fast](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md)) `sequenceCodeIdentity` names the code that reads summaries into a sequence as the lens names the code that makes one: every file of the two packages but the tests (`readsSummaries`), keyed or not, the lock and the runtime's Unicode, the commit left out. The history command goes on from the sequence it wrote last only under the same identity. `checkoutOf` takes the rule it hashes by, so that the lens's key is made exactly as before.
- Since [the independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md#the-independent-review-and-its-mends) of the same day it holds git's own version (`git --version`) too: the steps carry git's word on what each change renamed and touched, and another git, as in a container rebuilt, could give other words to steps derived anew than to those written. The lens does not hold it.
- Since a later edit of 2026-11-20 the lock keys the lens, and the sequence's identity, only through the entries of the packages the summarizing code can load (`keyedLockEntries`, `lockIdentity`): the two packages' dependencies resolved through the lock as Node resolves them, and the packages loaded that neither declares, named with their reasons in `LOCK_ROOTS` (`tsx` as the workers find it and as the command itself runs under it; `glob`, imported by the generator undeclared). A link to any folder but the two packages' is refused, since the key would hold its files by a version alone. Where npm recorded the installation (`node_modules/.package-lock.json`), the record is walked as the lock is, and a keyed place it reaches that the lock does not (a nearer copy an unsaved install left), a required one it does not reach, or one whose version or integrity differs joins the modified half (`installationDifference`), so that an installation a pull left behind never makes summaries under the clean key; another `resolved` for the same integrity, a registry mirror's, is no difference, and an installed link to a folder the lens does not key stops the run, naming the record. Where there is no record, nothing is checked. Until the reviewer's second look of the same day only the lock's own places were asked about, and a nearer copy went unseen. A pin of the browser tests' Playwright had moved the whole-lock key and owed the history a rebuild of 34 to 71 minutes. The working lock counts only where its keyed entries differ from the committed one's. `history-lens-lock.test.ts` holds the list to what a real worker reads under `node_modules`; [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-dependency-lock-keys-the-lens-only-through-the-packages-a-summary-loads-recorded-2026-11-20) says what the key trusts and cannot see.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LOCK_ROOTS` {#symbol-lock_roots}
- Type: const
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L82)
- Returns: `ReadonlyArray`

##### `LOCK_ROOTS` — Summary
The packages the summarizing process loads that neither {@link GENERATOR_FOLDERS} package declares, each found as
Node finds it from the folder it is loaded from, with why it is loaded: the lock's dependencies of the two packages
cannot show them.

#### `keyedLockEntries` {#symbol-keyedlockentries}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L151)
- Parameters: `roots`: `ReadonlyArray`

##### `keyedLockEntries` — Summary
The entries of a lock's `packages` map that the code of `starts` can load, by their places in the map, each with
{@link KEYED_FIELDS} as the lock has them: the entry of each start and of each of `roots`, and every entry reached
from them by their `dependencies`, `optionalDependencies` and `peerDependencies`, each name found as Node finds it,
at the nearest `node_modules` place upward from the entry that names it, and a link followed into the start it links
to. An optional dependency or a peer the lock does not hold is not installed, and is passed over; a dependency or a
root it does not hold cannot be keyed, and throws, as does a link to any folder but a start, whose files the code
half of the key does not hold.

Walked over npm's record of an installation (`record`), whatever is missing is passed over rather than thrown at,
since the comparison with the lock's walk finds it not installed; a link to any folder but a start still throws,
naming the record.

##### `keyedLockEntries` — Parameters
- `record`: Whether `packages` is npm's record of an installation rather than the lock.
- `roots`: The packages loaded that no dependency of the workspaces names ({@link LOCK_ROOTS}).
- `starts`: The places of the workspaces whose code makes a summary.

#### `installationDifference` {#symbol-installationdifference}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L222)

##### `installationDifference` — Summary
Where the installation differs from the lock in the entries the lens keys, as text for the key's modified half, or
`null` where it does not. The installation is read from npm's own record of it, `node_modules/.package-lock.json`,
which `npm ci` and `npm install` write, walked as the lock is walked ({@link keyedLockEntries}), so that a copy the
lock does not name and the code would load first, one nested under a workspace by an install that did not save it
say, is found where it stands. The two keyed sets are compared place by place: a place the installation reaches and
the lock does not differs; a place the lock reaches and the installation does not differs unless the lock marks it
optional (another platform's binary is optional, and is not installed here); a place both reach differs where its
content does, by its version and integrity where both hold an integrity, a registry mirror's other `resolved` being
no other content, and by every keyed field where they do not (a git source, a link). A link of the installation to a
folder whose files the lens does not key, as `npm link` writes, throws, naming the record. Where there is no record,
nothing is checked and `null` is returned, so that a `node_modules` installed by other means, or changed by hand, is
trusted to be the lock's.

##### `installationDifference` — Parameters
- `installed`: npm's record of what it installed, or `null` where there is none.
- `lock`: The working lock, which the key's modified half already holds where it differs from the committed one.

#### `lockIdentity` {#symbol-lockidentity}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L270)

##### `lockIdentity` — Summary
The half of the key a lock gives: a hash of {@link keyedLockEntries} in the order of their places, so that a change
to the lock that touches none of them, a tool of the repository's development pinned to another version say, leaves
it as it was. An absent lock has an identity of its own.

#### `HISTORY_FOLDERS` {#symbol-history_folders}
- Type: const
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L277)

##### `HISTORY_FOLDERS` — Summary
The folders of the history's own modules, most of which read summaries and never make one.

#### `SUMMARY_MODULES` {#symbol-summary_modules}
- Type: const
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L284)

##### `SUMMARY_MODULES` — Summary
The modules of {@link HISTORY_FOLDERS} that decide what a summary says: those the summarizing process runs, and those
the history command runs on its behalf, which write the commit's tree it reads and start it with its task and its
environment.

#### `SUMMARY_ENTRIES` {#symbol-summary_entries}
- Type: const
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L295)

##### `SUMMARY_ENTRIES` — Summary
The modules from which the guard reads what decides a summary: the summarizing process, and the command's side of it.

#### `keysTheLens` {#symbol-keysthelens}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L301)

##### `keysTheLens` — Summary
Whether a file, by its repository-relative path, keys the lens: every file of the two packages but a test and the
TypeScript modules of the history folders that decide nothing of a summary, and the base TypeScript configuration.

#### `generatorIdentity` {#symbol-generatoridentity}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L324)

##### `generatorIdentity` — Summary
The generator's package version and, when it runs from a checkout of this
repository, a hash of the code that makes a summary and of the tool
dependency lock as committed (each keyed file's blob id at the commit, and
the lock's {@link lockIdentity}), the commit it runs from, and a hash of
uncommitted changes to those inputs. The working lock counts as changed
only where its keyed entries differ from the committed lock's, and is read
even when Git ignores it. An absent lock has its own stable identity; a
scanned project's lock is never read.

#### `readsSummaries` {#symbol-readssummaries}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L336)

##### `readsSummaries` — Summary
Whether a file, by its repository-relative path, is code the history command may run while it reads summaries into
a sequence: every file of the two packages but a test, whether it keys the lens or not, and the base TypeScript
configuration. A superset of what does that work (`computeHistory.ts` and the modules of the history folders it
reads summaries with), so that a module whose part in the reading nobody has weighed is counted rather than trusted.

#### `sequenceCodeIdentity` {#symbol-sequencecodeidentity}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L352)

##### `sequenceCodeIdentity` — Summary
The identity of the code that turns summaries into a sequence, as {@link generatorIdentity} is the identity of the
code that makes a summary: a hash of the generator's package version, of every file {@link readsSummaries} counts as
committed and of the tool dependency lock's {@link lockIdentity}, of their uncommitted changes, and of the runtime's version of Unicode,
which the order of names depends on. The commit it runs from is left out, as the lens leaves it out. Where the
generator is installed rather than run from a checkout, its version stands for its code. Added on 2026-11-20 for
the history command, which goes on from the sequence it wrote last only under the same identity.

Since the independent review of that day it holds git's own version too (`git --version`): the steps carry git's
word on what each change renamed and touched, and another git, as in a container rebuilt, could give other words to
steps derived anew than those written.

#### `checkoutOf` {#symbol-checkoutof}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L364)

##### `checkoutOf` — Summary
The keyed inputs of a checkout of this repository whose generator package stands at `packageRoot`, by the rule
`keyed`, or `undefined` where `packageRoot` is no such checkout's. Exported so that a test can compute it for a
repository of its own making.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- `node:fs` - `promises`
- `node:path` - `path`
- [`format.GeneratorIdentity`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-generatoridentity) (type-only)
- [`git.historyGit`](../../../engine/src/live-docs/history/git.ts.mdmd.md#symbol-historygit)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
