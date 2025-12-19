# Checklist: Live Documentation Falsifiability Guarantees

**Purpose**: Ensure Live Documentation requirements (REQ-F1–REQ-F6) are covered by deterministic lint, regeneration, and provenance checks before implementation proceeds.
**Created**: 2025-11-08
**Last Reviewed**: 2025-12-19

## Structural Integrity (REQ-F1)
- [x] Do instructions and generator templates guarantee `## Metadata`, `## Authored`, and `## Generated` sections exist with HTML markers? (Refs: `.github/instructions/mdmd.layer4*.instructions.md`, FR-LD1) *(Enforced: `npm run live-docs:lint` validates 585 files)*
- [x] Does the lint plan block merges when markers are edited manually or headings are missing? (Refs: `scripts/live-docs/lint.ts`, LD-302) *(Enforced: safe-commit runs live-docs:lint)*
- [x] Are waivers for empty sections captured via HTML comments (`<!-- evidence-waived -->`, etc.) and echoed in authored `### Notes`? *(Template support exists; policy documented in `evidence-waivers.md`)*

## Deterministic Generation (REQ-F2)
- [x] Does the generator write `Public Symbols` and `Dependencies` deterministically across repeated runs (same hash unless analyzer output changes)? (Refs: LD-200–LD-205, `reports/benchmarks/live-docs`) *(Verified: `npm run live-docs:generate --dry-run` shows no diff when source unchanged)*
- [x] Are provenance fields (`generatedAt`, analyzer tool/version, benchmark hash) recorded for each regeneration cycle? (Refs: `packages/shared/src/live-docs/schema.ts`, LD-203) *(Implemented in generator output)*
- [x] Do benchmarks confirm ≥0.9 export precision and ≥0.8 dependency recall for supported languages after regeneration? (Refs: `reports/benchmarks/ast`, LD-305) *(Tracked in `reports/test-report.ast.md`)*

## Evidence & Coverage (REQ-F3)
- [x] Will implementation Live Docs emit `Observed Evidence` whenever linked tests/benchmarks or waivers exist, defaulting to `_No automated evidence found_` with waivers when automated coverage is unavailable? (Refs: LD-300–LD-304) *(Template enforced; automated ingestion pending)*
- [x] Do test Live Docs populate `Targets`/`Supporting Fixtures`, and does lint escalate when they remain empty? (Refs: `.github/instructions/mdmd.layer4.test.instructions.md`) *(Instruction-enforced; lint checks authored section presence)*
- [ ] Are coverage ingestion paths (Vitest, pytest, dotnet) captured with reproducible fixtures and telemetry? (Refs: LD-300, WI-LD102) *(Pending: automated coverage feeds not yet wired)*

## Diagnostics & Exports (REQ-F4)
- [ ] When diagnostics fire, do they reference the Live Doc path, generated timestamp, and evidence summary? (Refs: LD-400–LD-401) *(Pending: diagnostics still use legacy graph)*
- [x] Does the CLI (`scripts/live-docs/inspect.ts`) output the same data as the UI, validated by snapshot tests? (Refs: LD-402, LD-403) *(Committed 2025-12-18: Local Map From/To uses same pathfinding as CLI)*
- [ ] Are drift regressions caught by integration suites comparing CLI/diagnostic output before and after regeneration? (Refs: `tests/integration/live-docs/generation.test.ts`) *(Pending: integration suite skeleton exists but coverage incomplete)*

## Markdown Hygiene (REQ-F5)
- [x] Are staged Live Docs included in SlopCop markdown/asset/symbol audits with relative-link enforcement and configurable slug dialect? (Refs: `slopcop.config.json`, LD-302–LD-303) *(Enforced: SlopCop runs in safe-commit)*
- [x] Do lint gates fail when markdown links point to missing assets or anchors? (Refs: `npm run slopcop:markdown`, `npm run slopcop:assets`) *(Enforced: safe-commit fails on broken links)*
- [x] Are asset references tracked either through Live Docs or direct markdown links with validation coverage? (Refs: `.github/instructions/mdmd.layer4.implementation.instructions.md`) *(SlopCop asset audit covers this)*

## Docstring Drift (REQ-F6)
- [ ] Is docstring bridge metadata emitted during regeneration and normalised by the schema? (Refs: `packages/shared/src/live-docs/schema.ts`, LD-500) *(Wishlist: docs→code write-back deferred)*
- [ ] Do diagnostics/CLI commands surface drift and provide remediation (sync or waive) with integration coverage? (Refs: LD-501–LD-503) *(Wishlist: drift diagnostics deferred)*
- [ ] Are safe-commit gates configured to fail when unresolved drift exceeds zero without waivers? (Refs: LD-503–LD-504) *(Wishlist: drift gating deferred)*

## Evidence & Traceability
- [x] Safe-to-commit transcript captures lint/regeneration failures and provenance deltas for audit. *(Enforced: safe-commit output logged)*
- [x] Benchmark reports (`reports/benchmarks/live-docs/*.json`) retain analyzer accuracy snapshots post-regeneration. *(Reports exist under `reports/benchmarks/`)*
- [ ] Integration suites under `tests/integration/live-docs/` cover happy path and failure injections for all REQ-F requirements. *(Partial: some suites exist, coverage incomplete)*
