# packages/shared/src/tooling/documentationLinks.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/documentationLinks.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-documentationlinks-ts
- Generated At: 2026-02-23T21:32:15.181Z

## Authored
### Purpose
Supplies the shared engine that parses Live Doc anchors, maps code files to documentation targets, and enforces breadcrumb comments so maintainer workflows can guarantee every artifact cites its Layer‑4 mirror.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-02.SUMMARIZED.md#turn-13-safe-to-commit-orchestration--audit-gaps]

### Notes
- Introduced while building the docs-to-code validation pipeline on November 2, including the CLI demo that intentionally broke `main.ts` to prove mismatched breadcrumb detection.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-02.SUMMARIZED.md#turn-12-enforcement-demonstration]
- Powers `npm run docs:links:enforce` and the `safe:commit` gate, with follow-up runs on November 3 and beyond confirming zero violations once anchors were repaired.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-23T21:32:15.181Z","inputHash":"f55eb6e704d8b5ac"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DocumentationRule` {#symbol-documentationrule}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L23)

##### `DocumentationRule` — Summary
Declares a bidirectional mapping between documentation files and code files.

Each rule identifies which doc globs contain `live-docs:code` (or legacy `mdmd:code`)
markers pointing at files matched by `codeGlobs`, enabling the enforcement bridge to
verify that breadcrumb comments exist in source files.

#### `DEFAULT_RULES` {#symbol-default_rules}
- Type: const
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L39)
- Returns: [`DocumentationRule`](#symbol-documentationrule)[]

##### `DEFAULT_RULES` — Summary
Built-in rule set mapping Live Documentation files to source code
under `packages/` and `scripts/`.

Includes both the default layout (`.live-documentation/source/`)  and the
MDMD-convention layout (`.mdmd/layer-4/`) used by this workspace.

#### `DocumentationAnchorSummary` {#symbol-documentationanchorsummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L58)

##### `DocumentationAnchorSummary` — Summary
Parsed heading anchor within a documentation file, enriched with
the code paths it covers and backlinks it contains.

#### `DocumentationDocumentAnchors` {#symbol-documentationdocumentanchors}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L82)
- Extends: `ParsedDocumentationAnchors`

##### `DocumentationDocumentAnchors` — Summary
A parsed documentation file's anchors annotated with the rule that produced them.

#### `ResolvedDocumentationTarget` {#symbol-resolveddocumentationtarget}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L90)

##### `ResolvedDocumentationTarget` — Summary
A fully resolved mapping from a code file to the documentation section
that describes it, including backlink status.

#### `DocumentationTargetMap` {#symbol-documentationtargetmap}
- Type: type
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L108)

##### `DocumentationTargetMap` — Summary
Maps workspace-relative code file paths to their resolved documentation targets.

#### `ParseDocumentationAnchorsOptions` {#symbol-parsedocumentationanchorsoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L111)

##### `ParseDocumentationAnchorsOptions` — Summary
Options for {@link parseDocumentationAnchors}.

#### `DocumentationLinkViolation` {#symbol-documentationlinkviolation}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L121)

##### `DocumentationLinkViolation` — Summary
A single violation detected by the documentation-link enforcement pass.

#### `DocumentationLinkEnforcementResult` {#symbol-documentationlinkenforcementresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L149)

##### `DocumentationLinkEnforcementResult` — Summary
Aggregate result from a documentation-link enforcement run.

#### `RunDocumentationLinkEnforcementOptions` {#symbol-rundocumentationlinkenforcementoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L161)

##### `RunDocumentationLinkEnforcementOptions` — Summary
Options for {@link runDocumentationLinkEnforcement}.

#### `parseDocumentationAnchors` {#symbol-parsedocumentationanchors}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L180)
- Returns: `ParsedDocumentationAnchors`
- Parameters: `_unnamed_`: [`ParseDocumentationAnchorsOptions`](#symbol-parsedocumentationanchorsoptions)

##### `parseDocumentationAnchors` — Summary
Parses heading anchors from a documentation file, collecting
`live-docs:code` markers and inline backlinks for each section.

##### `parseDocumentationAnchors` — Parameters
- `docPath`: Workspace-relative path to the documentation file.
- `options`: Workspace root and optional pre-loaded content.

##### `parseDocumentationAnchors` — Returns
Parsed anchors with code paths and backlinks.

#### `resolveCodeToDocumentationMap` {#symbol-resolvecodetodocumentationmap}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L247)
- Returns: [`DocumentationTargetMap`](#symbol-documentationtargetmap)
- Parameters: `documents`: [`DocumentationDocumentAnchors`](#symbol-documentationdocumentanchors)[]; `targetMap`: [`DocumentationTargetMap`](#symbol-documentationtargetmap)

##### `resolveCodeToDocumentationMap` — Summary
Builds a code-file-to-documentation-target map from parsed documents.

When a code file appears under multiple anchors, the mapping prefers
the anchor that contains a backlink to the code file.

##### `resolveCodeToDocumentationMap` — Parameters
- `documents`: Parsed documentation files with rule metadata.
- `targetMap`: Optional existing map to merge into.

##### `resolveCodeToDocumentationMap` — Returns
The (mutated) target map.

#### `formatDocumentationLinkComment` {#symbol-formatdocumentationlinkcomment}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L292)
- Parameters: `target`: [`ResolvedDocumentationTarget`](#symbol-resolveddocumentationtarget)

##### `formatDocumentationLinkComment` — Summary
Formats a breadcrumb comment string for a given code file and target.

The comment is intended to appear as the first line of the code file,
pointing back to the documentation section that describes it.

##### `formatDocumentationLinkComment` — Parameters
- `filePath`: Workspace-relative path to the code file.
- `target`: Resolved documentation target with label and slug.

##### `formatDocumentationLinkComment` — Returns
Formatted comment string (e.g. `// Live Documentation: path.mdmd.md#slug`).

##### `formatDocumentationLinkComment` — Exceptions
- _Unknown_: If the file extension does not support line comments.

#### `runDocumentationLinkEnforcement` {#symbol-rundocumentationlinkenforcement}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/documentationLinks.ts#L315)
- Returns: [`DocumentationLinkEnforcementResult`](#symbol-documentationlinkenforcementresult)
- Parameters: `options`: [`RunDocumentationLinkEnforcementOptions`](#symbol-rundocumentationlinkenforcementoptions)

##### `runDocumentationLinkEnforcement` — Summary
Runs the full documentation-link enforcement pass across the workspace.

Scans documentation files for `live-docs:code` (or legacy `mdmd:code`) markers, resolves them to code
files, and verifies that each code file contains the correct breadcrumb
comment pointing back to its documentation section. Optionally auto-fixes.

##### `runDocumentationLinkEnforcement` — Parameters
- `options`: Workspace root, rules, fix mode, and optional include list.

##### `runDocumentationLinkEnforcement` — Returns
Aggregate enforcement result with violations.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:fs` - `fs`
- `node:path` - `path`
- [`githubSlugger.createSlugger`](./githubSlugger.ts.mdmd.md#symbol-createslugger)
- [`markdownShared.extractReferenceDefinitions`](./markdownShared.ts.mdmd.md#symbol-extractreferencedefinitions)
- [`pathUtils.normalizeWorkspacePath`](./pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [documentationLinks.test.ts](./documentationLinks.test.ts.mdmd.md)
- [enforce-documentation-links.test.ts](../../../../scripts/doc-tools/enforce-documentation-links.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
