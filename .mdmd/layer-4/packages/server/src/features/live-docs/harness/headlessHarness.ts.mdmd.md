# packages/server/src/features/live-docs/harness/headlessHarness.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/harness/headlessHarness.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-harness-headlessharness-ts
- Generated At: 2026-02-18T21:27:52.489Z

## Authored
### Purpose
Runs the headless harness pipeline end-to-end—preparing a workspace, invoking Live Docs (and optional System views), and writing reports/containers—so we can validate fixtures without VS Code, per the 2025-11-16 execution log ([chat](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L1085-L1115)).

### Notes
- Builds scenario-specific configs before each run, matching the fixture glob strategy captured earlier that day.
- Emits optional container specs and timestamped reports so CI and hosted demos can replay the same runs without manual wiring.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:52.489Z","inputHash":"ed4830295e897610"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HeadlessHarnessLogger` {#symbol-headlessharnesslogger}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/harness/headlessHarness.ts#L19)

##### `HeadlessHarnessLogger` — Summary
Logger interface for headless harness output (info required, warn optional).

#### `HeadlessHarnessRunOptions` {#symbol-headlessharnessrunoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/harness/headlessHarness.ts#L30)

##### `HeadlessHarnessRunOptions` — Summary
Options controlling a single headless harness run.

#### `HeadlessHarnessRunResult` {#symbol-headlessharnessrunresult}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/harness/headlessHarness.ts#L44)

##### `HeadlessHarnessRunResult` — Summary
Outcome of a headless harness run, including paths and generator results.

#### `runHeadlessHarness` {#symbol-runheadlessharness}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/harness/headlessHarness.ts#L66)
- Parameters: `options`: [`HeadlessHarnessRunOptions`](#symbol-headlessharnessrunoptions)

##### `runHeadlessHarness` — Summary
Executes a headless Live Docs generation scenario end-to-end.

Prepares a workspace from the scenario fixture, runs the Stage-0
generator and (optionally) the System-layer generator, writes a
JSON report, and cleans up unless `keepWorkspace` is set.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path` - `path`
- [`generator.LiveDocGeneratorResult`](../generator.ts.mdmd.md#symbol-livedocgeneratorresult) (type-only)
- [`generator.generateLiveDocs`](../generator.ts.mdmd.md#symbol-generatelivedocs) (type-only)
- [`scenarios.HeadlessHarnessScenario`](./scenarios.ts.mdmd.md#symbol-headlessharnessscenario) (type-only)
- [`generator.SystemLiveDocGeneratorResult`](../system/generator.ts.mdmd.md#symbol-systemlivedocgeneratorresult) (type-only)
- [`generator.generateSystemLiveDocs`](../system/generator.ts.mdmd.md#symbol-generatesystemlivedocs) (type-only)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`LiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
<!-- LIVE-DOC:END Dependencies -->
