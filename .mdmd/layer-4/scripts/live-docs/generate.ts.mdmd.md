# scripts/live-docs/generate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/generate.ts
- Entry: command `live-docs:generate` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-10-22T16:47:57.532Z

## Authored
### Purpose
CLI entry point that applies workspace configuration, resolves include/changed filters, and invokes the server-side Live Doc generator so developers can regenerate Layer‑4 mirrors on demand or during automation.

### Notes
- The script wraps `generateLiveDocs` from the generator package, wiring in the JSON config file and the `--changed`, `--include` and `--dry-run` filters.
- `--check` uses the generator's dry run and fails when a doc would be created, updated or deleted, without writing docs or the derived graph index. It is the CI mirror-freshness gate added after the [October 19 audit](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-16). `--dry-run` keeps its preview-only success behavior.
- Since 2026-10-17 the configuration is the file `--config` names, else the workspace's own `.live-docs.config.json`, as inspect reads it, else the shipped defaults. Until then `--workspace` without `--config` read no configuration and wrote the shipped default root, which the history probe of 2026-10-16 found while regenerating past commits; the history command ([the plan's C1](../../../../.mdmd/layer-3/change-over-time.mdmd.md)) applies its lens's configuration explicitly in any case.
- `--version` prints the generator package's version from its manifest since 2026-10-18, through [cli.ts](cli.ts.mdmd.md); until then it printed a constant, 0.1.0, or an environment variable, while the package is 0.0.0, which the history command's lens showed up, since the lens carries the manifest's version.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`LiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`cli.packageVersion`](./cli.ts.mdmd.md#symbol-packageversion)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
