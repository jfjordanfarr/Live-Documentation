# What the stopped "what survives" explorer had measured

_What the "what survives" explorer of [the brief](../brief.md) had measured on 2026-09-29, from the preamble it gave its readers, found in the session's scratch folder after the model's usage limit stopped the explorer before it wrote its report. Kept as they were left, their headings moved one level down. They are notes, not findings: line numbers are those of the transcript named beside them, the quotations are unverified, and a line marked CHECK, VERIFY or GET FULL was still open when the explorer stopped. They decide nothing._

### The measurement so far

The last commit before the return is `ae216cb5` (2026-04-02). Since then 63 commits (2026-09-26 to 2026-09-29).
At `ae216cb5` there were 1633 tracked files; today 1580. Against that commit, with rename detection and line endings ignored:
620 files deleted, 567 added, 550 renamed, 158 modified, 305 byte-identical (222 of them chat transcripts).

A table of every tracked file outside the chat record is at
`/tmp/claude-1000/-workspaces-Live-Documentation/938ec442-01ad-44ad-bd62-ac7e87a8139d/scratchpad/survey2.tsv`
Columns, tab-separated: status (SAME, MOD, REN = renamed or moved, NEW = arrived since 2026-09-26), path today, path at ae216cb5,
lines added since, lines deleted since, lines in the file today, the commit that first added it (date, hash, subject; followed
through renames), the last commit that touched it.

What it shows, by area (files surviving / lines today / lines added to them since the return):

- `packages/explorer/src/client/` 91 files, 29,458 lines, 322 lines added since. The Explorer client is almost wholly Copilot-era code,
  moved from `packages/scripts/...` but hardly edited. Nine new files (the World Map) add 3,297 lines.
  Arrival: shell and detail panel 2025-11-22; Local Map 2025-12-03 to 12-19; pathfind 2025-12-17; Circuit Board rewrite 2026-03-18;
  Membrane Map 2026-03-24 to 03-31; force graph view file 2026-02-20.
- `packages/engine/src/live-docs/` 44 surviving files, 14,110 lines, 526 added since; 36 new files, 10,248 lines (tree-sitter adapters,
  grammar, graph index, openings, boards). Survivors include the hand-written C, Ruby, PowerShell, ASP.NET, HTML, CSS, JSON adapters,
  the docstring bridges (`python.docstring.ts` 921 lines, `csharp.xmldoc.ts` 510), `heuristics/dom.ts`, `archetype.ts`, `symbolExtraction.ts`,
  `dependencies.ts`, `discovery.ts`, `jsDoc.ts`, `gitUtils.ts`.
- `packages/engine/src/languages/` 12 files, 1,285 lines, from 2026-01-29 ("LanguageSyntax interface"), untouched.
- `scripts/slopcop/`, `scripts/doc-tools/` from October and November 2025, near untouched. `scripts/live-docs/*.ts` heavily cut
  (lint.ts lost 242 lines, generate.ts 126, run-all.ts 171), `scripts/safe-to-commit.mjs` lost 186, `scripts/verify.mjs` 158.
- `tests/e2e/` 13 Membrane Map Playwright specs from 2026-03-30/31, lightly edited.
- `tests/integration/fixtures/` 61 files byte-identical (blazor-telemetry, csharp-advanced-symbols, csharp-reflection,
  powershell-compendium, queue-worker, razor-appsettings, slopcop-assets, slopcop-symbols, spa-runtime-config, webforms-appsettings).
- `tests/integration/programs/` 164 files moved, none edited (the sample programs and the Rosetta programs in eight languages, from
  2025-11-01 and 2026-01-14/16); 114 new (the estate, oracle expectations).
- `AI-Agent-Workspace/Notes/` 10 files, 5,003 lines, 506 KB, byte-identical: the Copilot era's own censuses and design notes.
- `README.md` 210 of 215 lines predate the return. `SECURITY.md` about half. `.mdmd/layer-1/guides/` four guides, about two thirds old.
  `.mdmd/layer-3/membrane-map.mdmd.md` 207 of 242 lines old; `slopcop.mdmd.md` all old; `live-documentation-explorer.mdmd.md` half old.
- `.mdmd/layer-4/` 301 generated docs existed before (their authored Purpose and Notes sections were written in the Copilot era); 292 are new.
- Configuration: `.devcontainer/`, `.github/workflows/` (ci, codeql, npm-audit, pages), `dependabot.yml`, `eslint.config.js`, `.prettierrc`,
  `slopcop.config.json`, `symbol-coverage.ignore.json`, `.vscode/settings.json`, `packages/cli/` (from 2025-12-15, "pre-publish prep").
