# tests/integration/live-docs/scripted-repository.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/scripted-repository.ts
- Generated At: 2026-10-20T21:29:00.180Z

## Authored
### Purpose
A small git repository built from a script of seven commits, the subject of the history command's integration test and of the Explorer's history sample: files added, a directory renamed whole, a file renamed above the similarity threshold and one rewritten below it, a file deleted, a symbol added, a content change that moves no symbol; its git isolated, its authors and dates fixed.

### Notes
- Extracted 2026-10-18 from `history.test.ts`, where it was written with C1 of [the change-over-time plan](../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), so that `scripts/live-docs/visualize-history-sample.ts` can build the same repository into a bundle for the Playwright specs of C4. The test and the sample share one script, so what the specs scrub is what the oracles hold.
- `COLLISION_SCRIPT` (2026-10-18) is a second script of four commits, a helper moved onto the path of a file that died the commit before, built as a third sample bundle for the scrubber spec after the owner found lines leading nowhere in the played history ([Turn 8](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-8)).
- Since 2026-10-20 ([Turn 9](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) the mirror the script commits links documents in its authored words: the main file's doc links the design and a plan written only at the fourth commit, the legacy helper's links its old notes and is retired with them, the main file's doc drops the design at the fifth, and the orphan's doc links the design too, a link that must never count.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SCRIPTED_CONFIG` {#symbol-scripted_config}
- Type: const
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L25)

##### `SCRIPTED_CONFIG` — Summary
The configuration the fixture commits, and the lens its history is read under.

#### `COLLISION_CONFIG` {#symbol-collision_config}
- Type: const
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L28)

##### `COLLISION_CONFIG` — Summary
The lens of the second script, whose user file is its entry.

#### `FIXTURE_GIT_ENV` {#symbol-fixture_git_env}
- Type: const
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L31)

##### `FIXTURE_GIT_ENV` — Summary
The fixture's git is isolated from the person's configuration, and its authors and dates are fixed.

#### `MODEL` {#symbol-model}
- Type: const
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L114)

##### `MODEL` — Summary
The model, with the factor its size grows by: the same symbols whatever the factor, so a change of it moves nothing in the shape.

#### `ScriptedCommit` {#symbol-scriptedcommit}
- Type: interface
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L148)

##### `ScriptedCommit` — Summary
One commit of the script: its message, its date, and what it does to the tree.

#### `SCRIPT` {#symbol-script}
- Type: const
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L157)
- Returns: [`ScriptedCommit`](#symbol-scriptedcommit)[]

##### `SCRIPT` — Summary
The seven commits, oldest first.

#### `git` {#symbol-git}
- Type: function
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L284)

##### `git` — Summary
Runs git in the fixture, isolated from the person's configuration.

#### `COLLISION_SCRIPT` {#symbol-collision_script}
- Type: const
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L296)
- Returns: [`ScriptedCommit`](#symbol-scriptedcommit)[]

##### `COLLISION_SCRIPT` — Summary
A second script, of four commits: a helper, its user, a file soon to die and a user of that file; the file dies;
the helper is moved onto the dead file's path, a rename git sees whole, which the second user's unchanged import
then finds; and the first user is touched while the second drops its import. Made 2026-10-18 for the Explorer's
history, whose caches had kept the dead file's object and let the renamed helper collide with it, so that the
lines resolved to the dropped object led nowhere after a play through this repository's history.

#### `buildRepository` {#symbol-buildrepository}
- Type: function
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L327)
- Parameters: `script`: [`ScriptedCommit`](#symbol-scriptedcommit)[]
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs`
- `node:os`
- `node:path`
- [`document.renderLiveDoc`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
<!-- LIVE-DOC:END Dependencies -->
