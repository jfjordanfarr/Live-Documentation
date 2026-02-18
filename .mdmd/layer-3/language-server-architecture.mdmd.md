# Language Server Architecture

## Metadata

- Layer: 3
- Component IDs: COMP-003

## Components

### COMP-003 Language Server Runtime

Supports FR-LD1 and FR-LD5 by providing a thin LSP wrapper that debounces file-save events (`ChangeQueue`), surfaces `live-docs:lint` findings as Problems-panel diagnostics (`DiagnosticPublisher`), and delegates all heavy lifting to the CLI suite.

## Responsibilities

### Runtime Initialisation

- Resolve workspace configuration and Live Documentation storage (`liveDocumentationConfig`) via `main.ts`.
- Register LSP handlers for configuration updates and diagnostics publication.

### Change Intake

- Debounce document saves through `ChangeQueue`, coalescing rapid edits into a single lint/notification cycle.
- Notify the user via status-bar messaging when tracked artifacts change so regeneration can be triggered manually.

### Lint-as-Diagnostics

- Run `live-docs:lint` checks and surface findings (broken links, structural violations, missing markers) via `DiagnosticPublisher` in the Problems panel.
- Provide the simplest viable diagnostic: "your Live Doc at X references Y, but Y doesn't exist."

### ~~Legacy Responsibilities (Descoped 2026-02-18)~~

- ~~Inference and Ripple Analysis via `RippleAnalyzer` and `changeProcessor`.~~ _(Removed: Live Docs ARE the graph; `live-docs:inspect` handles impact analysis.)_
- ~~Knowledge Feed Stewardship via `KnowledgeGraphBridgeService`.~~ _(Removed.)_
- ~~Diagnostics with hysteresis, noise suppression, and acknowledgement suppression.~~ _(Replaced by stateless lint-as-diagnostics.)_
- ~~Docstring bridge drift detection and regeneration queuing.~~ _(Runs headlessly during `live-docs:generate`.)_

## Interfaces

### Inbound Interfaces

- File save events from the extension, debounced through `ChangeQueue`.
- LSP configuration change notifications.

### Outbound Interfaces

- `DiagnosticPublisher` pushing `live-docs:lint` findings to the Problems panel.
- Status-bar notifications when files need regeneration.

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
