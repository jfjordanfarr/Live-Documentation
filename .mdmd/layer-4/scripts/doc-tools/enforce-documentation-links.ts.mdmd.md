# scripts/doc-tools/enforce-documentation-links.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/doc-tools/enforce-documentation-links.ts
- Live Doc ID: LD-implementation-scripts-doc-tools-enforce-documentation-links-ts
- Generated At: 2026-02-18T21:27:54.489Z

## Authored
### Purpose
Provide the CLI entry point for documentation-link enforcement so `npm run docs:links:enforce` (and `safe:commit`) can audit or auto-fix missing Live Doc breadcrumbs using the shared `documentationLinks` engine ([first commit](../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-02.SUMMARIZED.md#L52-L87)).

### Notes
- Demonstrated 2025-11-02 by intentionally breaking `main.ts`, running the CLI to catch the `mismatched-breadcrumb`, and landing commit `69d1cf5` that added this tool to the repo ([enforcement demo](../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-02.SUMMARIZED.md#L52-L117)).
- Exported `runCli` on 2025-11-05 so graph audits and other callers could consume it programmatically while keeping exit codes stable across the toolchain ([API hardening](../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-05.SUMMARIZED.md#L70-L86)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:54.489Z","inputHash":"a7e09201d6f266c8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `EXIT_CODES` {#symbol-exit_codes}
- Type: const
- Source: [source](../../../../scripts/doc-tools/enforce-documentation-links.ts#L33)

##### `EXIT_CODES` — Summary
Numeric exit codes used by the documentation-link enforcement CLI.

#### `runCli` {#symbol-runcli}
- Type: function
- Source: [source](../../../../scripts/doc-tools/enforce-documentation-links.ts#L48)

##### `runCli` — Summary
CLI entry point for the documentation-link enforcement tool.

Parses arguments, discovers workspace rules, runs
{@link runDocumentationLinkEnforcement}, and renders results to stdout.

##### `runCli` — Returns
Numeric exit code: `0` on success, `3` when violations are found,
`4` on unexpected failure.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`documentationLinks.DEFAULT_RULES`](../../packages/shared/src/tooling/documentationLinks.ts.mdmd.md#symbol-default_rules)
- [`documentationLinks.DocumentationLinkEnforcementResult`](../../packages/shared/src/tooling/documentationLinks.ts.mdmd.md#symbol-documentationlinkenforcementresult)
- [`documentationLinks.DocumentationLinkViolation`](../../packages/shared/src/tooling/documentationLinks.ts.mdmd.md#symbol-documentationlinkviolation)
- [`documentationLinks.DocumentationRule`](../../packages/shared/src/tooling/documentationLinks.ts.mdmd.md#symbol-documentationrule)
- [`documentationLinks.runDocumentationLinkEnforcement`](../../packages/shared/src/tooling/documentationLinks.ts.mdmd.md#symbol-rundocumentationlinkenforcement)
- [`pathUtils.normalizeWorkspacePath`](../../packages/shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [enforce-documentation-links.test.ts](./enforce-documentation-links.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
