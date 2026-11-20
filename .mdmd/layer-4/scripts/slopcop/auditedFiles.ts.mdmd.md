# `scripts/slopcop/auditedFiles.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/slopcop/auditedFiles.ts`
- Generated At: 2026-11-20T13:06:22.948Z

## Authored
### Purpose
Collects the files each SlopCop audit reads: what its patterns match, less what git ignores, found without reading the folders git ignores whole, so that a checkout full of ignored worktrees, builds and caches is audited as fast as a clean one, and on the same files ([the probe of 2026-11-20](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md)).

### Notes
- Written on 2026-11-20, when the gate took 287 s in the main checkout and 193 s in a clean worktree, the difference all in the walks: each audit globbed every file of the 28 builders' worktrees under `.claude/worktrees/` (which git ignores) and then asked git to drop them. It replaced the three audits' identical copies of that walk; in the main checkout the markdown audit went from 16.9 s to 1.8 s and the symbol audit from 19.0 s to 1.9 s, on the same files with the same findings.
- Git is asked once (`git ls-files --others --ignored --exclude-standard --directory`, through the engine's `gitIgnores`), and glob is given a file system on which the folders it ignores whole read as empty, which leaves the audits' ignore patterns as they are and needs no escaping of names; the same listing then judges the files found, and where it fails the walk is whole and every file found is read. The first version kept three rules for the paths git refused (a submodule, a link to a folder, a name beginning with `:`), and the second asked `git check-ignore` about each path by its name; the third reads the listing alone, which is git's own classification, a submodule's files judged by the submodule's own git ([the third form](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#reading-gits-own-listing-the-third-form)). Each case is held by `auditedFiles.test.ts`, whose oracle is the full walk.
- Its git helpers were first written here, not beside `gitIgnored` in the engine, so that the audits' change moved no key of the history's cache, which hashes the engine's and the generator's code (`generatorIdentity.ts`). They moved to the engine's `tooling/gitIgnored.ts` with discovery's own shortening, the commit after, and this module now only matches the audits' patterns with them.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `auditedFiles` {#symbol-auditedfiles}
- Type: function
- Source: [source](../../../../scripts/slopcop/auditedFiles.ts#L31)

##### `auditedFiles` — Summary
The files the patterns match under `workspaceRoot` and git does not ignore, as absolute paths, sorted; every file
they match when git cannot answer. Each pattern is matched by itself, with `ignoreGlobs` left out of the walk, as the
audits always matched them.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `FSOption`, `globSync`
- `node:path` - `path`
- [`gitIgnored.gitIgnores`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-gitignores-function)
<!-- LIVE-DOC:END Dependencies -->
