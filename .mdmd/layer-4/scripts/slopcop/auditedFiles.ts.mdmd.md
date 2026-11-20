# `scripts/slopcop/auditedFiles.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/slopcop/auditedFiles.ts`
- Generated At: 2026-11-20T11:09:13.936Z

## Authored
### Purpose
Collects the files each SlopCop audit reads: what its patterns match, less what git ignores, found without reading the folders git ignores whole, so that a checkout full of ignored worktrees, builds and caches is audited as fast as a clean one, and on the same files ([the probe of 2026-11-20](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md)).

### Notes
- Written on 2026-11-20, when the gate took 287 s in the main checkout and 193 s in a clean worktree, the difference all in the walks: each audit globbed every file of the 28 builders' worktrees under `.claude/worktrees/` (which git ignores) and then asked git to drop them. It replaced the three audits' identical copies of that walk; in the main checkout the markdown audit went from 16.9 s to 1.8 s and the symbol audit from 19.0 s to 1.9 s, on the same files with the same findings.
- Git is asked once (`git ls-files --others --ignored --exclude-standard --directory`) for the folders that are untracked and ignored as a whole, and glob is given a file system on which they read as empty, which leaves the audits' ignore patterns as they are and needs no escaping of names. The first version kept three rules for the paths git refused (a submodule, a link to a folder, a name beginning with `:`); since git came to be asked about each path by its name, the same day, it refuses none of them and the rules are gone ([the review's findings, mended](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#judging-every-path-by-its-name-the-reviews-findings-mended)). Each case is held by `auditedFiles.test.ts`, whose oracle is the full walk.
- Its git helpers were first written here, not beside `gitIgnored` in the engine, so that the audits' change moved no key of the history's cache, which hashes the engine's and the generator's code (`generatorIdentity.ts`). They moved to the engine's `tooling/gitIgnored.ts` with discovery's own shortening, the commit after, and this module now only matches the audits' patterns with them.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `auditedFiles` {#symbol-auditedfiles}
- Type: function
- Source: [source](../../../../scripts/slopcop/auditedFiles.ts#L33)

##### `auditedFiles` — Summary
The files the patterns match under `workspaceRoot` and git does not ignore, as absolute paths, sorted; every file
they match when git cannot answer. Each pattern is matched by itself, with `ignoreGlobs` left out of the walk, as the
audits always matched them.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:path` - `path`
- [`gitIgnored.foldersGitIgnoresWhole`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-foldersgitignoreswhole)
- [`gitIgnored.foldersReadAsEmpty`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-foldersreadasempty)
- [`gitIgnored.withoutGitIgnored`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-withoutgitignored)
<!-- LIVE-DOC:END Dependencies -->
