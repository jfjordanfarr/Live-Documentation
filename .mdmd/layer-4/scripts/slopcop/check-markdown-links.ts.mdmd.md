# scripts/slopcop/check-markdown-links.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/slopcop/check-markdown-links.ts
- Generated At: 2026-09-28T01:00:43.677Z

## Authored
### Purpose
Scans markdown and MDMD files for broken relative links so Live Docs, specs, and maintainer guides never ship dangling references.

### Notes
- Built during the October 2025 SlopCop hardening to replace ad-hoc link grep checks with a deterministic CLI consumed by `npm run slopcop:markdown` and the Stage‑0 migration tasks (`2025-10-31.md`).
- Shares configuration with other SlopCop tools via `slopcop.config.json`, letting us tailor ignored paths (for example ChatHistory) while keeping CI failure codes consistent (exit 3 when issues exist).
- Backed by `scripts/slopcop/markdownLinks.test.ts`, which stress-tests the parser while the CLI surfaces regressions to `safe-to-commit.mjs` and maintainer tasks.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`config.compileIgnorePatterns`](./config.ts.mdmd.md#symbol-compileignorepatterns)
- [`config.loadSlopcopConfig`](./config.ts.mdmd.md#symbol-loadslopcopconfig)
- [`config.resolveIgnoreGlobs`](./config.ts.mdmd.md#symbol-resolveignoreglobs)
- [`config.resolveIncludeGlobs`](./config.ts.mdmd.md#symbol-resolveincludeglobs)
- [`markdownLinks.MarkdownLinkIssue`](./markdownLinks.ts.mdmd.md#symbol-markdownlinkissue)
- [`markdownLinks.findBrokenMarkdownLinks`](./markdownLinks.ts.mdmd.md#symbol-findbrokenmarkdownlinks)
<!-- LIVE-DOC:END Dependencies -->
