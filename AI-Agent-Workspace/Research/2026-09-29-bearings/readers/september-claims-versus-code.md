# September claims checked against the code

_Historical checkpoint at `c4bb37cb`, followed up on 2026-09-30 during the first Codex session. This completes the concrete checks left in the third-run reader's working notes. It is a bounded audit, not a certification of the repository or a new set of product decisions. See [the recovery assessment](../recovery.md)._

## What was checked

The original reader reported five groups of discrepancies. The follow-up inspected the root and CLI package manifests, CI workflow, verification scripts, documentation-link parser and command, the named Explorer code, and the oracle integration test. It ran the documentation-link enforcement command and the separate Markdown-link audit. It did not build the product, run the full test suites, install a packed CLI, or open the Explorer.

### The documentation breadcrumb check currently checks no code files

[Documentation link enforcement](../../../../scripts/doc-tools/documentationLinks.ts) collects targets only from `live-docs:code` or legacy `mdmd:code` HTML comments. Its default docs are the generated mirror. No document in that mirror has such a marker, so the target map is empty. The check is still called by [verify.mjs](../../../../scripts/verify.mjs).

The actual result on 2026-09-30 was:

```json
{
  "ok": true,
  "attemptedFix": false,
  "scannedDocuments": 593,
  "scannedFiles": 0,
  "fixedFiles": 0,
  "violations": []
}
```

This is a check without current inputs, not proof that source breadcrumbs are correct. The original reader's phrase “a check that cannot fail” was too broad: it can report violations when supplied documents containing its markers. Its present repository configuration exercises none of that enforcement. The current grammar and the purpose of source breadcrumbs should determine whether the check is adapted or retired; adding decorative markers just to make it do work would not answer that question.

The separate [SlopCop Markdown-link audit](../../../../scripts/slopcop/check-markdown-links.ts) scanned 757 files and found zero broken links before the cleanup edits. It checks different relationships and does not establish breadcrumb coverage.

### Playwright runs only when explicitly selected

[CI](../../../../.github/workflows/ci.yml) calls `ci-check`, which invokes [safe-to-commit.mjs](../../../../scripts/safe-to-commit.mjs) with `--skip-git-status`. The script runs Playwright only when `--e2e` or its npm configuration equivalent enables it. It defaults to false. Consequently the ordinary commit/CI chain omits the Explorer's browser tests and design audits.

Separately, the root [package.json](../../../../package.json) builds both Explorer bundles in `pretest:e2e` and repeats those builds in `test:e2e`. An ordinary `npm run test:e2e` therefore requests each build twice. This follows from the script definitions; no browser run was performed in this review.

### The root build omits the CLI package

The root build names engine, Explorer and generator. [The CLI package](../../../../packages/cli/package.json) has its own build command, but neither the root build nor the inspected CI workflow calls it. The command table in `AGENTS.md` said four packages and was corrected during this cleanup.

The CLI's [entry point](../../../../packages/cli/src/index.ts) still resolves TypeScript scripts and `tsx` relative to the monorepo; its dispatch table has no `board` command. CI's `npm pack --dry-run` checks packaging without invoking the installed command. These facts support the documented “not yet publishable” status; they do not establish that a packed CLI works. The reader's “never built” was stronger than the evidence: the package does have a build script.

### Product code still knows this workspace's conventions

[detailPanel.ts](../../../../packages/explorer/src/client/detailPanel.ts) strips a literal `.mdmd/layer-<number>/` prefix when resolving a source directory, and [entry-heuristics.ts](../../../../packages/explorer/src/client/bootstrap/entry-heuristics.ts) penalizes literal `.mdmd` and `ai-agent-workspace` path fragments. Those are repository conventions in product code, contrary to the configuration boundary in `AGENTS.md`.

The original notes also identify old source-header links in configuration and documentation tooling. The dead-marker result above explains why the breadcrumb enforcer does not validate them. A future correction should resolve paths from the configured graph/doc mapping and test another workspace layout, rather than add another recognized hardcoded layout.

### The compiler comparison runs in integration tests, without an accuracy floor

This corrects a claim in the earlier [bearings](../README.md): the gate does exercise compiler comparison. [oracle.test.ts](../../../../tests/integration/live-docs/oracle.test.ts) calls `compareFixture` for programs with compiler expectations, and `verify` runs the integration project.

The assertions require `found + missing` to account for every expected edge and project reference, and check separation of found/extra edges. They do not require a minimum fraction to be found. Thus “no compiler comparison runs in the gate” is false; “the comparison does not enforce an accuracy floor” is true. The [measurement-code reader](audit-deleted-measurement-code.md) had already found this distinction. No new pass mark is chosen here.

## Questions worth carrying forward

- Does a source-to-doc breadcrumb check still have a useful job now that metadata and the graph provide the source mapping? Determine its purpose before changing or removing it.
- Should the default CI chain include the browser checks that express the Explorer's visual requirements? Its present omission should be deliberate and documented.
- What should independently measured agreement prevent from regressing, and how should known compiler/indexer artifacts be represented without filtering ground truth? This remains a measurement-design question; the owner's September comments do not supply a numeric threshold.

## Reproduction and limits

The npm form of the Markdown audit failed in the Codex sandbox before running the audit: `Error: listen EPERM: operation not permitted /tmp/tsx-1000/14.pipe`. The same scripts ran through Node's `tsx` import hook, without the CLI's IPC listener:

```bash
TSX_TSCONFIG_PATH=./tsconfig.base.json node --import tsx scripts/doc-tools/enforce-documentation-links.ts --json
TSX_TSCONFIG_PATH=./tsconfig.base.json node --import tsx scripts/slopcop/check-markdown-links.ts
```

No check, path or threshold was disabled. Counts above describe the pre-cleanup checkpoint. The full suites, visual behaviour, packaged CLI execution, dependency vulnerabilities and historical quotations were not independently revalidated by this follow-up.
