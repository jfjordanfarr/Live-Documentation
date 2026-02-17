# Checklist: Live Documentation Generator & Graph Requirements

**Purpose**: Self-check for authors to validate requirements covering Live Doc regeneration, analyzer provenance, evidence mapping, and markdown-as-AST graph consumption.
**Created**: 2025-10-16 (pivoted 2025-11-08)

## Requirement Completeness

- [x] CHK-LD01 Are analyzer inputs for `Public Symbols`, `Dependencies`, and archetype metadata explicitly enumerated per language/archetype? [Spec §FR-LD2; Research §Analyzer Coverage]
- [x] CHK-LD02 Is the full regeneration lifecycle described end-to-end (staging, lint, migration, rollback)? [Spec §Live Doc Generation Lifecycle; Plan §Adoption Strategy]
- [x] CHK-LD03 Do requirements describe how waivers, placeholders, and evidence enforcement interact with lint/safe-commit gates? [Spec §User Story 4; Plan §Phase 3; Tasks §LD-302–LD-304]

## Requirement Clarity

- [x] CHK-LD04 Are HTML markers, section ordering, and authored/generated boundaries explicitly defined? [Spec §Functional Requirements; Instructions `mdmd.layer4.*`]
- [x] CHK-LD05 Is configuration (`liveDocumentation.root`, `baseLayer`, slug dialect, glob overrides) documented for both CLI and VS Code settings? [Spec §FR-LD10; Plan §Phase 0; Quickstart §Configure Live Documentation]
- [x] CHK-LD06 Are CLI/AI-assistant parity expectations named with concrete command references? [Spec §FR-LD5; Quickstart §Maintenance Cheat-Sheet; Tasks §LD-402–LD-403]

## Requirement Consistency

- [x] CHK-LD07 Do spec, plan, tasks, and quickstart agree on staging under `/.live-documentation/<baseLayer>/` (default `source/`) before migration? [Spec §Lifecycle; Plan §Summary; Tasks §LD-204]
- [x] CHK-LD08 Do all artifacts commit to workspace-relative links and configurable slug dialect enforcement? [Spec §FR-LD11; Quickstart §Configure Live Documentation; Instructions `mdmd.layer4.instructions.md`]
- [x] CHK-LD09 Are evidence expectations mirrored across spec, plan deliverables, and falsifiability criteria? [Spec §User Story 4; Plan §Phase 3; Falsifiability §REQ-F3]

## Acceptance Criteria Quality

- [x] CHK-LD10 Do success metrics quantify regeneration latency, analyzer accuracy, and evidence coverage? [Spec §Success Criteria SC-LD1–SC-LD5]
- [x] CHK-LD11 Does falsifiability enumerate deterministic checks (structure, analyzer parity, docstring drift) tied to CI gates? [Falsifiability §REQ-F1–REQ-F6]

## Scenario Coverage

- [x] CHK-LD12 Are rename/move flows, multi-target tests, and optional asset docs treated in Edge Cases? [Spec §Edge Cases; Tasks §LD-300–LD-304]
- [x] CHK-LD13 Do requirements cover offline/air-gapped regeneration? The system is fully deterministic with no LLM dependencies; users bring their own AI assistants. [Spec §Assumptions; Plan §Constraints] _(Updated 2026-02-17: LLM enrichers descoped.)_
- [x] CHK-LD14 Are migration failure/rollback scenarios documented? [Spec §FR-LD7; Plan §Phase 6]

## Non-Functional Requirements

- [x] CHK-LD15 Are performance targets for regeneration and CLI latency defined and linked to enforcement? [Spec §Success Criteria SC-LD1, SC-LD4; Plan §Performance Goals]

## Dependencies & Assumptions

- [x] CHK-LD16 Are analyzer/benchmark dependencies noted, including requirement to preserve existing polyglot suites? [Spec §Assumptions; Plan §Phase 2; Roadmap §REQ-L2]

## Ambiguities & Conflicts

- [x] CHK-LD17 Are decisions about excluding churn metrics, Live Doc ID determinism, and asset coverage documented with follow-up notes? [Spec §Active Questions; Plan §Phase 7; Roadmap §Active Questions]

## Implementation Traceability

- [`scripts/live-docs/generate.ts`](/scripts/live-docs/generate.ts) orchestrates Live Doc regeneration (LD2, LD3).
- [`scripts/live-docs/lint.ts`](/scripts/live-docs/lint.ts) validates Live Doc structure and link integrity.
- Integration suites under `tests/integration/live-docs/` validate generation determinism, evidence mapping, and docstring drift referenced in falsifiability REQ-F2/REQ-F3/REQ-F6.
