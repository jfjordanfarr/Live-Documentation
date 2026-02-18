# Live Documentation Extension

## Metadata

- Layer: 3
- Archetype: component
- Live Doc ID: COMP-extension

## Authored

### Purpose

Explain how the VS Code extension manifests Live Documentation inside the editor—surfacing lint diagnostics in the Problems panel, exposing CLI commands (regenerate, lint, inspect, visualize), and debouncing file saves via ChangeQueue.

### Notes

- Activates once the workspace exposes Live Documentation configuration, forwarding settings to the language server.
- Surfaces `live-docs:lint` findings (broken links, structural violations) in the Problems panel via `DiagnosticPublisher`.
- Registers commands for regeneration, linting, inspection, and visualization that delegate to the CLI scripts.
- Debounces file-save events through `ChangeQueue` so rapid edits coalesce into a single notification cycle.
- ~~Hosts ripple diagnostics via `docDiagnosticProvider`, acknowledgement workflows, dependency quick picks, symbol bridge, and file maintenance watchers.~~ _(Descoped 2026-02-18: replaced by stateless lint-as-diagnostics.)_

### Strategy

- Keep the extension as thin as possible: it registers commands and surfaces lint findings. All heavy lifting lives in the CLI scripts.
- Continue dogfooding the extension against the integration harness to guarantee editor cues stay deterministic.

## System References

### Components

- [packages/extension/src/extension.ts](../layer-4/packages/extension/src/extension.ts.mdmd.md)

## Evidence

- CLI integration suites (`tests/integration/live-docs`) cover regeneration, lint, and inspection parity.
- `npm run safe:commit` exercises the extension build and lint pipeline.
