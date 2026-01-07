# Live Documentation Extension

## Metadata
- Layer: 3
- Archetype: component
- Live Doc ID: COMP-extension

## Authored
### Purpose
Explain how the VS Code extension manifests Live Documentation inside the editor—rendering diagnostics, exposing regeneration commands, and keeping the workspace graph in sync with server updates.

### Notes
- Activates once the workspace exposes Live Documentation configuration, forwarding settings and feature flags to the language server so diagnostics and authoring tools stay aligned.
- Hosts the Problems-panel experience for doc drift and ripple alerts via `docDiagnosticProvider` while injecting Live Doc metadata into hovers, quick fixes, and status bar messaging.
- Coordinates file maintenance signals (rename, delete, regenerate) so Stage‑0 mirrors track source moves without orphaning evidence.
- Bridges dependency inspection commands to the shared CLI so engineers can jump between editor quick picks and headless audits without switching mental models.

### Strategy
- Unify Analyze-with-AI, regeneration, and drift signals under a single telemetry surface; any future docs → code authoring remains explicitly opt-in and deferred.
- Continue dogfooding the extension against the integration harness to guarantee editor cues stay deterministic when the server rolls out new diagnostics or rule profiles.

## System References
### Components
- [packages/extension/src/extension.ts](../layer-4/packages/extension/src/extension.ts.mdmd.md)
- [packages/extension/src/diagnostics/docDiagnosticProvider.ts](../layer-4/packages/extension/src/diagnostics/docDiagnosticProvider.ts.mdmd.md)
- [packages/extension/src/services/symbolBridge.ts](../layer-4/packages/extension/src/services/symbolBridge.ts.mdmd.md)
- [packages/extension/src/watchers/fileMaintenance.ts](../layer-4/packages/extension/src/watchers/fileMaintenance.ts.mdmd.md)

## Evidence
- Extension unit suites (`docDiagnosticProvider.test.ts`, `dependencyQuickPick.test.ts`, `analyzeWithAI.test.ts`) cover diagnostics rendering, command routing, and symbol bridge requests.
- Integration harness (`tests/integration/core`, `tests/integration/integrity`, `tests/integration/extension`) exercises ripple diagnostics and ensures extension/server eventing stays stable during regeneration-heavy flows.
