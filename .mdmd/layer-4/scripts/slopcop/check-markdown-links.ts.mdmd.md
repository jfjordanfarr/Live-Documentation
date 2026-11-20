# `scripts/slopcop/check-markdown-links.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/slopcop/check-markdown-links.ts`
- Entry: command `slopcop:markdown` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-20T06:46:52.291Z

## Authored
### Purpose
Scans markdown and MDMD files for broken relative links so Live Docs, specs, and maintainer guides never ship dangling references.

### Notes
- Built during the October 2025 SlopCop hardening to replace ad-hoc link grep checks with a deterministic CLI consumed by `npm run slopcop:markdown` and the Stage‑0 migration tasks (`2025-10-31.md`).
- Shares configuration with other SlopCop tools via `slopcop.config.json`, letting us tailor ignored paths (for example the session archive) while keeping CI failure codes consistent (exit 3 when issues exist).
- Backed by `scripts/slopcop/markdownLinks.test.ts`, which stress-tests the parser while the CLI surfaces regressions to `safe-to-commit.mjs` and maintainer tasks.
- Since 2026-11-18 the built-in ignore list leaves out the session archive's records, captures, summaries and inventories by their depth under `AgentSessionHistory/`, and reads each day's `Probes/`, `Research/` and `Screenshots/`: the same files as before the archive moved into one directory per dev day ([where things are](../../../../AI-Agent-Workspace/AgentSessionHistory/README.md#where-things-are)).
- Since 2026-11-20 its files come from [`auditedFiles`](./auditedFiles.ts.mdmd.md), which does not read the folders git ignores whole: in the main checkout the same 1,695 files and findings in 1.8 s instead of 16.9 s ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`auditedFiles`](./auditedFiles.ts.mdmd.md#symbol-auditedfiles)
- [`config.compileIgnorePatterns`](./config.ts.mdmd.md#symbol-compileignorepatterns)
- [`config.loadSlopcopConfig`](./config.ts.mdmd.md#symbol-loadslopcopconfig)
- [`config.resolveIgnoreGlobs`](./config.ts.mdmd.md#symbol-resolveignoreglobs)
- [`config.resolveIncludeGlobs`](./config.ts.mdmd.md#symbol-resolveincludeglobs)
- [`markdownLinks.MarkdownLinkIssue`](./markdownLinks.ts.mdmd.md#symbol-markdownlinkissue)
- [`markdownLinks.findBrokenMarkdownLinks`](./markdownLinks.ts.mdmd.md#symbol-findbrokenmarkdownlinks)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/slopcop.mdmd.md`](../../../layer-3/slopcop.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
