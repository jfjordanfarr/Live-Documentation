# `scripts/live-docs/generate.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/live-docs/generate.ts`
- Entry: command `live-docs:generate` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-22T07:12:57.722Z

## Authored
### Purpose
CLI entry point that applies workspace configuration, resolves include/changed filters, and invokes the server-side Live Doc generator so developers can regenerate Layer‑4 mirrors on demand or during automation.

### Notes
- The script wraps `generateLiveDocs` from the generator package, wiring in the JSON config file and the `--changed`, `--include` and `--dry-run` filters.
- `--check` uses the generator's dry run and fails when a doc would be created, updated or deleted, without writing docs or the derived graph index. It is the CI mirror-freshness gate added after the [October 19 audit](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-19/2026-10-19.1.record.md#turn-16). `--dry-run` keeps its preview-only success behavior.
- Since 2026-10-17 the configuration is the file `--config` names, else the workspace's own `.live-docs.config.json`, as inspect reads it, else the shipped defaults. Until then `--workspace` without `--config` read no configuration and wrote the shipped default root, which the history probe of 2026-10-16 found while regenerating past commits; the history command ([the plan's C1](../../../../.mdmd/layer-3/change-over-time.mdmd.md)) applies its lens's configuration explicitly in any case.
- `--version` prints the generator package's version from its manifest since 2026-10-18, through [cli.ts](cli.ts.mdmd.md); until then it printed a constant, 0.1.0, or an environment variable, while the package is 0.0.0, which the history command's lens showed up, since the lens carries the manifest's version.
- Since 2026-11-12 its usage says what it does: `--glob` replaces the configuration's glob, where the usage said it added one, and an argument that is not an option is taken as a glob. A refused argument ends through `runCommand` in [cli.ts](cli.ts.mdmd.md), one line with the command that lists the options, and the configuration is read by `readConfiguration` there, the same rule as before.
- Since 2026-11-19 a run ends by naming the kinds of file no reader reads, with how many of each (`unreadKinds`), by the rule each such doc's own note follows (`noReaderHandles`): [the cold run](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md#the-strangers-steps-and-stumbles) found DNN's 299 `.SqlDataProvider` scripts, its `.vb`, `.sln` and `.bat` files and tSQLt's `.sqlproj` given empty docs with nothing said, so that a person could not learn what the map leaves out without opening docs one by one. Pictures, fonts and recordings are left out of the count, since they hold nothing a reader could find. The workspace is taken through `workspaceFolder` in [cli.ts](cli.ts.mdmd.md) since the same day, from the folder the command was run from ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md)). And a run says, before it reads anything, when what git ignores cannot be asked of git, by `gitIgnoresUnasked` there; and, when the workspace was found above where the command was run, which folder it maps.
- Since 2026-11-20 a file the run could not map for a cause of the machine's (`machineFailure` in [processMark.ts](../../packages/engine/src/live-docs/processMark.ts.mdmd.md): a permission refused, too many open files, a full disk) is named apart, under a line that says the file, or something it needs, could not be read and the run went on without it, with the system's reason; the line that calls the fault Live Documentation's, not the file's, stays for the rest, which until then it said of every such file. `generate-cli.test.ts` holds both lines.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`LiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput) (type-only)
- [`liveDocumentationConfig.noReaderHandles`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-noreaderhandles)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`processMark.machineFailure`](../../packages/engine/src/live-docs/processMark.ts.mdmd.md#symbol-machinefailure)
- [`compareText`](../../packages/engine/src/tooling/compareText.ts.mdmd.md#symbol-comparetext)
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`cli.UsageError`](./cli.ts.mdmd.md#symbol-usageerror)
- [`cli.gitIgnoresUnasked`](./cli.ts.mdmd.md#symbol-gitignoresunasked)
- [`cli.invocationFolder`](./cli.ts.mdmd.md#symbol-invocationfolder)
- [`cli.optionValue`](./cli.ts.mdmd.md#symbol-optionvalue)
- [`cli.packageVersion`](./cli.ts.mdmd.md#symbol-packageversion)
- [`cli.readConfiguration`](./cli.ts.mdmd.md#symbol-readconfiguration)
- [`cli.runCommand`](./cli.ts.mdmd.md#symbol-runcommand)
- [`cli.stackOf`](./cli.ts.mdmd.md#symbol-stackof)
- [`cli.stackWanted`](./cli.ts.mdmd.md#symbol-stackwanted)
- [`cli.workspaceFolder`](./cli.ts.mdmd.md#symbol-workspacefolder)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
