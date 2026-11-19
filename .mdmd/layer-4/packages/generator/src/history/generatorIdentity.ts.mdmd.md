# packages/generator/src/history/generatorIdentity.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/generatorIdentity.ts
- Generated At: 2026-11-19T08:59:55.171Z

## Authored
### Purpose
The generator's half of the history's lens: its package version and, when it runs from this tool's checkout, the commit and the committed and uncommitted identities of its code and dependency lock.

### Notes
- Written 2026-10-17 for C1, scenario 13 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md): "A sequence says which generator and configuration made it". The commit alone would let a cache made before an edit serve a run after it; the diff and untracked files under `packages/engine` and `packages/generator` close that.
- A checkout of this repository is recognized by the generator standing at `packages/generator` of the git top level, so a copy installed into another repository reports no commit.
- The code as committed (the evening of 2026-10-18): the tree ids of the engine and the generator at the commit, read by one `git rev-parse` and hashed, so that the lens follows the code and not the commit; the commit is still named for the reader.
- Since 2026-11-19 the code is the blob of each file that makes a summary, not the two trees whole: every file of the two packages but their tests (`*.test.ts`) and the modules of their `history` folders that only read summaries into a sequence, the summarizing process's own (`SUMMARY_MODULES`: `summary.ts`, `textStore.ts`, `summarizeChange.ts`) kept in. Keyed on the trees, an edit to a test or to the codec began a new cache folder and a full rebuild, and the owner's three rungs of history in 2D ([Turn 37 of November 18](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)) were to be built over several commits of those modules after one rebuild. A file of the two packages whose part in a summary nobody has weighed is keyed, not trusted: the rule leaves out only the history folders' modules, and `generatorIdentity.test.ts` walks the summarizing process's run-time imports with the TypeScript parser and fails if it reaches a module the key leaves out (it was seen to fail on a deliberate import of the codec). The uncommitted half hashes the working bytes, or the absence, of each keyed file `git status` names.
- Why the key holds a rule and not the closure itself: the closure of the summarizer's imports is the TypeScript modules it runs, but a summary also depends on what those modules read at run time that no import names, the parser grammars under `packages/engine/grammars/` and any data file beside the code; a rule that keeps every file of the two packages but the tests and the history folders' other modules covers those without knowing them, while a key of the closure alone would miss them. The guard test computes the closure from `summarizeChange.ts` and fails if any module it reaches is outside the rule; it follows dynamic `import()` and `require()` calls, which the summarizer's own closure does not use today. A type-only import cannot hide a value: TypeScript refuses to use a name brought in by `import type` as a value, and an import that mixes values and types counts as a value import in the walk. The installed dependencies, the parsers among them, are keyed by the tool's `package-lock.json`, as before. Until a later edit of 2026-11-19 the version-control seam (`git.ts`) and the command's code that starts the summarizing process were not keyed, and [the independent review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-historys-data-handed-back-measured-and-sent-to-an-independent-review) found that they decide which files and which environment a summary sees. Both are now keyed (`SUMMARY_MODULES` gained `git.ts` and `regenerate.ts`), the guard walks the imports of both sides (`SUMMARY_ENTRIES`), JSON and `import x = require()` included, refuses an import it cannot follow, and keys every module of the history folders that starts a process or implements the version control: what runs in the command on a summary's behalf is known by those two acts. Every file of the history folders that is not a TypeScript module is keyed, and so is the runtime's version of Unicode (`process.versions.unicode`), which the anchors and the engine's order depend on through the case of letters. What the key cannot see is written in [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-history-carries-each-commits-rows-and-words-recorded-2026-11-19).
- This tool checkout's root `package-lock.json` also belongs to the lens: its committed Git entry joins the code hash, and the working file's actual blob is compared with that entry whether Git tracks or ignores it. A differing blob joins the modified hash; an absent lock has a stable marker. The scanned project's lock never enters the generator identity; an installed copy without this tool checkout retains the existing version-only identity rather than borrowing its host's lock. This corrects the cache-identity gap found in the [October 19 generation-cost investigation](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-19/Probes/generation-cost/README.md#the-cache-boundary-to-investigate).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HISTORY_FOLDERS` {#symbol-history_folders}
- Type: const
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L51)

##### `HISTORY_FOLDERS` — Summary
The folders of the history's own modules, most of which read summaries and never make one.

#### `SUMMARY_MODULES` {#symbol-summary_modules}
- Type: const
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L58)

##### `SUMMARY_MODULES` — Summary
The modules of {@link HISTORY_FOLDERS} that decide what a summary says: those the summarizing process runs, and those
the history command runs on its behalf, which write the commit's tree it reads and start it with its task and its
environment.

#### `SUMMARY_ENTRIES` {#symbol-summary_entries}
- Type: const
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L67)

##### `SUMMARY_ENTRIES` — Summary
The modules from which the guard reads what decides a summary: the summarizing process, and the command's side of it.

#### `keysTheLens` {#symbol-keysthelens}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L73)

##### `keysTheLens` — Summary
Whether a file of the two packages, by its repository-relative path, keys the lens: every file but a test and the
TypeScript modules of the history folders that decide nothing of a summary.

#### `generatorIdentity` {#symbol-generatoridentity}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L92)

##### `generatorIdentity` — Summary
The generator's package version and, when it runs from a checkout of this
repository, a hash of the code that makes a summary and of the tool
dependency lock as committed (each keyed file's blob id at the commit, and
the lock's entry), the commit it runs from, and a hash of uncommitted
changes to those inputs. The lock's working bytes are compared to its
committed blob even when Git ignores it. An absent lock has its own stable
identity; a scanned project's lock is never read.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- `node:fs` - `promises`
- `node:path` - `path`
- [`gitUtils.execFileAsync`](../../../engine/src/live-docs/gitUtils.ts.mdmd.md#symbol-execfileasync)
- [`format.GeneratorIdentity`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-generatoridentity) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
