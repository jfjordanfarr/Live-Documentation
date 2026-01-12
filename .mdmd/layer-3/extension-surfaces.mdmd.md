# Extension Surfaces Architecture

## Metadata
- Layer: 3
- Component IDs: COMP-002

## Components

### COMP-002 Extension Surfaces
Supports FR-LD5, FR-LD7, and SC-LD4 by delivering the VS Code UX and CLI surfaces that expose Live Documentation diagnostics, regeneration flows, and adoption tooling while mirroring the server-side capabilities.

## Responsibilities

### Activation and Settings Sync
- Bootstrap the extension (`extension.ts`) and ensure diagnostics opt-in flow, runtime configuration propagation, and Live Documentation participation in ripple analysis.
- Forward `liveDocumentation.*` and `linkAwareDiagnostics.*` configuration updates to the language server and record activation telemetry for troubleshooting.

### Diagnostics Experience
- Register `docDiagnosticProvider` to render quick fixes, Live Doc hyperlinks, regeneration timestamps, and acknowledgement affordances for `doc-drift` and `code-ripple` diagnostics.
- Provide Analyze with AI command surfaces so leads can capture LLM-authored assessments directly inside the diagnostics tree.
- Surface Live Doc regeneration commands (`Live Docs: Regenerate File`, `Live Docs: Open Mirror`) and diff previews alongside diagnostics.

### Dependency Exploration and Maintenance
- Offer `linkDiagnostics.inspectDependencies` Quick Pick views backed by the `INSPECT_DEPENDENCIES_REQUEST` LSP contract enriched with Live Doc dependency metadata.
- Maintain file rename/delete awareness via `fileMaintenance.ts`, raising orphan diagnostics, regeneration prompts, and rebind flows in partnership with the server.
- Inject Live Doc summary panels (authored header + Observed Evidence) into dependency explorers and status bar surfaces.

### Authoring Loop Commands
- Surface docstring drift diagnostics and remediation guidance (read-only) so authors can keep docs and code aligned.
- If/when docs → code write-back is pursued, present preview/apply flows behind strict feature flags and audit logging.
- If/when scaffolding is pursued, emit scratch drafts linked back to the originating Live Documentation file without modifying tracked sources.

### Headless Tooling Support
- Ship CLI parity (`graph:inspect`, `graph:audit`, `graph:snapshot`, `live-docs:generate`, `live-docs:inspect`) so automation and shell workflows reuse the same traversal contracts and Live Doc metadata as the extension UI.
- Expose symbol bridge services that harvest workspace symbols and Live Doc metadata for inference seeding.

## Interfaces

### Inbound Interfaces
- VS Code activation pipeline (commands, configuration events, workspace watches).
- LSP notifications and requests: diagnostics, dependency inspection, maintenance prompts, symbol bridge pulls.

### Outbound Interfaces
- Quick Pick controller supplying `InspectDependenciesResult` objects enriched with Live Doc summaries and regeneration shortcuts.
- CLI scripts (`scripts/graph-tools/*.ts`, `scripts/live-docs/*.ts`) invoking shared traversal, regeneration, and inspection APIs for headless environments.

## Linked Implementations

### IMP-101 docDiagnosticProvider
Transforms diagnostics into Problems entries, hovers, and quick actions. See [docDiagnosticProvider.ts Live Doc](../layer-4/packages/extension/src/diagnostics/docDiagnosticProvider.ts.mdmd.md) for generated details.

### IMP-107 dependencyQuickPick
Bridges the inspection request into a Quick Pick UX. See [dependencyQuickPick.ts Live Doc](../layer-4/packages/extension/src/diagnostics/dependencyQuickPick.ts.mdmd.md) for the implementation surface.

### IMP-108 analyzeWithAI Command
Collects LLM assessments for outstanding diagnostics. The command’s Stage‑0 mirror is [analyzeWithAI.ts Live Doc](../layer-4/packages/extension/src/commands/analyzeWithAI.ts.mdmd.md).

### IMP-109 fileMaintenance Watcher
Debounces rename/delete events and alerts the server. Consult [fileMaintenance.ts Live Doc](../layer-4/packages/extension/src/watchers/fileMaintenance.ts.mdmd.md) for operational detail once generated.

### IMP-110 symbolBridge Service
Supplies workspace symbols and references to inference pipelines. Implementation intent is captured in [symbolBridge.ts Live Doc](../layer-4/packages/extension/src/services/symbolBridge.ts.mdmd.md).

### IMP-111 liveDocsCommands
Registers Live Doc regeneration, inspect, and diff commands. The CLI parity is now expressed through `npm run live-docs:generate` and `npm run live-docs:system`; inspect [generate.ts Live Doc](../layer-4/scripts/live-docs/generate.ts.mdmd.md) for the generated view.

### IMP-112 liveDocsAuthoringCommands *(wishlist)*
If docs → code write-back is pursued, this will register preview/apply and scaffolding surfaces behind explicit opt-in. Implementation intent will live at `.mdmd/layer-4/packages/extension/src/commands/liveDocsAuthoring.ts.mdmd.md` when generated.

### IMP-302 liveDocsLint CLI
Headless audit ensuring Live Doc linkage and coverage. Operational detail is sourced from [lint.ts Live Doc](../layer-4/scripts/live-docs/lint.ts.mdmd.md).

### IMP-303 liveDocsInspect CLI
CLI equivalent of dependency explorer. Refer to [inspect.ts Live Doc](../layer-4/scripts/live-docs/inspect.ts.mdmd.md) for the materialised view.

### IMP-304 liveDocsGenerate CLI
Deterministic regeneration of Live Doc mirrors. See [generate.ts Live Doc](../layer-4/scripts/live-docs/generate.ts.mdmd.md).

### IMP-305 liveDocsGenerateCli
Command palette + CLI entry points for regeneration. The generator surface is documented at [generate.ts Live Doc](../layer-4/scripts/live-docs/generate.ts.mdmd.md).

### IMP-306 liveDocsInspectCli
Headless inspection of Live Doc metadata mirroring the UI. Legacy references now point to on-demand System outputs (`npm run live-docs:system`); the dedicated inspect CLI will return once its materialised view pipeline stabilises.

## Evidence
- Extension unit tests: `docDiagnosticProvider.test.ts`, `dependencyQuickPick.test.ts`, `analyzeWithAI.test.ts`, `fileMaintenance.test.ts` (pending rename once watcher tests land).
- CLI integration suites under `tests/integration/graph-tools` validate audit and inspection parity.
- Planned Live Doc suites under `tests/integration/live-docs` verify regeneration commands and CLI parity.
- `npm run graph:audit`, `npm run graph:snapshot`, `npm run live-docs:generate -- --dry-run`, and `npm run safe:commit` capture live adoption telemetry for these surfaces.

## Operational Notes
- Quick Pick controller surfaces schema failures via `showErrorMessage`; analyze command posts toasts when assessments store or fail.
- Future acknowledgement UX may feed dependency explorer annotations; caching strategies remain open design questions.
