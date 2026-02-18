# Extension Surfaces Architecture

## Metadata

- Layer: 3
- Component IDs: COMP-002

## Components

### COMP-002 Extension Surfaces

Supports FR-LD5 and SC-LD4 by delivering the VS Code UX that wraps CLI capabilities (generate, lint, inspect, visualize) into editor commands and surfaces `live-docs:lint` findings in the Problems panel.

## Responsibilities

### Activation and Settings Sync

- Bootstrap the extension (`extension.ts`), forward `liveDocumentation.*` configuration updates to the language server, and register commands.
- Debounce file-save events through `ChangeQueue` to avoid flooding the linter; notify users via status-bar messaging when files need re-linting or regeneration.

### Lint-as-Diagnostics

- Surface `live-docs:lint` results (broken links, structural violations, missing markers) as VS Code Problems-panel entries via the language server's `DiagnosticPublisher`.
- Provide the simplest viable diagnostic: "your Live Doc at X references Y, but Y doesn't exist."
- ~~Register `docDiagnosticProvider` for ripple diagnostics, acknowledgement workflows, noise filtering, dependency quick picks, and diagnostic tree views.~~ _(Descoped 2026-02-18: replaced by stateless lint-as-diagnostics.)_

### CLI Command Wrappers

- Register commands: `Live Docs: Regenerate`, `Live Docs: Visualize`, `Live Docs: Inspect`, `Live Docs: Lint`.
- CLI parity: every editor command invokes the same underlying script that `npm run live-docs:*` uses.

### Headless Tooling Support

- Ship CLI parity (`live-docs:generate`, `live-docs:inspect`, `live-docs:lint`, `live-docs:visualize`) so automation and shell workflows reuse the same contracts as the extension UI.

## Interfaces

### Inbound Interfaces

- VS Code activation pipeline (commands, configuration events).
- File save events debounced through `ChangeQueue`.

### Outbound Interfaces

- `DiagnosticPublisher` pushing `live-docs:lint` findings to the Problems panel.
- CLI script invocations (`scripts/live-docs/*.ts`) for headless environments.
- Status-bar messaging for regeneration/linting prompts.

## Linked Implementations

### ~~IMP-101 docDiagnosticProvider~~ _(Descoped 2026-02-18)_

~~Transforms diagnostics into Problems entries, hovers, and quick actions.~~ Replaced by `DiagnosticPublisher` surfacing `live-docs:lint` findings.

### ~~IMP-107 dependencyQuickPick~~ _(Descoped 2026-02-18)_

~~Bridges the inspection request into a Quick Pick UX.~~ Dependency exploration is now served by `live-docs:inspect` CLI and Explorer Local Map.

### ~~IMP-108 analyzeWithAI Command~~ _(Descoped 2026-02-17)_

~~Collected LLM assessments for outstanding diagnostics. Source and Live Doc deleted.~~

### ~~IMP-109 fileMaintenance Watcher~~ _(Descoped 2026-02-18)_

~~Debounces rename/delete events and alerts the server.~~ File watching is now handled by `ChangeQueue` for debounced save events only.

### ~~IMP-110 symbolBridge Service~~ _(Descoped 2026-02-18)_

~~Supplies workspace symbols and references to inference pipelines.~~ Symbol extraction runs headlessly via analyzers during `live-docs:generate`.

### IMP-111 liveDocsCommands

Registers Live Doc regeneration, inspect, lint, and visualize commands. CLI parity via `npm run live-docs:*`.

### IMP-112 liveDocsAuthoringCommands _(wishlist)_

If docs → code write-back is pursued, this will register preview/apply surfaces behind explicit opt-in.

### IMP-302 liveDocsLint CLI

Headless audit ensuring Live Doc linkage and coverage. [lint.ts Live Doc](../layer-4/scripts/live-docs/lint.ts.mdmd.md).

### IMP-303 liveDocsInspect CLI

CLI equivalent of dependency explorer. [inspect.ts Live Doc](../layer-4/scripts/live-docs/inspect.ts.mdmd.md).

### IMP-304 liveDocsGenerate CLI

Deterministic regeneration of Live Doc mirrors. [generate.ts Live Doc](../layer-4/scripts/live-docs/generate.ts.mdmd.md).

### IMP-305 liveDocsGenerateCli

Command palette + CLI entry points for regeneration. [generate.ts Live Doc](../layer-4/scripts/live-docs/generate.ts.mdmd.md).

### IMP-306 liveDocsInspectCli

Headless inspection of Live Doc metadata. [inspect.ts Live Doc](../layer-4/scripts/live-docs/inspect.ts.mdmd.md).

## Evidence

- CLI integration suites under `tests/integration/live-docs` validate regeneration, lint, and inspection parity.
- `npm run live-docs:generate -- --dry-run`, `npm run live-docs:lint`, and `npm run safe:commit` capture live adoption telemetry.

## Operational Notes

- The extension is a thin CLI wrapper: it registers commands, debounces saves, and surfaces lint findings. All heavy lifting happens in the CLI scripts.
- ~~Quick Pick controller, acknowledgement UX, dependency explorer annotations, and caching strategies for the old diagnostics system have been removed (2026-02-18).~~
