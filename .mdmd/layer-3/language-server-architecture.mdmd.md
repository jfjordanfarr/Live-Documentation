# Language Server Architecture

## Metadata
- Layer: 3
- Component IDs: COMP-003

## Components

### COMP-003 Language Server Runtime
Supports FR-LD1, FR-LD2, and FR-LD5 by orchestrating workspace change ingestion, Live Doc regeneration hooks, inference, diagnostics, and knowledge feed health so ripple answers remain deterministic and actionable.

## Responsibilities

### Runtime Initialisation
- Resolve workspace configuration, Live Documentation storage (`liveDocumentationConfig`), and provider guard settings via `main.ts` before wiring shared services.
- Register LSP handlers for configuration updates, dependency and symbol inspections, file maintenance requests, Live Doc regeneration commands, and diagnostics publication.

### Change Intake and Persistence
- Debounce and queue document/code saves through `ChangeQueue` and `ArtifactWatcher`, enriching events with content, category, relationship hints, and Live Doc ownership.
- Notify the Live Doc Generator service when tracked artifacts change so staged markdown stays current before diagnostics fire.
- Persist change metadata via `saveDocumentChange` / `saveCodeChange` so acknowledgement workflows, drift history, and regeneration provenance stay durable.

### Docstring Bridge Stewardship
- Coordinate docstring bridge adapters that lift XML/TSDoc/Sphinx/Rustdoc payloads into the canonical schema consumed by the Live Doc generator.
- Detect drift between inline documentation and Live Doc narratives, surface diagnostics, and queue regeneration when discrepancies persist across saves.
- Ensure adapters emit deterministic per-field headings (`##### `Symbol` — Summary`, etc.), report unsupported tags with provenance, and raise telemetry when placeholders or raw fragments exceed thresholds so product owners can prioritise new mappings.

### Inference and Ripple Analysis
- Merge inference results from workspace providers, Live Doc dependency snapshots, knowledge feeds, and optional LLM fallbacks inside `changeProcessor`.
- Drive `RippleAnalyzer` and dependency builders to compute downstream impacts and annotate Live Doc projections before diagnostic publication.

### Knowledge Feed Stewardship
- Bootstrap static JSON feeds and streaming sources using `KnowledgeGraphBridgeService` and `KnowledgeFeedManager`.
- Validate feed health, persist refreshed edges, and expose degradation diagnostics back to the extension.

### Diagnostics Publication
- Emit `code-ripple` and `doc-drift` diagnostics via publishers that respect hysteresis, noise suppression, acknowledgement suppression, and runtime budgets while embedding Live Doc hyperlinks, evidence counts, and regeneration timestamps.

## Interfaces

### Inbound Interfaces
- LSP requests/notifications: configuration changes, maintenance prompts, dependency/symbol inspections, and symbol harvesters.
- Workspace save/rename/delete events transferred from the extension via the change queue and maintenance contracts.
- Live Doc regeneration commands from CLI/extension surfaces (`liveDocs/generate`, `Live Docs: Regenerate File`).

### Outbound Interfaces
- Diagnostics notifications to the extension, annotated with ripple metadata and acknowledgement state.
- Dependency inspection responses (`InspectDependenciesResult`, symbol neighbour payloads) and feed health summaries for UI/CLI use.
- Live Doc Generator queue events providing change hints, targeted artifact lists, and configuration snapshots.
- Telemetry/logging hooks for suppression metrics, feed status, and change event persistence.

## Linked Implementations

### IMP-101 main.ts
Server entrypoint handling LSP initialisation and request routing. [Server Main Entry](../layer-4/packages/server/src/main.ts.mdmd.md)

### IMP-102 liveDocsGenerate CLI
CLI-driven Live Doc regeneration that the server delegates to. [Live Docs Generate](../layer-4/scripts/live-docs/generate.ts.mdmd.md)

### IMP-103 liveDocsLint CLI
Stateless link and evidence validation for Live Docs. [Live Docs Lint](../layer-4/scripts/live-docs/lint.ts.mdmd.md)

### IMP-104 liveDocsInspect CLI
Dependency pathfinding and inspection for artifacts. [Live Docs Inspect](../layer-4/scripts/live-docs/inspect.ts.mdmd.md)

### IMP-105 buildLiveDocGraph
In-memory graph construction from Live Doc markdown. [Live Doc Graph](../layer-4/packages/scripts/src/live-docs/graph/liveDocGraph.ts.mdmd.md)

## Evidence
- Unit tests for server entrypoint: `main.test.ts`.
- Live Docs integration suites: `generation.test.ts`, `inspect-cli.test.ts`, `evidence.test.ts`.
- Safe-to-commit orchestrations run Live Docs lint checks to confirm link integrity.

## Operational Notes
- The server is now a thin LSP wrapper that delegates heavy lifting to the Live Docs CLI suite.
- GraphStore and RippleAnalyzer have been eliminated; Live Docs ARE the database for workspace connectivity.
- Pending work includes wiring LSP diagnostics to surface live-docs:lint errors in the Problems pane.
