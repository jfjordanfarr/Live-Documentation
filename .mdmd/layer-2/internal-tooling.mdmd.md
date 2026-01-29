# Internal Tooling Reference

## Metadata
- Layer: 2
- Audience: Contributors

This document catalogs CLI commands and workflows used for **developing** Live Documentation — not for using it. These tools are not exposed to external adopters and should not be documented in Layer 1 guides.

---

## When to Use This Reference

| Situation | Relevant Section |
|-----------|------------------|
| Preparing a commit | [Pre-Commit Pipeline](#precommit-pipeline) |
| Debugging graph issues | [Graph Tooling](#graph-tooling-deprecated--removed-20260112) |
| Validating markdown quality | [SlopCop Audits](#slopcop-audits) |
| Running benchmarks | [Testing & Benchmarks](#testing--benchmarks) |
| Managing test fixtures | [Fixture Management](#fixture-management) |

---

## Pre-Commit Pipeline

### `npm run safe:commit`

The definitive readiness gate before commits. Chains:

1. ESLint + Prettier checks
2. Unit tests (Vitest)
3. Integration tests
4. Graph snapshot + audit
5. SlopCop markdown/asset validation
6. Live Docs generation + lint

```powershell
# Standard check
npm run safe:commit

# Include benchmark suites (slower)
npm run safe:commit -- --benchmarks

# Skip git status enforcement (for CI)
npm run safe:commit -- --skip-git-status
```

### `npm run ci-check`

CI-friendly variant that skips git status enforcement by default.

### `npm run verify`

Aggregates lint + unit + integration without full SlopCop or graph auditing. Faster for mid-development validation.

---

## Graph Tooling *(Deprecated — Removed 2026-01-12)*

> **Note**: The `graph:*` commands were removed during the Edge Aggregation Consolidation (Phase 6). Their functionality has been replaced by `live-docs:*` commands that operate directly on the Live Doc markdown graph. See [edge-aggregation-consolidation.mdmd.md](work-items/edge-aggregation-consolidation.mdmd.md) for migration details.
>
> - `graph:snapshot` → replaced by `live-docs:generate`
> - `graph:audit` → replaced by `live-docs:lint`
> - `graph:inspect` → replaced by `live-docs:inspect`

The legacy SQLite/JSON snapshot infrastructure (`GraphStore`, `RippleAnalyzer`, `scripts/graph-tools/`) was deleted to reduce maintenance burden. Live Docs now serve as the canonical graph database.

~~### `npm run graph:snapshot`~~ *(removed)*

~~Rebuilds the workspace graph (SQLite database + JSON fixture).~~

~~### `npm run graph:audit`~~ *(removed)*

~~Flags files missing Live Docs, orphan documents, and symbol coverage gaps.~~

~~### `npm run graph:inspect`~~ *(removed)*

~~Low-level querying of the graph database.~~

---

## Live Doc Replacements

| Removed Command | Replacement | Notes |
|-----------------|-------------|-------|
| `graph:snapshot` | `live-docs:generate` | Live Docs are now the graph |
| `graph:audit` | `live-docs:lint` | Validates Live Doc structure and coverage |
| `graph:inspect` | `live-docs:inspect` | Queries the Live Doc graph with `--from`/`--to` pathfinding |

---

## SlopCop Audits

SlopCop is our internal markdown quality enforcement suite. Named after "sloppy copy" — it catches LLM-generated documentation drift.

### `npm run slopcop:markdown`

Validates all markdown links against the configured slug dialect (GitHub, Azure DevOps, GitLab).

```powershell
npm run slopcop:markdown -- --json
```

**What it checks:**
- Broken relative links
- Incorrect heading anchor slugs
- Absolute paths that should be relative

### `npm run slopcop:assets`

Validates asset references (images, CSS, HTML) in markdown files.

```powershell
npm run slopcop:assets -- --json
```

### `npm run slopcop:symbols`

Verifies heading anchors match expected patterns. Opt-in — enable once Live Doc generation stabilizes.

```powershell
npm run slopcop:symbols -- --json
```

---

## Testing & Benchmarks

### Unit Tests

```powershell
npm run test:unit
```

Uses Vitest. Fast, no VS Code host required.

### Integration Tests

```powershell
npm run test:integration
```

Runs VS Code extension integration tests. Requires VS Code installed.

### Contract Tests

```powershell
npm run test:contracts
```

Validates server protocol contracts.

### Benchmark Suites

```powershell
# Both modes
npm run test:benchmarks -- --mode all --report

# AST extraction accuracy
npm run test:benchmarks -- --mode ast

# Self-similarity detection
npm run test:benchmarks -- --mode self-similarity
```

**Output:**
- `reports/test-report.ast.md` — AST benchmark results
- `reports/test-report.self-similarity.md` — Self-similarity results
- `reports/benchmarks/<mode>/` — Versioned JSON history

---

## Fixture Management

### `npm run fixtures:verify`

Validates all repository fixtures remain in sync with expectations.

```powershell
npm run fixtures:verify -- --workspace /path/to/repo
```

**What it checks:**
- Fixture workspaces pass graph snapshot
- Fixture workspaces pass SlopCop (per-fixture config)
- Manifest entries are complete

### `npm run fixtures:regenerate`

Rebuilds benchmark fixtures from source.

### `npm run fixtures:record-fallback`

Records fallback inference fixtures for edge case testing.

### `npm run fixtures:sync-docs`

Syncs AST documentation fixtures with current analyzer output.

---

## Build & Native Dependencies

### `npm run build`

Builds all workspaces (shared, server, extension, scripts).

### `npm run rebuild:better-sqlite3:force`

Rebuilds native SQLite bindings. Required when:
- Switching Node versions
- After fresh `npm install` on some systems
- ABI mismatch errors in tests

```powershell
npm run rebuild:better-sqlite3:force
```

---

## Relationship to External Commands

| Internal Command | External Equivalent | Notes |
|------------------|---------------------|-------|
| `graph:audit` | None | External users don't need coverage auditing |
| `graph:snapshot` | None | Runs automatically inside `graph:audit` |
| `slopcop:markdown` | `live-docs:lint` | Lint covers Live Doc structure; SlopCop covers all markdown |
| `safe:commit` | None | External users validate with `live-docs:lint` only |
| `test:*` | None | External users don't run our test suites |

---

## Related Documentation

- [copilot-instructions.md](../../.github/copilot-instructions.md) — Commands section for quick reference
- [Layer 1 CLI Reference](../layer-1/guides/cli-reference.mdmd.md) — External-facing commands
- [Falsifiability Requirements](falsifiability-requirements.mdmd.md) — Why we test what we test
