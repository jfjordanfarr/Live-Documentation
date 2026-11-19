# scripts/e2e-bundles.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/e2e-bundles.mjs
- Entry: command `e2e:bundles` of [`package.json`](../package.json.mdmd.md)
- Entry: command `test:e2e` of [`package.json`](../package.json.mdmd.md)
- Generated At: 2026-11-19T07:03:51.222Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SITE` {#symbol-site}
- Type: const
- Source: [source](../../../scripts/e2e-bundles.mjs#L17)

##### `SITE` — Summary
Where the suite's site is built, the folder its server serves.

#### `SUITE_BUNDLES` {#symbol-suite_bundles}
- Type: const
- Source: [source](../../../scripts/e2e-bundles.mjs#L24)

##### `SUITE_BUNDLES` — Summary
The npm scripts that build the suite's bundles, in order, each with the folders it writes under the site; a folder
ending in `/*` stands for each bundle one level beneath it. The scripts' own command lines name the same folders, and
the unit test of this file holds the two together.

#### `staleBundles` {#symbol-stalebundles}
- Type: function
- Source: [source](../../../scripts/e2e-bundles.mjs#L80)

##### `staleBundles` — Summary
Why the suite's bundles are not fit to test, one plain sentence each; an empty list when they are. The Explorer's
own script must be newer than every source of the client, and every sample's copy of it the same bytes.

#### `refusal` {#symbol-refusal}
- Type: function
- Source: [source](../../../scripts/e2e-bundles.mjs#L113)

##### `refusal` — Summary
The refusal for a list of faults, naming each and the command that rebuilds the bundles; undefined for none.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
- [`steps.runNpmScript`](./steps.mjs.mdmd.md#symbol-runnpmscript)
<!-- LIVE-DOC:END Dependencies -->
