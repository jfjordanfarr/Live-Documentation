# `tests/integration/live-docs/package-modules.oracle.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/package-modules.oracle.test.ts`
- Generated At: 2026-11-22T04:01:47.401Z

## Authored
### Purpose
Holds the reader of `package.json` to Node's own resolver over real manifests rather than made ones: every package installed under this repository's `node_modules`, nested ones among them. For each, Node is asked to resolve the package's name from the folder that holds it, both by `require.resolve` and by `import.meta.resolve`. The files the reader takes as the package's module entries are set beside Node's. A package either agrees or disagrees by a cause named against Node's documented algorithm, and the count of each is the committed register `expected/package-modules.json`. A count that moves fails the test.

### Notes
- Written on 2026-11-22 at root's ask, after the reader was mended to read `exports` as Node does (`json.exports.test.ts` holds eleven made shapes). Of 281 packages, 229 agreed with the reader as it then was. It read `main` as written, with no `index.js` when a package had no `main`, no completion of a `main` that leaves off its extension or names a folder, and no fall-back when `main` names no file. Following Node's legacy resolution of `main` made 273 agree.
- The disagreements left are registered, each with its reason: two packages named as Node's own modules (`punycode`, `string_decoder`), and six nested copies, for which Node's ESM resolver answered with the top-level copy's file, a question left open.
- Files are compared as files on the disk, as the reader takes the first of Node's candidates that its listing holds; Node's ESM resolver may name a file an export names that is not there.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs` - `fs`
- `node:module` - `createRequire`, `isBuiltin`
- `node:path` - `path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
- [`json.packageModules`](../../../packages/engine/src/live-docs/adapters/json.ts.mdmd.md#symbol-packagemodules)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
