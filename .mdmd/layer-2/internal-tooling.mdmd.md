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
| Debugging graph issues | [Graph Tooling](#graph-tooling) |
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

## Graph Tooling

The "graph" tooling operates on a **legacy SQLite/JSON snapshot** used for relationship rule validation and symbol coverage analysis. This is **distinct from** the Live Doc markdown graph used by `live-docs:*` commands.

### `npm run graph:snapshot`

Rebuilds the workspace graph (SQLite database + JSON fixture).

```powershell
npm run graph:snapshot -- --workspace /path/to/repo
```

**Output:**
- `.live-documentation/live-documentation.db` — SQLite database
- `data/graph-snapshots/workspace.snapshot.json` — JSON fixture

**When to run:** Usually not needed manually — `graph:audit` runs it internally.

### `npm run graph:audit`

Flags files missing Live Docs, orphan documents, and symbol coverage gaps. Automatically runs `graph:snapshot` first.

```powershell
npm run graph:audit -- --workspace . --json
```

**What it checks:**
- Code files without Live Docs
- Live Docs without corresponding source files (orphans)
- Exported symbols without documentation
- Relationship rule violations

### `npm run graph:inspect`

Low-level querying of the graph database. Useful for debugging.

```powershell
# List all symbol kinds in the graph
npm run graph:inspect -- -- --list-kinds

# Inspect a specific file
npm run graph:inspect -- --file packages/server/src/main.ts

# Inspect by symbol ID
npm run graph:inspect -- --id <symbol-id>
```

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
