# tests/integration/live-docs/scripted-repository.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/scripted-repository.ts
- Generated At: 2026-10-18T05:36:08.764Z

## Authored
### Purpose
A small git repository built from a script of seven commits, the subject of the history command's integration test and of the Explorer's history sample: files added, a directory renamed whole, a file renamed above the similarity threshold and one rewritten below it, a file deleted, a symbol added, a content change that moves no symbol; its git isolated, its authors and dates fixed.

### Notes
- Extracted 2026-10-18 from `history.test.ts`, where it was written with C1 of [the change-over-time plan](../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), so that `scripts/live-docs/visualize-history-sample.ts` can build the same repository into a bundle for the Playwright specs of C4. The test and the sample share one script, so what the specs scrub is what the oracles hold.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SCRIPTED_CONFIG` {#symbol-scripted_config}
- Type: const
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L21)

##### `SCRIPTED_CONFIG` — Summary
The configuration the fixture commits, and the lens its history is read under.

#### `FIXTURE_GIT_ENV` {#symbol-fixture_git_env}
- Type: const
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L24)

##### `FIXTURE_GIT_ENV` — Summary
The fixture's git is isolated from the person's configuration, and its authors and dates are fixed.

#### `MODEL` {#symbol-model}
- Type: const
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L91)

##### `MODEL` — Summary
The model, with the factor its size grows by: the same symbols whatever the factor, so a change of it moves nothing in the shape.

#### `ScriptedCommit` {#symbol-scriptedcommit}
- Type: interface
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L125)

##### `ScriptedCommit` — Summary
One commit of the script: its message, its date, and what it does to the tree.

#### `SCRIPT` {#symbol-script}
- Type: const
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L134)
- Returns: [`ScriptedCommit`](#symbol-scriptedcommit)[]

##### `SCRIPT` — Summary
The seven commits, oldest first.

#### `git` {#symbol-git}
- Type: function
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L252)

##### `git` — Summary
Runs git in the fixture, isolated from the person's configuration.

#### `buildRepository` {#symbol-buildrepository}
- Type: function
- Source: [source](../../../../../tests/integration/live-docs/scripted-repository.ts#L257)
- Parameters: `script`: [`ScriptedCommit`](#symbol-scriptedcommit)[]

##### `buildRepository` — Summary
Builds the repository commit by commit at `root` and returns the commits' ids, oldest first.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs`
- `node:os`
- `node:path`
- [`document.renderLiveDoc`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
<!-- LIVE-DOC:END Dependencies -->
