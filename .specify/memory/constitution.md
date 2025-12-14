<!--
Sync Impact Report
Version: 1.0.0 → 1.0.1
Modified Principles: None (structure cleanup)
Added Sections: None
Removed Sections: Residual template placeholder block
Templates Requiring Updates:
	✅ Existing SpecKit templates already aligned (no changes required)
Follow-up TODOs: None
-->

# Live Documentation Constitution

## Core Principles

### I. Documentation-Implementation Unity
Every feature MUST maintain traceable links between documentation layers, implementation files, and dependent modules. Specs, plans, and diagnostics MUST reference the same artifact identifiers so divergence is immediately visible. Releases without updated documentation are blocked.

### II. Tooling Leverage & Reuse
Teams MUST prefer officially supported VS Code and language-server capabilities before building bespoke analyzers. When external improvements are available (e.g., symbol providers, diagnostics), projects MUST integrate them rather than reimplementing functionality. Exceptions require plan-level justification recorded in research notes.

### III. Responsible Intelligence & Consent
AI-assisted analysis MUST respect user choice, privacy, and cost controls. Features invoking language models MUST surface consent, indicate provider (local or cloud), honor workspace trust, and provide offline-safe alternatives. Storing AI output requires provenance metadata and opt-out paths.

### IV. Fast Feedback & Verification
Solutions MUST deliver rapid, test-backed feedback loops. Diagnostics should surface within seconds of a change, and automated tests (unit, integration, contract) MUST cover new behavior before code merges. Continuous validation scripts MUST be runnable headlessly for CI adoption.

### V. Simplicity & Stewardship
Implementations MUST default to lightweight, local-first components (e.g., embedded SQLite, in-process services) and minimize operational burden. Additional dependencies demand documented benefit vs. complexity trade-offs. Security reviews MUST verify that only necessary file system and network access is granted.

## Additional Constraints

- Primary runtime targets TypeScript 5.x on Node.js 22 for extension and language server workloads.
- Artifact graphs MUST persist in SQLite within workspace or user storage, encrypted or access-controlled when sensitive data is involved.
- Packaging MUST support Windows, macOS, and Linux without requiring external daemons beyond optional local LLM endpoints.
- Configuration MUST expose toggles for noise suppression, LLM usage, and storage location, with safe defaults for new users.

## Development Workflow

- All features flow through Spec → Research → Plan → Tasks as codified by SpecKit commands; skipping phases requires governance approval.
- Constitution compliance MUST be checked during `/speckit.plan` and re-verified post-design. Any violations trigger Complexity Tracking entries.
- Code changes MUST include automated tests and documentation updates in the same commit or linked series before review sign-off.
- Human review MUST confirm documentation unity, tooling leverage, and consent safeguards before merging.

## Governance

- Amendments require consensus from project maintainers recorded in research notes and must state the rationale for version bumps.
- Semantic versioning applies: MAJOR for principle overhauls, MINOR for new principles/sections, PATCH for clarifications.
- Ratified constitutions MUST be referenced in planning artifacts; discrepancies require immediate rectification.
- Compliance reviews occur at least once per feature cycle; unresolved violations block release until documented mitigations are in place.

**Version**: 1.0.1 | **Ratified**: 2025-10-16 | **Last Amended**: 2025-10-17
