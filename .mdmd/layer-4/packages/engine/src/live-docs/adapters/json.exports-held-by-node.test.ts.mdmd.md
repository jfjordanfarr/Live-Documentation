# `packages/engine/src/live-docs/adapters/json.exports-held-by-node.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/json.exports-held-by-node.test.ts`
- Generated At: 2026-11-22T05:38:26.528Z

## Authored
### Purpose
Holds the reader of `package.json` to Node's own resolver on manifest shapes that no package under this repository's `node_modules` holds, so the oracle over the installed packages cannot see them. There are seven shapes:

- `exports: null` beside a `main`, which Node reads as no `exports`;
- a `null`, an empty list or a list of `null` under a condition, where Node stops with "not exported";
- a target that climbs out of the package, or holds a `..` segment, which Node refuses as an invalid target;
- an `exports` that mixes subpaths with conditions, which Node refuses as an invalid configuration.

Each shape is installed as a package as `json.exports.test.ts` installs one. The workspace is the folder that holds `node_modules`, so a file outside the package is still a file of the workspace. The reader must declare exactly the files Node resolves to.

### Notes
- Written on 2026-11-22 by the engine review of that day's work ([its record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/README.md)). All seven cases failed when the review committed this file. The reader read `main` only when `exports` was undefined. It went on to the next condition after a target that resolved to `null`. It accepted any target that begins with `./`, and it read a mixed `exports` as conditions.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:module` - `createRequire`
- `node:os`
- `node:path`
- `node:url` - `fileURLToPath`
- [`json.jsonAdapter`](./json.ts.mdmd.md#symbol-jsonadapter)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
