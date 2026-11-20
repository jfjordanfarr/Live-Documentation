# `scripts/e2e-bundles.mjs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/e2e-bundles.mjs`
- Entry: command `e2e:bundles` of [`package.json`](../package.json.mdmd.md)
- Entry: command `test:e2e` of [`package.json`](../package.json.mdmd.md)
- Generated At: 2026-11-19T20:14:17.247Z

## Authored
### Purpose
One name for every bundle the browser suite serves. Run as `npm run e2e:bundles` (and as the first half of `npm run test:e2e`) it builds the Explorer and each sample the suite opens, one npm script after another; run with `--check` it refuses, naming each bundle and the command, when the bundles under `dist/explorer` were not built together from the client as it stands. The suite runs the check at its start ([`served-build.ts`](../tests/e2e/served-build.ts.mdmd.md)).

### Notes
- Written on 2026-11-19, after root's own check rebuilt the Explorer and the estate sample but not the history or Rosetta samples, so that the history's browser cases ran on a page hours old and failed for that alone ([the November 18 record's notes of that night](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-two-more-merges-and-two-faults-in-roots-own-checking), after [Turns 36 and 37](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)). Until then only `test:e2e` knew the whole list, as one long `&&` chain in `package.json`.
- The list names each npm script with the folders it writes. The folders also stand in those scripts' own command lines, so [the unit test](./e2e-bundles.test.ts.mdmd.md) reads `package.json` and holds the two together; Rosetta's folder is named as `samples/rosetta/*`, each language beneath it.
- The check rests on a fact of the build: every bundle carries its own copy of the client's script, built from the same sources by the same step, and esbuild's output for the same sources is the same bytes. So a sample whose `static/index.js` differs from the Explorer's was built at another time, and the check names it with both times. It also refuses an Explorer whose script is older than the newest file of the client's sources (`packages/explorer/src/client`, tests aside, and the builder's `buildAssets.ts` and `template.html`). It does not see a change to the engine or generator that changes a bundle's data and not its script; that is left to whoever changed them.
- The link-targets sample joined the list on 2026-11-19, for the browser case that the reader opens every form of a link whose target holds parentheses ([its spec](../tests/e2e/link-targets.spec.ts.mdmd.md)).
- The check runs as its own Node process from the suite's global setup because Playwright's loader compiles what a configuration imports to CommonJS, which this ES module cannot be.

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
- Source: [source](../../../scripts/e2e-bundles.mjs#L81)

##### `staleBundles` — Summary
Why the suite's bundles are not fit to test, one plain sentence each; an empty list when they are. The Explorer's
own script must be newer than every source of the client, and every sample's copy of it the same bytes.

#### `refusal` {#symbol-refusal}
- Type: function
- Source: [source](../../../scripts/e2e-bundles.mjs#L114)

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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-2/internal-tooling.mdmd.md`](../../layer-2/internal-tooling.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
