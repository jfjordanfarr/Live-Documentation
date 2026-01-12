# SlopCop Workspace Linting

## Metadata
- Layer: 3
- Component IDs: COMP-004

## Components

### COMP-004 SlopCop Tooling
Supports REQ-020, REQ-030, REQ-F4, and REQ-F5 by delivering repository-wide linting that blocks hallucinated documentation, stale assets, and missing symbol links before they merge.

## Responsibilities

### Markdown and MDMD Integrity
- Ensure every markdown/MDMD link resolves by running `slopcop:markdown` with configurable slug dialects (GitHub, Azure DevOps) so Live Docs remain wiki-portable.
- Enforce relative-link requirements for Live Documentation mirrors, emitting actionable diagnostics (line/column, relationship context) and JSON output for automation consumers.

### Asset Reference Integrity
- Validate HTML and CSS asset references (`src`, `href`, `url()`) against configured root directories, respecting ignore patterns for hashed filenames and fixtures.
- Require implementation/test Live Docs to reference assets via relative markdown links; fail `npm run safe:commit` when referenced assets drift.

### Symbol Integrity Progression
- Stage S0: audit markdown headings for duplicates and missing anchors across MDMD and Live Doc mirrors.
- Planned stages: correlate Layer 4 exports against knowledge graph symbols (S1), harvest language-level symbols without bespoke compilers (S2), and surface Problems view diagnostics plus auto-repair hints (S3).
- Upcoming Live Doc passes will verify generated sections (`Public Symbols`, `Dependencies`, `Observed Evidence`) were produced by approved generators and match provenance hashes.

### CLI Ergonomics and Adoption
- Maintain deterministic exit codes, Windows-friendly flag forwarding, and `--json` support across SlopCop commands.
- Integrate all passes into `npm run safe:commit` so lint compliance is mandatory before merge.

## Interfaces

### Inbound Interfaces
- Shared configuration via `slopcop.config.json` (include/ignore globs, asset roots, ignore targets).
- Workspace invocation through npm scripts (`slopcop:markdown`, `slopcop:assets`, `slopcop:symbols`).
- Live Documentation settings (`liveDocumentation.requireRelativeLinks`, slug dialect) forwarded to lint passes to ensure staging mirrors obey workspace policy.

### Outbound Interfaces
- Diagnostics surfaced to CLI stdout/JSON for humans and automation.
- Safe-to-commit pipeline integration ensuring lint failures halt commits.
- Future Problems view publishing once Symbol Correctness integrates SlopCop findings.
- Live Doc generator gating that blocks promotion when lint detects stale markers, absolute links, or asset drift.

## Linked Implementations

### IMP-201 slopcopMarkdownLinks CLI
CLI entry that enforces markdown/MDMD link integrity. [SlopCop Markdown Audit](../../.mdmd/layer-4/scripts/slopcop/check-markdown-links.ts.mdmd.md)

### IMP-202 slopcopAssetPaths CLI
CLI entry that validates static asset references. [SlopCop Asset Audit](../../.mdmd/layer-4/scripts/slopcop/check-asset-paths.ts.mdmd.md)

### IMP-204 slopcopSymbols CLI
CLI entry for heading and symbol audits. [SlopCop Symbol References](../../.mdmd/layer-4/scripts/slopcop/check-symbols.ts.mdmd.md)

### IMP-301 safeToCommit Orchestrator
Chains SlopCop passes alongside verify and graph tooling. [Safe to Commit Pipeline](../../scripts/safe-to-commit.mjs)

### IMP-302 liveDocsLint CLI
Audits Live Doc coverage and link integrity. [Live Docs Lint CLI](../layer-4/scripts/live-docs/lint.ts.mdmd.md)

### IMP-303 liveDocsInspect CLI
Provides headless dependency exploration referenced by lint diagnostics. [Live Docs Inspect CLI](../layer-4/scripts/live-docs/inspect.ts.mdmd.md)

## Evidence
- Shared tooling unit tests (`markdownLinks.test.ts`, `assetPaths.test.ts`, `symbolReferences.test.ts`) validate parsing and diagnostics.
- CLI regression tests (`slopcopAssetCli.test.ts`, `slopcopSymbolsCli.test.ts`) and integration fixtures under `tests/integration/fixtures/slopcop-*` demonstrate fail/fix cycles.
- Safe-to-commit logs for 2025-10-29 show SlopCop gating commits before symbol lint passed.
- Planned Live Doc lint suites (`tests/integration/live-docs/evidence.test.ts`) will assert that missing markers, absolute links, or blank evidence sections trip SlopCop checks.

## Operational Notes
- Lint logic lives in shared utilities so CLIs and future extension diagnostics reuse the same engine.
- Upcoming Symbol Correctness work will treat SlopCop symbol findings as guardrails for Layer 4 documentation, eventually feeding auto-repair suggestions.
