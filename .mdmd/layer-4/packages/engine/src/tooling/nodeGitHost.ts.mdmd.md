# `packages/engine/src/tooling/nodeGitHost.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/nodeGitHost.ts`
- Generated At: 2026-11-24T07:54:04.565Z

## Authored
### Purpose
Implements the optional `GitHost` port (`workspaceFiles.ts`) for Node hosts by delegating ignore listings, repository checks, `core.ignorecase`, and `--changed` status to `gitIgnored.ts` and `gitUtils.ts`.

### Notes
- Written on 2026-11-24 for Step 8 of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road).
- Imported only by Node facades (`discovery.ts` and `generator.ts`), keeping `node:child_process`, `node:process`, `lstatSync`, and callback `readdir` completely out of the browser scan bundle.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NODE_GIT_HOST` {#symbol-node_git_host}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/nodeGitHost.ts#L18)
- Returns: [`GitHost`](./workspaceFiles.ts.mdmd.md#symbol-githost)

##### `NODE_GIT_HOST` — Summary
Node's {@link GitHost}: runs git subprocesses against a workspace on disk.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`gitUtils.detectChangedFiles`](../live-docs/gitUtils.ts.mdmd.md#symbol-detectchangedfiles)
- [`gitIgnored`](./gitIgnored.ts.mdmd.md#symbol-gitignored)
- [`gitIgnored.gitIgnores`](./gitIgnored.ts.mdmd.md#symbol-gitignores-function)
- [`gitIgnored.gitIgnoresCase`](./gitIgnored.ts.mdmd.md#symbol-gitignorescase)
- [`gitIgnored.liesInNoRepository`](./gitIgnored.ts.mdmd.md#symbol-liesinnorepository)
- [`workspaceFiles.GitHost`](./workspaceFiles.ts.mdmd.md#symbol-githost) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
