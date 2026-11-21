# `tests/e2e/webgl-refused.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/webgl-refused.spec.ts`
- Generated At: 2026-11-21T03:33:23.190Z

## Authored
### Purpose
The Explorer in a browser that refuses WebGL: a request for the 3D map, by a link, by the remembered choice, or by Back and Forward to an entry that names 3D, shows the same subject in the 2D map and the address says 2D; the 3D control stays on the toolbar, unavailable, with its reason as its description and tooltip; Tuning's 3D Layout group is unavailable in the same way and its stored settings are left alone; no fault panel opens and no error reaches the page; and the remembered choice of 3D is still 3D in storage afterwards. Held on the estate sample, this repository's own map and the history sample.

### Notes
- Made on November 21, 2026, for [the root's probe of that day](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/weak-machine/README.md) (finding 3), which found a link to the 3D map a dead page where WebGL is refused. Against the code before the mend five of its six cases failed, the 2D map never appearing under "The Explorer stopped"; the Back and Forward case was added later and failed against a build with that one path left unmended, on an empty map. The Tuning case was added the same day, when the root extended the rule to Tuning's 3D Layout group.
- This file alone launches Chromium without WebGL, by `test.use({ launchOptions: { args: ["--disable-3d-apis"] } })`, which gives the file a worker of its own and leaves [the configuration](playwright.config.ts.mdmd.md) and every other file as they are. Its launch replaces the suite's launch on the graphics card ([`browser-launch.ts`](browser-launch.ts.mdmd.md)), which a browser that draws no WebGL has no use for. Its first case proves that the browser really gives no WebGL 1 or 2 context, so that the others cannot pass on a browser that draws 3D.
- One case is marked `test.fail`, the known gap: Back or Forward to an entry that differs from the place shown only by naming 3D takes `restoreFromUrl`'s evidence-only return, which leaves the entry's address saying 3D while the map shows 2D. Run unmarked on 2026-11-21 it failed on its last assertion, the address's perspective "3d" where "2d" was expected. A rewrite in that return was tried the same day and backed out at the root's word, after a run of the browser suite failed beside it (a failure the rewrite could not reach, in `explorer-history.spec.ts`, read in the round's handback).
- The entry that names 3D in the Back and Forward case is pushed by hand: the page writes 2D into every entry it makes in such a browser, so an entry naming 3D is one it did not write, which only a hand or an older page leaves.
- The pictures of the mended page in the same browser, the 3D control's native tooltip among them, are [the dated evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Screenshots/webgl-refused/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`local-storage.PERSISTED_NAV_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_nav_key)
- [`local-storage.PERSISTED_NAV_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_nav_version)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`webgl-support.WEBGL_REFUSED`](../../packages/explorer/src/client/views/webgl-support.ts.mdmd.md#symbol-webgl_refused)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
