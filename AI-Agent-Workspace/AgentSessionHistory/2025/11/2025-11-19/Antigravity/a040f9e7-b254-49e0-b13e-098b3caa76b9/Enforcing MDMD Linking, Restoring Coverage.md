# Chat Conversation

Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

### User Input

Please audit this workspace for AI slop, and, along the way, determine how best (using the tooling created in this workspace), we might improve our architecture documents in such a way as to ensure that every layer 4 MDMD doc is linked to a layer 3 MDMD doc (if possible, within reason, some exceptions to that rule may be very legitimate). The main thing I want you to do first is audit the workspace, though. What's really spectacular about it is that every single thing done in this workspace is accounted for. Check out the @[.github/copilot-instructions.md] to get an idea of how development has been occuring for the ~2 months this project has been active (and oh BOY has it been active!)

*Viewed [copilot-instructions.md](file:///d:/Projects/Live-Documentation/.github/copilot-instructions.md) *

*Listed directory [Live-Documentation](file:///d:/Projects/Live-Documentation) *

*Edited relevant file*

*Listed directory [.mdmd](file:///d:/Projects/Live-Documentation/.mdmd) *

*User accepted the command `npm run slopcop:markdown -- --json`*

*User accepted the command `npm run slopcop:assets -- --json`*

*User accepted the command `npm run graph:audit -- --workspace . --json`*

*Checked command status*

*Checked command status*

*Checked command status*

*Listed directory [layer-3](file:///d:/Projects/Live-Documentation/.mdmd/layer-3) *

*Listed directory [layer-4](file:///d:/Projects/Live-Documentation/.mdmd/layer-4) *

*Viewed [package.json](file:///d:/Projects/Live-Documentation/package.json) *

*Viewed [live-documentation-pipeline.mdmd.md](file:///d:/Projects/Live-Documentation/.mdmd/layer-3/live-documentation-pipeline.mdmd.md) *

*Listed directory [src](file:///d:/Projects/Live-Documentation/.mdmd/layer-4/packages/server/src) *

*Searched filesystem*

*User accepted the command `ls .mdmd/layer-4/scripts/live-docs/generate.ts.mdmd.mdmd.md`*

*Viewed [audit-doc-coverage.ts](file:///d:/Projects/Live-Documentation/scripts/graph-tools/audit-doc-coverage.ts) *

*User accepted the command `Get-ChildItem -Recurse -File | ForEach-Object { $len = (Get-Content $_.FullName | Measure-Object -Line).Lines; if ($len -gt 500) { Write-Output "$($_.FullName): $len" } }`*

*Checked command status*

*User accepted the command `Get-ChildItem -Path .mdmd\layer-4 -Recurse -File | Select-Object -First 20`*

*User accepted the command `npm run graph:audit -- --json`*

*Checked command status*

*Checked command status*

*Checked command status*

*User accepted the command `Get-ChildItem -Recurse -File -Exclude node_modules, .git, dist, coverage, .vscode-test | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch '\.git' -and $_.FullName -notmatch 'dist' } | ForEach-Object { $len = (Get-Content $_.FullName | Measure-Object -Line).Lines; if ($len -gt 500) { Write-Output "$($_.FullName): $len" } }`*

*Edited relevant file*

### User Input

I am not able to view the plan. 

### User Input

please continue

*Edited relevant file*

*Edited relevant file*

### User Input

Do we need a new script to enforce L4 >- L3 linking? Also, I think it's much more important that L3 references L4 rather than the other way around. Visit chat histories (summarized and unsummarized) to see what I mean. The @[AI-Agent-Workspace/Notes/user-intent-census.md] is a good starting point.

*Viewed [user-intent-census.md](file:///d:/Projects/Live-Documentation/AI-Agent-Workspace/Notes/user-intent-census.md) *

*Listed directory [ChatHistory](file:///d:/Projects/Live-Documentation/AI-Agent-Workspace/ChatHistory) *

*Edited relevant file*

*Viewed [graphStore.ts](file:///d:/Projects/Live-Documentation/packages/shared/src/db/graphStore.ts) *

*Read resource from placeholder *

*Edited relevant file*

### User Input

Is graph:audit the right tool for that job? I know we have a rules engine in place as well. But I'm open to whatever solution is sane and idiomatic. The goal of this workspace is of course to create really great documentation from any workspace whatsoever. Primarily generated. Indeed, you have a whole host of "materialized system views" that you have not yet generated or looked at. They can be very helpful in understanding the structure of the software.

*Edited relevant file*

*Viewed [relationship-rule-engine.mdmd.md](file:///d:/Projects/Live-Documentation/.mdmd/layer-3/relationship-rule-engine.mdmd.md) *

*User accepted the command `npm run live-docs:system`*

*Viewed [link-relationship-rules.json](file:///d:/Projects/Live-Documentation/link-relationship-rules.json) *

*Viewed [relationshipRuleTypes.ts](file:///d:/Projects/Live-Documentation/packages/shared/src/rules/relationshipRuleTypes.ts) *

*Edited relevant file*

### User Input

I see that the system docs were not viewable by you because they went into a gitignored directory. If you wish, you can temporarily modify the gitignore so that you can view the many many items in the `tmp` directory of the AI Agent Workspace. 

*Viewed [.gitignore](file:///d:/Projects/Live-Documentation/.gitignore) *

*Edited relevant file*

*Viewed [.gitignore](file:///d:/Projects/Live-Documentation/.gitignore) *

*Listed directory [component](file:///d:/Projects/Live-Documentation/AI-Agent-Workspace/tmp/system-cli-output/.mdmd/system/component) *

*Viewed [scriptslivedocs.mdmd.md](file:///d:/Projects/Live-Documentation/AI-Agent-Workspace/tmp/system-cli-output/.mdmd/system/component/scriptslivedocs.mdmd.md) *

*Edited relevant file*

*Edited relevant file*

### User Input

I like the plan overall but I just want to make generally sure that the changes we make will be repeatable and idiomatically aligned with the vision and goals of this workspace. Do we need to enhance our system materialized docs? Do you feel like they were sufficiently helpful as to promote to Layer 3 with modified names and some improved readability edits? What about the existing layer 3 docs? What archetypes would you want for them? Visit the @[.github/instructions] to get a good idea of what we are doing with MDMD. You should also visit the @file:001-link-aware-diagnostics/ folder to check the spec docs to get a good idea about what our overarching vision is.

*Listed directory [instructions](file:///d:/Projects/Live-Documentation/.github/instructions) *

*Searched filesystem*

*Viewed [mdmd.instructions.md](file:///d:/Projects/Live-Documentation/.github/instructions/mdmd.instructions.md) *

*Viewed [mdmd.layer3.instructions.md](file:///d:/Projects/Live-Documentation/.github/instructions/mdmd.layer3.instructions.md) *

*Listed directory [001-link-aware-diagnostics](file:///d:/Projects/Live-Documentation/specs/001-link-aware-diagnostics) *

*Viewed [spec.md](file:///d:/Projects/Live-Documentation/specs/001-link-aware-diagnostics/spec.md) *

*Listed directory [layer-3](file:///d:/Projects/Live-Documentation/.mdmd/layer-3) *

*Viewed [live-documentation-pipeline.mdmd.md](file:///d:/Projects/Live-Documentation/.mdmd/layer-3/live-documentation-pipeline.mdmd.md) *

*Edited relevant file*

### User Input

Almost. I just want to make sure we have a plan for when some hundreds and hundreds of links are expected, and how we're going to deal with that in a sane and holistic way. It wouldn't surprise me to find out that requring every layer 4 doc be linked to by a layer 3 doc is, well, heavy. These docs exist to help you and other AI agents navigate the codebase in a way which is incredibly context-efficient. (same is true for that wonderful new `Insepct` CLI that has been created)

*Viewed [system.ts](file:///d:/Projects/Live-Documentation/scripts/live-docs/system.ts) *

*Viewed [task.md](file:///C:/Users/User/.gemini/antigravity/brain/a040f9e7-b254-49e0-b13e-098b3caa76b9/task.md) *

*Edited relevant file*

### User Input



*Edited relevant file*

*User accepted the command `npm run live-docs:system`*

### User Input

Remember, you might need to retarget the temp output folder or temporarily remove your temp folder from the gitignore to access those generated contents (a somewhat frustrating UX difference between what VS Code has and what this new IDE from Google that I now use called Antigravity has. I had previously relied on the AI's ability to create and use temporary files as a means to complete work, and I still believe that is of great use). 

*Edited relevant file*

*Edited relevant file*

*Viewed [.gitignore](file:///d:/Projects/Live-Documentation/.gitignore) *

*User accepted the command `copy "AI-Agent-Workspace\tmp\system-cli-output\.mdmd\system\component\scriptslivedocs.mdmd.md" ".mdmd\layer-3\live-documentation-scripts.mdmd.md"`*

*Listed directory [layer-3](file:///d:/Projects/Live-Documentation/.mdmd/layer-3) *

*User accepted the command `type "AI-Agent-Workspace\tmp\system-cli-output\.mdmd\system\component\scriptslivedocs.mdmd.md"`*

*Checked command status*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*User accepted the command `npm run graph:audit -- --workspace .`*

*Viewed [link-relationship-rules.json](file:///d:/Projects/Live-Documentation/link-relationship-rules.json) *

*User accepted the command `npm run graph:audit`*

*Edited relevant file*

*Checked command status*

*Edited relevant file*

*User accepted the command `npm run graph:audit`*

*Checked command status*

*Edited relevant file*

*Viewed [implementation_plan.md](file:///C:/Users/User/.gemini/antigravity/brain/a040f9e7-b254-49e0-b13e-098b3caa76b9/implementation_plan.md) *

### User Input

continue

*Edited relevant file*

*User accepted the command `npm run graph:audit -- --workspace .`*

### User Input

```
(base) PS D:\Projects\Live-Documentation> npm run graph:audit -- --workspace .
npm error No workspaces found:
npm error   --workspace=.
npm error A complete log of this run can be found in: C:\Users\User\AppData\Local\npm-cache\_logs\2025-11-19T16_14_54_058Z-debug-0.log
(base) PS D:\Projects\Live-Documentation> 
```

*User accepted the command `npm run graph:audit`*

*Edited relevant file*

*Edited relevant file*

*Checked command status*

### User Input

How did our symbol coverage suddenly drop to 2%? What's going on there? 

*User accepted the command `npm run graph:audit`*

*Viewed [task.md](file:///C:/Users/User/.gemini/antigravity/brain/a040f9e7-b254-49e0-b13e-098b3caa76b9/task.md) *

*Checked command status*

*Edited relevant file*

*User accepted the command `git show HEAD:link-relationship-rules.json`*

*Checked command status*

*User accepted the command `npm run graph:audit > audit.log 2>&1`*

*User accepted the command `npm run graph:audit`*

*Checked command status*

*Checked command status*

### User Input

Your @[audit.log] appears to contain the full outputs. You appear to have been trying to check in the terminal before it was finished doing the audit. Graph audit takes ~15 seconds or so to execute.

*User accepted the command `type audit.log`*

*Checked command status*

*Viewed [task.md](file:///C:/Users/User/.gemini/antigravity/brain/a040f9e7-b254-49e0-b13e-098b3caa76b9/task.md) *

### User Input

What do you think with respect to the findings?

*Viewed [link-relationship-rules.json](file:///d:/Projects/Live-Documentation/link-relationship-rules.json) *

*User accepted the command `Select-String -Path audit.log -Pattern "Symbol Coverage" -Context 0,5`*

*User accepted the command `Select-String -Path audit.log -Pattern "Documentation Coverage" -Context 0,5`*

*Checked command status*

*Checked command status*

*Semantic searched codebase*

*Searched filesystem*

*User accepted the command `Select-String -Path audit.log -Pattern "acknowledgeDiagnostic.ts.mdmd.md" -Context 0,5`*

*Checked command status*

*Listed directory [commands](file:///d:/Projects/Live-Documentation/.mdmd/layer-4/packages/extension/src/commands) *

*Viewed [acknowledgeDiagnostic.ts.mdmd.md](file:///d:/Projects/Live-Documentation/.mdmd/layer-4/packages/extension/src/commands/acknowledgeDiagnostic.ts.mdmd.md) *

*User accepted the command `dir "AI-Agent-Workspace\tmp\system-cli-output\.mdmd\system\component"`*

*Checked command status*

*User accepted the command `type "AI-Agent-Workspace\tmp\system-cli-output\.mdmd\system\component\packagesserversrcfeatureslivedocs.mdmd.md"`*

*Checked command status*

### User Input

Yes please! Thank you!

*Listed directory [component](file:///d:/Projects/Live-Documentation/AI-Agent-Workspace/tmp/system-cli-output/.mdmd/system/component) *

*Edited relevant file*

*Viewed [liveDocumentationConfig.ts](file:///d:/Projects/Live-Documentation/packages/shared/src/config/liveDocumentationConfig.ts) *

*User accepted the command `copy "AI-Agent-Workspace\tmp\system-cli-output\.mdmd\system\component\packagesserversrcfeatureslivedocs.mdmd.md" ".mdmd\layer-3\live-documentation-server.mdmd.md"`*

*User accepted the command `copy "AI-Agent-Workspace\tmp\system-cli-output\.mdmd\system\component\packagessharedsrclivedocs.mdmd.md" ".mdmd\layer-3\live-documentation-shared-core.mdmd.md"`*

*User accepted the command `copy "AI-Agent-Workspace\tmp\system-cli-output\.mdmd\system\component\packagessharedsrclivedocsadapters.mdmd.md" ".mdmd\layer-3\live-documentation-shared-adapters.mdmd.md"`*

*User accepted the command `copy "AI-Agent-Workspace\tmp\system-cli-output\.mdmd\system\component\packagessharedsrclivedocsanalysis.mdmd.md" ".mdmd\layer-3\live-documentation-shared-analysis.mdmd.md"`*

*User accepted the command `copy "AI-Agent-Workspace\tmp\system-cli-output\.mdmd\system\component\packagessharedsrclivedocsheuristics.mdmd.md" ".mdmd\layer-3\live-documentation-shared-heuristics.mdmd.md"`*

*Viewed [live-documentation-server.mdmd.md](file:///d:/Projects/Live-Documentation/.mdmd/layer-3/live-documentation-server.mdmd.md) *

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Viewed [live-documentation-shared-core.mdmd.md](file:///d:/Projects/Live-Documentation/.mdmd/layer-3/live-documentation-shared-core.mdmd.md) *

*Viewed [live-documentation-shared-adapters.mdmd.md](file:///d:/Projects/Live-Documentation/.mdmd/layer-3/live-documentation-shared-adapters.mdmd.md) *

*Viewed [live-documentation-shared-analysis.mdmd.md](file:///d:/Projects/Live-Documentation/.mdmd/layer-3/live-documentation-shared-analysis.mdmd.md) *

*Viewed [live-documentation-shared-heuristics.mdmd.md](file:///d:/Projects/Live-Documentation/.mdmd/layer-3/live-documentation-shared-heuristics.mdmd.md) *

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Searched filesystem*

*Edited relevant file*

*User accepted the command `npm run graph:audit`*

*Checked command status*

*Checked command status*

*Edited relevant file*

*User accepted the command `Select-String -Path audit.log -Pattern "Symbol Coverage" -Context 0,5`*

*User accepted the command `Select-String -Path audit.log -Pattern "acknowledgeDiagnostic.ts.mdmd.md" -Context 0,5`*

*Checked command status*

*Checked command status*

### User Input

```
(base) PS D:\Projects\Live-Documentation> npm run graph:audit

> copilot-improvement-experiments@0.0.0 graph:audit
> tsx --tsconfig ./tsconfig.base.json scripts/graph-tools/audit-doc-coverage.ts

Graph coverage audit
  Total artifacts: 866
  Code artifacts: 305
  Documentation artifacts: 26

Symbol coverage preview:
  Documented exports: 12/798 (2% coverage)

Exports lacking MDMD symbol references:
  packages/extension
    - packages/extension/src/commands/acknowledgeDiagnostic.ts :: ACKNOWLEDGE_DIAGNOSTIC_COMMAND (variable)
    - packages/extension/src/commands/acknowledgeDiagnostic.ts :: AcknowledgementWorkflowOptions (interface)
    - packages/extension/src/commands/acknowledgeDiagnostic.ts :: registerAcknowledgementWorkflow (function)
    - packages/extension/src/commands/analyzeWithAI.ts :: registerAnalyzeWithAICommand (function)
    - packages/extension/src/commands/exportDiagnostics.ts :: EXPORT_DIAGNOSTICS_COMMAND (variable)
    - packages/extension/src/commands/exportDiagnostics.ts :: registerExportDiagnosticsCommand (function)
    - packages/extension/src/commands/inspectSymbolNeighbors.ts :: InspectSymbolNeighborsResultValidator (variable)
    - packages/extension/src/commands/inspectSymbolNeighbors.ts :: ParsedInspectSymbolNeighborsResult (type)
    - packages/extension/src/commands/inspectSymbolNeighbors.ts :: ParsedNeighborNode (type)
    - packages/extension/src/commands/inspectSymbolNeighbors.ts :: registerInspectSymbolNeighborsCommand (function)
    - packages/extension/src/commands/inspectSymbolNeighbors.ts :: SymbolNeighborQuickPickController (class)
    - packages/extension/src/commands/latencySummary.ts :: GET_LATENCY_SUMMARY_INTERNAL_COMMAND (variable)
    - packages/extension/src/commands/latencySummary.ts :: LATENCY_SUMMARY_COMMAND (variable)
    - packages/extension/src/commands/latencySummary.ts :: registerLatencyTelemetryCommands (function)
    - packages/extension/src/commands/overrideLink.ts :: registerOverrideLinkCommand (function)
    - packages/extension/src/diagnostics/dependencyQuickPick.ts :: DependencyQuickPickController (class)
    - packages/extension/src/diagnostics/dependencyQuickPick.ts :: describeEdgePath (function)
    - packages/extension/src/diagnostics/dependencyQuickPick.ts :: InspectDependenciesResultValidator (variable)
    - packages/extension/src/diagnostics/dependencyQuickPick.ts :: registerDependencyQuickPick (function)
    - packages/extension/src/diagnostics/docDiagnosticProvider.ts :: buildOpenActionTitle (function)
    - packages/extension/src/diagnostics/docDiagnosticProvider.ts :: buildRippleSummary (function)
    - packages/extension/src/diagnostics/docDiagnosticProvider.ts :: formatConfidenceLabel (function)
    - packages/extension/src/diagnostics/docDiagnosticProvider.ts :: OPEN_LINKED_ARTIFACT_COMMAND (variable)
    - packages/extension/src/diagnostics/docDiagnosticProvider.ts :: registerDocDiagnosticProvider (function)
    - packages/extension/src/diagnostics/docDiagnosticProvider.ts :: VIEW_RIPPLE_DETAILS_COMMAND (variable)
    - packages/extension/src/extension.ts :: activate (function)
    - packages/extension/src/extension.ts :: deactivate (function)
    - packages/extension/src/onboarding/providerGate.ts :: ensureProviderSelection (function)
    - packages/extension/src/prompts/rebindPrompt.ts :: showRebindPrompt (function)
    - packages/extension/src/services/llmInvoker.ts :: InvokeChatOptions (interface)
    - packages/extension/src/services/llmInvoker.ts :: InvokeChatResult (interface)
    - packages/extension/src/services/llmInvoker.ts :: LlmInvocationError (class)
    - packages/extension/src/services/llmInvoker.ts :: LlmInvocationFailureReason (type)
    - packages/extension/src/services/llmInvoker.ts :: LlmInvoker (class)
    - packages/extension/src/services/llmInvoker.ts :: LlmProviderMode (type)
    - packages/extension/src/services/localOllamaBridge.ts :: invokeLocalOllamaBridge (function)
    - packages/extension/src/services/symbolBridge.ts :: registerSymbolBridge (function)
    - packages/extension/src/services/symbolBridge.ts :: SymbolBridgeAnalyzer (class)
    - packages/extension/src/settings/configService.ts :: ConfigService (class)
    - packages/extension/src/settings/configService.ts :: LinkDiagnosticsSettings (interface)
    - packages/extension/src/shared/artifactSchemas.ts :: ArtifactLayer (type)
    - packages/extension/src/shared/artifactSchemas.ts :: ArtifactLayerSchema (variable)
    - packages/extension/src/shared/artifactSchemas.ts :: KnowledgeArtifact (type)
    - packages/extension/src/shared/artifactSchemas.ts :: KnowledgeArtifactSchema (variable)
    - packages/extension/src/shared/artifactSchemas.ts :: LinkRelationshipKind (type)
    - packages/extension/src/shared/artifactSchemas.ts :: LinkRelationshipKindSchema (variable)
    - packages/extension/src/testing/testHooks.ts :: resolveWindowApis (function)
    - packages/extension/src/testUtils/vscodeMock.ts :: createVscodeMock (function)
    - packages/extension/src/testUtils/vscodeMock.ts :: getSharedVscodeMock (function)
    - packages/extension/src/testUtils/vscodeMock.ts :: resetSharedVscodeMock (function)
    - packages/extension/src/testUtils/vscodeMock.ts :: SharedVscodeMock (interface)
    - packages/extension/src/views/diagnosticsTree.ts :: buildTreeAcknowledgementArgs (function)
    - packages/extension/src/views/diagnosticsTree.ts :: DiagnosticsTreeDataProvider (class)
    - packages/extension/src/views/diagnosticsTree.ts :: DiagnosticsTreeRegistration (interface)
    - packages/extension/src/views/diagnosticsTree.ts :: isDiagnosticNode (function)
    - packages/extension/src/views/diagnosticsTree.ts :: registerDiagnosticsTreeView (function)
    - packages/extension/src/views/diagnosticsTree.ts :: TreeNode (type)
    - packages/extension/src/watchers/fileMaintenance.ts :: registerFileMaintenanceWatcher (function)
  packages/server
    - packages/server/src/features/changeEvents/changeQueue.ts :: ChangeQueue (class)
    - packages/server/src/features/changeEvents/changeQueue.ts :: QueuedChange (interface)
    - packages/server/src/features/changeEvents/saveCodeChange.ts :: PersistedCodeChange (interface)
    - packages/server/src/features/changeEvents/saveCodeChange.ts :: saveCodeChange (function)
    - packages/server/src/features/changeEvents/saveCodeChange.ts :: SaveCodeChangeOptions (interface)
    - packages/server/src/features/changeEvents/saveDocumentChange.ts :: PersistedDocumentChange (interface)
    - packages/server/src/features/changeEvents/saveDocumentChange.ts :: persistInferenceResult (function)
    - packages/server/src/features/changeEvents/saveDocumentChange.ts :: saveDocumentChange (function)
    - packages/server/src/features/changeEvents/saveDocumentChange.ts :: SaveDocumentChangeOptions (interface)
    - packages/server/src/features/dependencies/buildCodeGraph.ts :: BuildCodeGraphOptions (interface)
    - packages/server/src/features/dependencies/buildCodeGraph.ts :: buildCodeImpactGraph (function)
    - packages/server/src/features/dependencies/buildCodeGraph.ts :: CodeImpactEdge (interface)
    - packages/server/src/features/dependencies/inspectDependencies.ts :: inspectDependencies (function)
    - packages/server/src/features/dependencies/inspectDependencies.ts :: InspectDependenciesOptions (interface)
    - packages/server/src/features/dependencies/symbolNeighbors.ts :: inspectSymbolNeighbors (function)
    - packages/server/src/features/dependencies/symbolNeighbors.ts :: InspectSymbolNeighborsOptions (interface)
    - packages/server/src/features/diagnostics/acknowledgementService.ts :: AcknowledgeDiagnosticInput (interface)
    - packages/server/src/features/diagnostics/acknowledgementService.ts :: AcknowledgementService (class)
    - packages/server/src/features/diagnostics/acknowledgementService.ts :: AcknowledgementServiceOptions (interface)
    - packages/server/src/features/diagnostics/acknowledgementService.ts :: AcknowledgeOutcome (type)
    - packages/server/src/features/diagnostics/acknowledgementService.ts :: RegisterDiagnosticEmissionInput (interface)
    - packages/server/src/features/diagnostics/acknowledgementService.ts :: ShouldEmitDiagnosticInput (interface)
    - packages/server/src/features/diagnostics/diagnosticPublisher.ts :: DiagnosticPublisher (class)
    - packages/server/src/features/diagnostics/diagnosticUtils.ts :: DiagnosticSender (interface)
    - packages/server/src/features/diagnostics/diagnosticUtils.ts :: normaliseDisplayPath (function)
    - packages/server/src/features/diagnostics/hysteresisController.ts :: HysteresisController (class)
    - packages/server/src/features/diagnostics/hysteresisController.ts :: HysteresisControllerOptions (interface)
    - packages/server/src/features/diagnostics/listOutstandingDiagnostics.ts :: buildOutstandingDiagnosticsResult (function)
    - packages/server/src/features/diagnostics/listOutstandingDiagnostics.ts :: mapOutstandingDiagnostic (function)
    - packages/server/src/features/diagnostics/noiseFilter.ts :: applyNoiseFilter (function)
    - packages/server/src/features/diagnostics/noiseFilter.ts :: NoiseFilterResult (interface)
    - packages/server/src/features/diagnostics/noiseFilter.ts :: NoiseFilterTotals (interface)
    - packages/server/src/features/diagnostics/noiseFilter.ts :: ZERO_NOISE_FILTER_TOTALS (variable)
    - packages/server/src/features/diagnostics/publishCodeDiagnostics.ts :: CodeChangeContext (interface)
    - packages/server/src/features/diagnostics/publishCodeDiagnostics.ts :: publishCodeDiagnostics (function)
    - packages/server/src/features/diagnostics/publishCodeDiagnostics.ts :: PublishCodeDiagnosticsOptions (interface)
    - packages/server/src/features/diagnostics/publishCodeDiagnostics.ts :: PublishCodeDiagnosticsResult (interface)
    - packages/server/src/features/diagnostics/publishDocDiagnostics.ts :: DocumentChangeContext (interface)
    - packages/server/src/features/diagnostics/publishDocDiagnostics.ts :: publishDocDiagnostics (function)
    - packages/server/src/features/diagnostics/publishDocDiagnostics.ts :: PublishDocDiagnosticsOptions (interface)
    - packages/server/src/features/diagnostics/publishDocDiagnostics.ts :: PublishDocDiagnosticsResult (interface)
    - packages/server/src/features/diagnostics/rippleTypes.ts :: RippleHint (type)
    - packages/server/src/features/diagnostics/rippleTypes.ts :: RippleImpact (interface)
    - packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts :: generateSymbolCorrectnessDiagnostics (function)
    - packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts :: SymbolCorrectnessDiagnosticOptions (interface)
    - packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts :: SymbolCorrectnessReport (interface)
    - packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts :: SymbolProfileSummary (interface)
    - packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts :: SymbolProfileViolation (interface)
    - packages/server/src/features/knowledge/feedCheckpointStore.ts :: FeedCheckpointStore (interface)
    - packages/server/src/features/knowledge/feedCheckpointStore.ts :: FileFeedCheckpointStore (class)
    - packages/server/src/features/knowledge/feedDiagnosticsGateway.ts :: FeedDiagnosticsGateway (class)
    - packages/server/src/features/knowledge/feedDiagnosticsGateway.ts :: FeedDiagnosticsGatewayOptions (interface)
    - packages/server/src/features/knowledge/feedDiagnosticsGateway.ts :: FeedHealthStatus (type)
    - packages/server/src/features/knowledge/feedDiagnosticsGateway.ts :: FeedStatusSummary (interface)
    - packages/server/src/features/knowledge/feedFormatDetector.ts :: detectFormat (function)
    - packages/server/src/features/knowledge/feedFormatDetector.ts :: FeedFormat (type)
    - packages/server/src/features/knowledge/feedFormatDetector.ts :: FormatDetectionResult (interface)
    - packages/server/src/features/knowledge/feedFormatDetector.ts :: parseFeedFile (function)
    - packages/server/src/features/knowledge/feedFormatDetector.ts :: ParseFeedFileOptions (interface)
    - packages/server/src/features/knowledge/knowledgeFeedManager.ts :: BackoffOptions (interface)
    - packages/server/src/features/knowledge/knowledgeFeedManager.ts :: Disposable (interface)
    - packages/server/src/features/knowledge/knowledgeFeedManager.ts :: FeedConfiguration (interface)
    - packages/server/src/features/knowledge/knowledgeFeedManager.ts :: FeedSnapshotSource (interface)
    - packages/server/src/features/knowledge/knowledgeFeedManager.ts :: FeedStreamSource (interface)
    - packages/server/src/features/knowledge/knowledgeFeedManager.ts :: KnowledgeFeedManager (class)
    - packages/server/src/features/knowledge/knowledgeFeedManager.ts :: KnowledgeFeedManagerLogger (interface)
    - packages/server/src/features/knowledge/knowledgeFeedManager.ts :: KnowledgeFeedManagerOptions (interface)
    - packages/server/src/features/knowledge/knowledgeGraphBridge.ts :: KnowledgeGraphBridgeDisposable (interface)
    - packages/server/src/features/knowledge/knowledgeGraphBridge.ts :: KnowledgeGraphBridgeLogger (interface)
    - packages/server/src/features/knowledge/knowledgeGraphBridge.ts :: KnowledgeGraphBridgeService (class)
    - packages/server/src/features/knowledge/knowledgeGraphBridge.ts :: KnowledgeGraphBridgeServiceOptions (interface)
    - packages/server/src/features/knowledge/knowledgeGraphBridge.ts :: KnowledgeGraphBridgeStartResult (interface)
    - packages/server/src/features/knowledge/knowledgeGraphIngestor.ts :: KnowledgeGraphIngestor (class)
    - packages/server/src/features/knowledge/knowledgeGraphIngestor.ts :: KnowledgeGraphIngestorLogger (interface)
    - packages/server/src/features/knowledge/knowledgeGraphIngestor.ts :: KnowledgeGraphIngestorOptions (interface)
    - packages/server/src/features/knowledge/knowledgeGraphIngestor.ts :: SnapshotIngestResult (interface)
    - packages/server/src/features/knowledge/knowledgeGraphIngestor.ts :: StreamIngestResult (interface)
    - packages/server/src/features/knowledge/llmIngestionOrchestrator.ts :: EnqueueOptions (interface)
    - packages/server/src/features/knowledge/llmIngestionOrchestrator.ts :: LlmIngestionLogger (interface)
    - packages/server/src/features/knowledge/llmIngestionOrchestrator.ts :: LlmIngestionOrchestrator (class)
    - packages/server/src/features/knowledge/llmIngestionOrchestrator.ts :: LlmIngestionOrchestratorOptions (interface)
    - packages/server/src/features/knowledge/llmIngestionOrchestrator.ts :: LlmIngestionResult (interface)
    - packages/server/src/features/knowledge/lsifParser.ts :: LSIFParser (class)
    - packages/server/src/features/knowledge/lsifParser.ts :: LSIFParserOptions (interface)
    - packages/server/src/features/knowledge/lsifParser.ts :: parseLSIF (function)
    - packages/server/src/features/knowledge/rippleAnalyzer.ts :: RippleAnalysisRequest (interface)
    - packages/server/src/features/knowledge/rippleAnalyzer.ts :: RippleAnalyzer (class)
    - packages/server/src/features/knowledge/rippleAnalyzer.ts :: RippleAnalyzerLogger (interface)
    - packages/server/src/features/knowledge/rippleAnalyzer.ts :: RippleAnalyzerOptions (interface)
    - packages/server/src/features/knowledge/rippleAnalyzer.ts :: RippleHint (type)
    - packages/server/src/features/knowledge/schemaValidator.ts :: assertValidSnapshot (function)
    - packages/server/src/features/knowledge/schemaValidator.ts :: assertValidStreamEvent (function)
    - packages/server/src/features/knowledge/schemaValidator.ts :: SchemaValidationResult (interface)
    - packages/server/src/features/knowledge/schemaValidator.ts :: SchemaViolation (interface)
    - packages/server/src/features/knowledge/schemaValidator.ts :: validateSnapshot (function)
    - packages/server/src/features/knowledge/schemaValidator.ts :: validateStreamEvent (function)
    - packages/server/src/features/knowledge/scipParser.ts :: parseSCIP (function)
    - packages/server/src/features/knowledge/scipParser.ts :: SCIPParser (class)
    - packages/server/src/features/knowledge/scipParser.ts :: SCIPParserOptions (interface)
    - packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts :: createStaticFeedWorkspaceProvider (function)
    - packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts :: StaticFeedWorkspaceProviderOptions (interface)
    - packages/server/src/features/knowledge/symbolBridgeProvider.ts :: createSymbolBridgeProvider (function)
    - packages/server/src/features/knowledge/workspaceIndexProvider.ts :: createWorkspaceIndexProvider (function)
    - packages/server/src/features/knowledge/workspaceIndexProvider.ts :: DEFAULT_CODE_EXTENSIONS (variable)
    - packages/server/src/features/knowledge/workspaceIndexProvider.ts :: DEFAULT_DOC_EXTENSIONS (variable)
    - packages/server/src/features/knowledge/workspaceIndexProvider.ts :: DocumentSymbolReferenceMetadata (interface)
    - packages/server/src/features/knowledge/workspaceIndexProvider.ts :: ExportedSymbolKind (type)
    - packages/server/src/features/knowledge/workspaceIndexProvider.ts :: ExportedSymbolMetadata (interface)
    - packages/server/src/features/live-docs/evidenceBridge.ts :: CoverageRatio (interface)
    - packages/server/src/features/live-docs/evidenceBridge.ts :: CoverageSummary (interface)
    - packages/server/src/features/live-docs/evidenceBridge.ts :: EvidenceKind (type)
    - packages/server/src/features/live-docs/evidenceBridge.ts :: EvidenceSnapshot (interface)
    - packages/server/src/features/live-docs/evidenceBridge.ts :: ImplementationEvidenceItem (interface)
    - packages/server/src/features/live-docs/evidenceBridge.ts :: loadEvidenceSnapshot (function)
    - packages/server/src/features/live-docs/evidenceBridge.ts :: TestEvidenceItem (interface)
    - packages/server/src/features/live-docs/generator.ts :: __testUtils (variable)
    - packages/server/src/features/live-docs/generator.ts :: generateLiveDocs (function)
    - packages/server/src/features/live-docs/generator.ts :: LiveDocGeneratorResult (interface)
    - packages/server/src/features/live-docs/generator.ts :: withDefaultConfig (function)
    - packages/server/src/features/live-docs/harness/headlessHarness.ts :: HeadlessHarnessLogger (interface)
    - packages/server/src/features/live-docs/harness/headlessHarness.ts :: HeadlessHarnessRunOptions (interface)
    - packages/server/src/features/live-docs/harness/headlessHarness.ts :: HeadlessHarnessRunResult (interface)
    - packages/server/src/features/live-docs/harness/headlessHarness.ts :: runHeadlessHarness (function)
    - packages/server/src/features/live-docs/harness/scenarios.ts :: getScenarioByName (function)
    - packages/server/src/features/live-docs/harness/scenarios.ts :: HEADLESS_HARNESS_SCENARIOS (variable)
    - packages/server/src/features/live-docs/harness/scenarios.ts :: HeadlessHarnessScenario (interface)
    - packages/server/src/features/live-docs/harness/scenarios.ts :: listScenarios (function)
    - packages/server/src/features/live-docs/stage0/docLoader.ts :: loadStage0Docs (function)
    - packages/server/src/features/live-docs/system/generator.ts :: GeneratedSystemDocument (interface)
    - packages/server/src/features/live-docs/system/generator.ts :: generateSystemLiveDocs (function)
    - packages/server/src/features/live-docs/system/generator.ts :: GenerateSystemLiveDocsOptions (interface)
    - packages/server/src/features/live-docs/system/generator.ts :: SystemLiveDocGeneratorResult (interface)
    - packages/server/src/features/live-docs/system/generator.ts :: SystemLiveDocWriteRecord (interface)
    - packages/server/src/features/live-docs/targets/manifest.ts :: loadTargetManifest (function)
    - packages/server/src/features/maintenance/removeOrphans.ts :: handleArtifactDeleted (function)
    - packages/server/src/features/maintenance/removeOrphans.ts :: handleArtifactRenamed (function)
    - packages/server/src/features/overrides/overrideLink.ts :: applyOverrideLink (function)
    - packages/server/src/features/settings/providerGuard.ts :: ExtensionSettings (interface)
    - packages/server/src/features/settings/providerGuard.ts :: ProviderGuard (class)
    - packages/server/src/features/settings/providerGuard.ts :: RippleExtensionSettings (interface)
    - packages/server/src/features/settings/settingsBridge.ts :: DEFAULT_RUNTIME_SETTINGS (variable)
    - packages/server/src/features/settings/settingsBridge.ts :: deriveRuntimeSettings (function)
    - packages/server/src/features/settings/settingsBridge.ts :: NoiseFilterRuntimeConfig (interface)
    - packages/server/src/features/settings/settingsBridge.ts :: NoiseSuppressionLevel (type)
    - packages/server/src/features/settings/settingsBridge.ts :: NoiseSuppressionRuntime (interface)
    - packages/server/src/features/settings/settingsBridge.ts :: RippleRuntimeSettings (interface)
    - packages/server/src/features/settings/settingsBridge.ts :: RuntimeSettings (interface)
    - packages/server/src/features/watchers/artifactWatcher.ts :: ArtifactCategory (type)
    - packages/server/src/features/watchers/artifactWatcher.ts :: ArtifactWatcher (class)
    - packages/server/src/features/watchers/artifactWatcher.ts :: ArtifactWatcherLogger (interface)
    - packages/server/src/features/watchers/artifactWatcher.ts :: ArtifactWatcherOptions (interface)
    - packages/server/src/features/watchers/artifactWatcher.ts :: ArtifactWatcherResult (interface)
    - packages/server/src/features/watchers/artifactWatcher.ts :: CodeTrackedArtifactChange (type)
    - packages/server/src/features/watchers/artifactWatcher.ts :: DocumentStore (interface)
    - packages/server/src/features/watchers/artifactWatcher.ts :: DocumentTrackedArtifactChange (type)
    - packages/server/src/features/watchers/artifactWatcher.ts :: SkippedArtifactChange (interface)
    - packages/server/src/features/watchers/artifactWatcher.ts :: TrackedArtifactChange (interface)
    - packages/server/src/features/watchers/pathReferenceDetector.ts :: ArtifactCategory (type)
    - packages/server/src/features/watchers/pathReferenceDetector.ts :: buildFileReferenceHints (function)
    - packages/server/src/features/watchers/pathReferenceDetector.ts :: PathReferenceOrigin (type)
    - packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts :: ConfidenceLabel (type)
    - packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts :: PromptArtifactSummary (interface)
    - packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts :: PromptChunkSummary (interface)
    - packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts :: RELATIONSHIP_RESPONSE_SCHEMA (variable)
    - packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts :: RelationshipPromptOptions (interface)
    - packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts :: RenderedRelationshipPrompt (interface)
    - packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts :: renderRelationshipExtractionPrompt (function)
    - packages/server/src/runtime/changeProcessor.ts :: ChangeProcessor (interface)
    - packages/server/src/runtime/changeProcessor.ts :: ChangeProcessorContext (interface)
    - packages/server/src/runtime/changeProcessor.ts :: ChangeProcessorOptions (interface)
    - packages/server/src/runtime/changeProcessor.ts :: createChangeProcessor (function)
    - packages/server/src/runtime/environment.ts :: describeError (function)
    - packages/server/src/runtime/environment.ts :: ensureDirectory (function)
    - packages/server/src/runtime/environment.ts :: fileUriToPath (function)
    - packages/server/src/runtime/environment.ts :: resolveDatabasePath (function)
    - packages/server/src/runtime/environment.ts :: resolveWorkspaceRoot (function)
    - packages/server/src/runtime/knowledgeFeeds.ts :: KnowledgeFeedController (class)
    - packages/server/src/runtime/knowledgeFeeds.ts :: KnowledgeFeedControllerOptions (interface)
    - packages/server/src/runtime/knowledgeFeeds.ts :: KnowledgeFeedInitializeParams (interface)
    - packages/server/src/runtime/llmIngestion.ts :: createDefaultRelationshipExtractor (function)
    - packages/server/src/runtime/llmIngestion.ts :: CreateRelationshipExtractorOptions (interface)
    - packages/server/src/runtime/llmIngestion.ts :: LlmIngestionManager (class)
    - packages/server/src/runtime/llmIngestion.ts :: LlmIngestionManagerOptions (interface)
    - packages/server/src/runtime/settings.ts :: extractExtensionSettings (function)
    - packages/server/src/runtime/settings.ts :: extractTestModeOverrides (function)
    - packages/server/src/runtime/settings.ts :: mergeExtensionSettings (function)
    - packages/server/src/telemetry/driftHistoryStore.ts :: DriftHistoryStore (class)
    - packages/server/src/telemetry/driftHistoryStore.ts :: DriftHistoryStoreOptions (interface)
    - packages/server/src/telemetry/driftHistoryStore.ts :: RecordDriftAcknowledgementParams (interface)
    - packages/server/src/telemetry/driftHistoryStore.ts :: RecordDriftEmissionParams (type)
    - packages/server/src/telemetry/latencyTracker.ts :: LatencyTracker (class)
    - packages/server/src/telemetry/latencyTracker.ts :: LatencyTrackerOptions (interface)
  packages/shared
    - packages/shared/src/config/liveDocumentationConfig.ts :: DEFAULT_LIVE_DOCUMENTATION_CONFIG (variable)
    - packages/shared/src/config/liveDocumentationConfig.ts :: LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER (variable)
    - packages/shared/src/config/liveDocumentationConfig.ts :: LIVE_DOCUMENTATION_DEFAULT_GLOBS (variable)
    - packages/shared/src/config/liveDocumentationConfig.ts :: LIVE_DOCUMENTATION_DEFAULT_ROOT (variable)
    - packages/shared/src/config/liveDocumentationConfig.ts :: LIVE_DOCUMENTATION_FILE_EXTENSION (variable)
    - packages/shared/src/config/liveDocumentationConfig.ts :: LiveDocumentationArchetype (type)
    - packages/shared/src/config/liveDocumentationConfig.ts :: LiveDocumentationConfig (interface)
    - packages/shared/src/config/liveDocumentationConfig.ts :: LiveDocumentationConfigInput (type)
    - packages/shared/src/config/liveDocumentationConfig.ts :: LiveDocumentationEvidenceConfig (interface)
    - packages/shared/src/config/liveDocumentationConfig.ts :: LiveDocumentationEvidenceStrictMode (type)
    - packages/shared/src/config/liveDocumentationConfig.ts :: LiveDocumentationSlugDialect (type)
    - packages/shared/src/config/liveDocumentationConfig.ts :: normalizeLiveDocumentationConfig (function)
    - packages/shared/src/contracts/dependencies.ts :: DependencyGraphEdge (interface)
    - packages/shared/src/contracts/dependencies.ts :: INSPECT_DEPENDENCIES_REQUEST (variable)
    - packages/shared/src/contracts/dependencies.ts :: InspectDependenciesParams (interface)
    - packages/shared/src/contracts/dependencies.ts :: InspectDependenciesResult (interface)
    - packages/shared/src/contracts/dependencies.ts :: InspectDependenciesSummary (interface)
    - packages/shared/src/contracts/diagnostics.ts :: ACKNOWLEDGE_DIAGNOSTIC_REQUEST (variable)
    - packages/shared/src/contracts/diagnostics.ts :: AcknowledgeDiagnosticParams (interface)
    - packages/shared/src/contracts/diagnostics.ts :: AcknowledgeDiagnosticResult (interface)
    - packages/shared/src/contracts/diagnostics.ts :: AcknowledgeDiagnosticStatus (type)
    - packages/shared/src/contracts/diagnostics.ts :: DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION (variable)
    - packages/shared/src/contracts/diagnostics.ts :: DiagnosticAcknowledgedPayload (interface)
    - packages/shared/src/contracts/diagnostics.ts :: DiagnosticArtifactSummary (interface)
    - packages/shared/src/contracts/diagnostics.ts :: EXPORT_DIAGNOSTICS_REQUEST (variable)
    - packages/shared/src/contracts/diagnostics.ts :: ExportDiagnosticsResult (interface)
    - packages/shared/src/contracts/diagnostics.ts :: FEEDS_READY_REQUEST (variable)
    - packages/shared/src/contracts/diagnostics.ts :: FeedsReadyResult (interface)
    - packages/shared/src/contracts/diagnostics.ts :: LIST_OUTSTANDING_DIAGNOSTICS_REQUEST (variable)
    - packages/shared/src/contracts/diagnostics.ts :: ListOutstandingDiagnosticsResult (interface)
    - packages/shared/src/contracts/diagnostics.ts :: OutstandingDiagnosticSummary (interface)
    - packages/shared/src/contracts/diagnostics.ts :: RESET_DIAGNOSTIC_STATE_NOTIFICATION (variable)
    - packages/shared/src/contracts/diagnostics.ts :: SET_DIAGNOSTIC_ASSESSMENT_REQUEST (variable)
    - packages/shared/src/contracts/diagnostics.ts :: SetDiagnosticAssessmentParams (interface)
    - packages/shared/src/contracts/diagnostics.ts :: SetDiagnosticAssessmentResult (interface)
    - packages/shared/src/contracts/llm.ts :: INVOKE_LLM_REQUEST (variable)
    - packages/shared/src/contracts/llm.ts :: InvokeLlmRequest (interface)
    - packages/shared/src/contracts/llm.ts :: InvokeLlmResult (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFContainsEdge (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFDefinitionEdge (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFDefinitionResult (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFDocument (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFEdge (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFEdgeLabel (type)
    - packages/shared/src/contracts/lsif.ts :: LSIFElement (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFEntry (type)
    - packages/shared/src/contracts/lsif.ts :: LSIFItemEdge (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFMetaData (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFNextEdge (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFProject (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFRange (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFReferenceResult (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFReferencesEdge (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFResultSet (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFVertex (interface)
    - packages/shared/src/contracts/lsif.ts :: LSIFVertexLabel (type)
    - packages/shared/src/contracts/lsif.ts :: ParsedLSIFIndex (interface)
    - packages/shared/src/contracts/maintenance.ts :: RebindImpactedArtifact (interface)
    - packages/shared/src/contracts/maintenance.ts :: RebindReason (type)
    - packages/shared/src/contracts/maintenance.ts :: RebindRequiredArtifact (interface)
    - packages/shared/src/contracts/maintenance.ts :: RebindRequiredPayload (interface)
    - packages/shared/src/contracts/overrides.ts :: LinkOverrideReason (type)
    - packages/shared/src/contracts/overrides.ts :: OVERRIDE_LINK_REQUEST (variable)
    - packages/shared/src/contracts/overrides.ts :: OverrideLinkArtifactInput (interface)
    - packages/shared/src/contracts/overrides.ts :: OverrideLinkRequest (interface)
    - packages/shared/src/contracts/overrides.ts :: OverrideLinkResponse (interface)
    - packages/shared/src/contracts/scip.ts :: ParsedSCIPIndex (interface)
    - packages/shared/src/contracts/scip.ts :: SCIPDiagnostic (interface)
    - packages/shared/src/contracts/scip.ts :: SCIPDocument (interface)
    - packages/shared/src/contracts/scip.ts :: SCIPIndex (interface)
    - packages/shared/src/contracts/scip.ts :: SCIPMetadata (interface)
    - packages/shared/src/contracts/scip.ts :: SCIPOccurrence (interface)
    - packages/shared/src/contracts/scip.ts :: SCIPRelationship (interface)
    - packages/shared/src/contracts/scip.ts :: SCIPSignature (interface)
    - packages/shared/src/contracts/scip.ts :: SCIPSymbolInformation (interface)
    - packages/shared/src/contracts/scip.ts :: SCIPSymbolKind (enum)
    - packages/shared/src/contracts/scip.ts :: SCIPSymbolRole (enum)
    - packages/shared/src/contracts/scip.ts :: SCIPToolInfo (interface)
    - packages/shared/src/contracts/symbols.ts :: COLLECT_WORKSPACE_SYMBOLS_REQUEST (variable)
    - packages/shared/src/contracts/symbols.ts :: CollectWorkspaceSymbolsParams (interface)
    - packages/shared/src/contracts/symbols.ts :: CollectWorkspaceSymbolsResult (interface)
    - packages/shared/src/contracts/symbols.ts :: CollectWorkspaceSymbolsResultSummary (interface)
    - packages/shared/src/contracts/symbols.ts :: INSPECT_SYMBOL_NEIGHBORS_REQUEST (variable)
    - packages/shared/src/contracts/symbols.ts :: InspectSymbolNeighborsParams (interface)
    - packages/shared/src/contracts/symbols.ts :: InspectSymbolNeighborsResult (interface)
    - packages/shared/src/contracts/symbols.ts :: InspectSymbolNeighborsSummary (interface)
    - packages/shared/src/contracts/symbols.ts :: SymbolNeighborGroup (interface)
    - packages/shared/src/contracts/symbols.ts :: SymbolNeighborNode (interface)
    - packages/shared/src/contracts/symbols.ts :: SymbolNeighborPath (interface)
    - packages/shared/src/contracts/telemetry.ts :: LATENCY_SUMMARY_REQUEST (variable)
    - packages/shared/src/contracts/telemetry.ts :: LatencyChangeKind (type)
    - packages/shared/src/contracts/telemetry.ts :: LatencySample (interface)
    - packages/shared/src/contracts/telemetry.ts :: LatencySummary (interface)
    - packages/shared/src/contracts/telemetry.ts :: LatencySummaryRequest (interface)
    - packages/shared/src/contracts/telemetry.ts :: LatencySummaryResponse (interface)
    - packages/shared/src/db/graphStore.ts :: DriftHistorySummary (interface)
    - packages/shared/src/db/graphStore.ts :: GraphStore (class)
    - packages/shared/src/db/graphStore.ts :: GraphStoreOptions (interface)
    - packages/shared/src/db/graphStore.ts :: LinkedArtifactSummary (interface)
    - packages/shared/src/db/graphStore.ts :: ListDriftHistoryOptions (interface)
    - packages/shared/src/domain/artifacts.ts :: AcknowledgementAction (interface)
    - packages/shared/src/domain/artifacts.ts :: AcknowledgementActionType (type)
    - packages/shared/src/domain/artifacts.ts :: ArtifactLayer (type)
    - packages/shared/src/domain/artifacts.ts :: ChangeEvent (interface)
    - packages/shared/src/domain/artifacts.ts :: ChangeEventProvenance (type)
    - packages/shared/src/domain/artifacts.ts :: ChangeEventRange (interface)
    - packages/shared/src/domain/artifacts.ts :: ChangeEventType (type)
    - packages/shared/src/domain/artifacts.ts :: DiagnosticRecord (interface)
    - packages/shared/src/domain/artifacts.ts :: DiagnosticSeverity (type)
    - packages/shared/src/domain/artifacts.ts :: DiagnosticStatus (type)
    - packages/shared/src/domain/artifacts.ts :: DriftHistoryEntry (interface)
    - packages/shared/src/domain/artifacts.ts :: DriftHistoryStatus (type)
    - packages/shared/src/domain/artifacts.ts :: KnowledgeArtifact (interface)
    - packages/shared/src/domain/artifacts.ts :: KnowledgeSnapshot (interface)
    - packages/shared/src/domain/artifacts.ts :: LinkRelationship (interface)
    - packages/shared/src/domain/artifacts.ts :: LinkRelationshipKind (type)
    - packages/shared/src/domain/artifacts.ts :: LlmAssessment (interface)
    - packages/shared/src/domain/artifacts.ts :: LlmConfidenceTier (type)
    - packages/shared/src/domain/artifacts.ts :: LlmEdgeProvenance (interface)
    - packages/shared/src/domain/artifacts.ts :: LlmModelMetadata (interface)
    - packages/shared/src/inference/fallbackHeuristicTypes.ts :: FallbackHeuristic (interface)
    - packages/shared/src/inference/fallbackHeuristicTypes.ts :: HeuristicArtifact (interface)
    - packages/shared/src/inference/fallbackHeuristicTypes.ts :: MatchCandidate (interface)
    - packages/shared/src/inference/fallbackHeuristicTypes.ts :: MatchContext (type)
    - packages/shared/src/inference/fallbackHeuristicTypes.ts :: MatchEmitter (type)
    - packages/shared/src/inference/fallbackInference.ts :: ArtifactSeed (interface)
    - packages/shared/src/inference/fallbackInference.ts :: FallbackGraphInput (interface)
    - packages/shared/src/inference/fallbackInference.ts :: FallbackGraphOptions (interface)
    - packages/shared/src/inference/fallbackInference.ts :: FallbackInferenceResult (interface)
    - packages/shared/src/inference/fallbackInference.ts :: FallbackLLMBridge (interface)
    - packages/shared/src/inference/fallbackInference.ts :: InferenceTraceEntry (interface)
    - packages/shared/src/inference/fallbackInference.ts :: InferenceTraceOrigin (type)
    - packages/shared/src/inference/fallbackInference.ts :: inferFallbackGraph (function)
    - packages/shared/src/inference/fallbackInference.ts :: LLMRelationshipRequest (interface)
    - packages/shared/src/inference/fallbackInference.ts :: LLMRelationshipSuggestion (interface)
    - packages/shared/src/inference/fallbackInference.ts :: RelationshipHint (interface)
    - packages/shared/src/inference/heuristics/artifactLayerUtils.ts :: isImplementationLayer (function)
    - packages/shared/src/inference/heuristics/index.ts :: createDefaultHeuristics (function)
    - packages/shared/src/inference/heuristics/referenceResolver.ts :: ReferenceResolution (interface)
    - packages/shared/src/inference/heuristics/referenceResolver.ts :: resolveIncludeReference (function)
    - packages/shared/src/inference/heuristics/shared.ts :: buildReferenceVariants (function)
    - packages/shared/src/inference/heuristics/shared.ts :: cleanupReference (function)
    - packages/shared/src/inference/heuristics/shared.ts :: computeReferenceStart (function)
    - packages/shared/src/inference/heuristics/shared.ts :: evaluateVariantMatch (function)
    - packages/shared/src/inference/heuristics/shared.ts :: isExternalLink (function)
    - packages/shared/src/inference/heuristics/shared.ts :: isWithinComment (function)
    - packages/shared/src/inference/heuristics/shared.ts :: normalizePath (function)
    - packages/shared/src/inference/heuristics/shared.ts :: stem (function)
    - packages/shared/src/inference/heuristics/shared.ts :: toComparablePath (function)
    - packages/shared/src/inference/heuristics/shared.ts :: VariantMatchScore (interface)
    - packages/shared/src/inference/linkInference.ts :: KnowledgeFeed (interface)
    - packages/shared/src/inference/linkInference.ts :: KnowledgeFeedSnapshotSource (interface)
    - packages/shared/src/inference/linkInference.ts :: KnowledgeFeedStreamSource (interface)
    - packages/shared/src/inference/linkInference.ts :: KnowledgeFeedSummary (interface)
    - packages/shared/src/inference/linkInference.ts :: LinkEvidence (interface)
    - packages/shared/src/inference/linkInference.ts :: LinkInferenceError (interface)
    - packages/shared/src/inference/linkInference.ts :: LinkInferenceOrchestrator (class)
    - packages/shared/src/inference/linkInference.ts :: LinkInferenceRunInput (interface)
    - packages/shared/src/inference/linkInference.ts :: LinkInferenceRunResult (interface)
    - packages/shared/src/inference/linkInference.ts :: LinkInferenceTraceEntry (interface)
    - packages/shared/src/inference/linkInference.ts :: LinkInferenceTraceOrigin (type)
    - packages/shared/src/inference/linkInference.ts :: WorkspaceLinkContribution (interface)
    - packages/shared/src/inference/linkInference.ts :: WorkspaceLinkProvider (interface)
    - packages/shared/src/inference/linkInference.ts :: WorkspaceLinkProviderContext (interface)
    - packages/shared/src/inference/linkInference.ts :: WorkspaceProviderSummary (interface)
    - packages/shared/src/inference/llm/confidenceCalibrator.ts :: calibrateConfidence (function)
    - packages/shared/src/inference/llm/confidenceCalibrator.ts :: CalibratedRelationship (interface)
    - packages/shared/src/inference/llm/confidenceCalibrator.ts :: CalibrationContext (interface)
    - packages/shared/src/inference/llm/confidenceCalibrator.ts :: ConfidenceTier (type)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: ConfidenceTier (type)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: ModelInvocationRequest (interface)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: ModelInvocationResult (interface)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: ModelInvoker (type)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: ModelUsage (interface)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: RawRelationshipCandidate (interface)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: RelationshipExtractionBatch (interface)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: RelationshipExtractionPrompt (interface)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: RelationshipExtractionRequest (interface)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: RelationshipExtractor (class)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: RelationshipExtractorError (class)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: RelationshipExtractorLogger (interface)
    - packages/shared/src/inference/llm/relationshipExtractor.ts :: RelationshipExtractorOptions (interface)
    - packages/shared/src/inference/llmSampling.ts :: AggregatedVote (interface)
    - packages/shared/src/inference/llmSampling.ts :: aggregateVotes (function)
    - packages/shared/src/inference/llmSampling.ts :: emitSamplingTelemetry (function)
    - packages/shared/src/inference/llmSampling.ts :: runSamplingSession (function)
    - packages/shared/src/inference/llmSampling.ts :: SamplingEdge (interface)
    - packages/shared/src/inference/llmSampling.ts :: SamplingEvaluation (interface)
    - packages/shared/src/inference/llmSampling.ts :: SamplingPromptVariant (interface)
    - packages/shared/src/inference/llmSampling.ts :: SamplingRequest (interface)
    - packages/shared/src/inference/llmSampling.ts :: SamplingResult (interface)
    - packages/shared/src/inference/llmSampling.ts :: SamplingTelemetry (interface)
    - packages/shared/src/inference/llmSampling.ts :: SamplingTelemetryOptions (interface)
    - packages/shared/src/inference/llmSampling.ts :: SamplingTelemetrySink (type)
    - packages/shared/src/inference/llmSampling.ts :: SamplingVote (interface)
    - packages/shared/src/inference/llmSampling.ts :: SamplingVoteCollector (type)
    - packages/shared/src/inference/llmSampling.ts :: scoreSamples (function)
    - packages/shared/src/knowledge/knowledgeGraphBridge.ts :: ExternalArtifact (interface)
    - packages/shared/src/knowledge/knowledgeGraphBridge.ts :: ExternalLink (interface)
    - packages/shared/src/knowledge/knowledgeGraphBridge.ts :: ExternalSnapshot (interface)
    - packages/shared/src/knowledge/knowledgeGraphBridge.ts :: ExternalStreamEvent (interface)
    - packages/shared/src/knowledge/knowledgeGraphBridge.ts :: KnowledgeGraphBridge (class)
    - packages/shared/src/knowledge/knowledgeGraphBridge.ts :: StreamCheckpoint (interface)
    - packages/shared/src/knowledge/knowledgeGraphBridge.ts :: StreamEventKind (type)
    - packages/shared/src/language/typeScriptAstUtils.ts :: collectIdentifierUsage (function)
    - packages/shared/src/language/typeScriptAstUtils.ts :: extractLocalImportNames (function)
    - packages/shared/src/language/typeScriptAstUtils.ts :: hasRuntimeUsage (function)
    - packages/shared/src/language/typeScriptAstUtils.ts :: hasTypeUsage (function)
    - packages/shared/src/language/typeScriptAstUtils.ts :: IdentifierUsage (interface)
    - packages/shared/src/language/typeScriptAstUtils.ts :: isLikelyTypeDefinitionSpecifier (function)
    - packages/shared/src/live-docs/adapters/aspnet.ts :: aspNetMarkupAdapter (variable)
    - packages/shared/src/live-docs/adapters/c.ts :: cAdapter (variable)
    - packages/shared/src/live-docs/adapters/csharp.ts :: csharpAdapter (variable)
    - packages/shared/src/live-docs/adapters/index.ts :: analyzeWithLanguageAdapters (function)
    - packages/shared/src/live-docs/adapters/index.ts :: LanguageAdapter (interface)
    - packages/shared/src/live-docs/adapters/java.ts :: javaAdapter (variable)
    - packages/shared/src/live-docs/adapters/python.ts :: pythonAdapter (variable)
    - packages/shared/src/live-docs/adapters/ruby.ts :: rubyAdapter (variable)
    - packages/shared/src/live-docs/adapters/rust.ts :: rustAdapter (variable)
    - packages/shared/src/live-docs/analysis/coActivation.ts :: buildCoActivationReport (function)
    - packages/shared/src/live-docs/analysis/coActivation.ts :: CoActivationBuildArgs (interface)
    - packages/shared/src/live-docs/analysis/coActivation.ts :: CoActivationCluster (interface)
    - packages/shared/src/live-docs/analysis/coActivation.ts :: CoActivationEdge (interface)
    - packages/shared/src/live-docs/analysis/coActivation.ts :: CoActivationNode (interface)
    - packages/shared/src/live-docs/analysis/coActivation.ts :: CoActivationReport (interface)
    - packages/shared/src/live-docs/analysis/coActivation.ts :: serializeCoActivationReport (function)
    - packages/shared/src/live-docs/core.ts :: analyzeSourceFile (function)
    - packages/shared/src/live-docs/core.ts :: cleanupEmptyParents (function)
    - packages/shared/src/live-docs/core.ts :: collectDependencies (function)
    - packages/shared/src/live-docs/core.ts :: collectExportedSymbols (function)
    - packages/shared/src/live-docs/core.ts :: computePublicSymbolHeadingInfo (function)
    - packages/shared/src/live-docs/core.ts :: createSymbolSlug (function)
    - packages/shared/src/live-docs/core.ts :: DependencyEntry (interface)
    - packages/shared/src/live-docs/core.ts :: detectChangedFiles (function)
    - packages/shared/src/live-docs/core.ts :: directoryExists (function)
    - packages/shared/src/live-docs/core.ts :: discoverTargetFiles (function)
    - packages/shared/src/live-docs/core.ts :: displayDependencyKey (function)
    - packages/shared/src/live-docs/core.ts :: execFileAsync (function)
    - packages/shared/src/live-docs/core.ts :: extractJsDocDocumentation (function)
    - packages/shared/src/live-docs/core.ts :: formatDependencyQualifier (function)
    - packages/shared/src/live-docs/core.ts :: formatInlineCode (function)
    - packages/shared/src/live-docs/core.ts :: formatRelativePathFromDoc (function)
    - packages/shared/src/live-docs/core.ts :: formatSourceLink (function)
    - packages/shared/src/live-docs/core.ts :: getNodeLocation (function)
    - packages/shared/src/live-docs/core.ts :: hasDefaultModifier (function)
    - packages/shared/src/live-docs/core.ts :: hasExportModifier (function)
    - packages/shared/src/live-docs/core.ts :: hasMeaningfulAuthoredContent (function)
    - packages/shared/src/live-docs/core.ts :: inferScriptKind (function)
    - packages/shared/src/live-docs/core.ts :: LocationInfo (interface)
    - packages/shared/src/live-docs/core.ts :: MODULE_RESOLUTION_EXTENSIONS (variable)
    - packages/shared/src/live-docs/core.ts :: parsePorcelainLine (function)
    - packages/shared/src/live-docs/core.ts :: PublicSymbolEntry (interface)
    - packages/shared/src/live-docs/core.ts :: PublicSymbolHeadingInfo (interface)
    - packages/shared/src/live-docs/core.ts :: ReExportedSymbolInfo (interface)
    - packages/shared/src/live-docs/core.ts :: renderDependencyLines (function)
    - packages/shared/src/live-docs/core.ts :: renderPublicSymbolLines (function)
    - packages/shared/src/live-docs/core.ts :: renderReExportedAnchorLines (function)
    - packages/shared/src/live-docs/core.ts :: resolveArchetype (function)
    - packages/shared/src/live-docs/core.ts :: resolveDependency (function)
    - packages/shared/src/live-docs/core.ts :: resolveExportAssignmentName (function)
    - packages/shared/src/live-docs/core.ts :: SourceAnalysisResult (interface)
    - packages/shared/src/live-docs/core.ts :: SUPPORTED_SCRIPT_EXTENSIONS (variable)
    - packages/shared/src/live-docs/core.ts :: SymbolDocumentation (interface)
    - packages/shared/src/live-docs/core.ts :: SymbolDocumentationExample (interface)
    - packages/shared/src/live-docs/core.ts :: SymbolDocumentationException (interface)
    - packages/shared/src/live-docs/core.ts :: SymbolDocumentationField (type)
    - packages/shared/src/live-docs/core.ts :: SymbolDocumentationLink (interface)
    - packages/shared/src/live-docs/core.ts :: SymbolDocumentationLinkKind (type)
    - packages/shared/src/live-docs/core.ts :: SymbolDocumentationParameter (interface)
    - packages/shared/src/live-docs/core.ts :: toModuleLabel (function)
    - packages/shared/src/live-docs/heuristics/dom.ts :: inferDomDependencies (function)
    - packages/shared/src/live-docs/markdown.ts :: composeLiveDocId (function)
    - packages/shared/src/live-docs/markdown.ts :: composeLiveDocPath (function)
    - packages/shared/src/live-docs/markdown.ts :: defaultAuthoredTemplate (function)
    - packages/shared/src/live-docs/markdown.ts :: extractAuthoredBlock (function)
    - packages/shared/src/live-docs/markdown.ts :: LIVE_DOC_BEGIN_MARKER_PREFIX (variable)
    - packages/shared/src/live-docs/markdown.ts :: LIVE_DOC_END_MARKER_PREFIX (variable)
    - packages/shared/src/live-docs/markdown.ts :: LIVE_DOC_PROVENANCE_MARKER (variable)
    - packages/shared/src/live-docs/markdown.ts :: LiveDocRenderSection (interface)
    - packages/shared/src/live-docs/markdown.ts :: renderBeginMarker (function)
    - packages/shared/src/live-docs/markdown.ts :: renderEndMarker (function)
    - packages/shared/src/live-docs/markdown.ts :: renderLiveDocMarkdown (function)
    - packages/shared/src/live-docs/markdown.ts :: RenderLiveDocOptions (interface)
    - packages/shared/src/live-docs/markdown.ts :: renderProvenanceComment (function)
    - packages/shared/src/live-docs/parse.ts :: ParsedLiveDoc (interface)
    - packages/shared/src/live-docs/parse.ts :: parseLiveDocMarkdown (function)
    - packages/shared/src/live-docs/schema.ts :: DEFAULT_LIVE_DOC_LAYER (variable)
    - packages/shared/src/live-docs/schema.ts :: LiveDocDocstringProvenance (interface)
    - packages/shared/src/live-docs/schema.ts :: LiveDocGeneratorProvenance (interface)
    - packages/shared/src/live-docs/schema.ts :: LiveDocLayer (type)
    - packages/shared/src/live-docs/schema.ts :: LiveDocMetadata (interface)
    - packages/shared/src/live-docs/schema.ts :: LiveDocMetadataInput (type)
    - packages/shared/src/live-docs/schema.ts :: LiveDocProvenance (interface)
    - packages/shared/src/live-docs/schema.ts :: normalizeLiveDocMetadata (function)
    - packages/shared/src/live-docs/types.ts :: Stage0Doc (interface)
    - packages/shared/src/live-docs/types.ts :: Stage0DocLogger (interface)
    - packages/shared/src/live-docs/types.ts :: Stage0Symbol (interface)
    - packages/shared/src/live-docs/types.ts :: TargetManifest (interface)
    - packages/shared/src/reporting/testReport.ts :: AstAccuracyData (interface)
    - packages/shared/src/reporting/testReport.ts :: AstAccuracyFixture (interface)
    - packages/shared/src/reporting/testReport.ts :: AstAccuracyTotals (interface)
    - packages/shared/src/reporting/testReport.ts :: BenchmarkEnvironment (interface)
    - packages/shared/src/reporting/testReport.ts :: BenchmarkRecord (interface)
    - packages/shared/src/reporting/testReport.ts :: buildTestReportMarkdown (function)
    - packages/shared/src/reporting/testReport.ts :: RebuildStabilityData (interface)
    - packages/shared/src/reporting/testReport.ts :: ReportSection (interface)
    - packages/shared/src/reporting/testReport.ts :: TestReportContext (interface)
    - packages/shared/src/rules/relationshipResolvers.ts :: createBuiltInResolvers (function)
    - packages/shared/src/rules/relationshipRuleAudit.ts :: evaluateRelationshipCoverage (function)
    - packages/shared/src/rules/relationshipRuleAudit.ts :: EvaluateRelationshipCoverageOptions (interface)
    - packages/shared/src/rules/relationshipRuleAudit.ts :: formatRelationshipDiagnostics (function)
    - packages/shared/src/rules/relationshipRuleAudit.ts :: RelationshipCoverageChain (interface)
    - packages/shared/src/rules/relationshipRuleAudit.ts :: RelationshipCoverageDiagnostic (interface)
    - packages/shared/src/rules/relationshipRuleAudit.ts :: RelationshipCoverageIssue (interface)
    - packages/shared/src/rules/relationshipRuleAudit.ts :: RelationshipCoverageIssueKind (type)
    - packages/shared/src/rules/relationshipRuleAudit.ts :: RelationshipCoverageResult (interface)
    - packages/shared/src/rules/relationshipRuleAudit.ts :: RelationshipCoverageRuleResult (interface)
    - packages/shared/src/rules/relationshipRuleEngine.ts :: compileRelationshipRules (function)
    - packages/shared/src/rules/relationshipRuleEngine.ts :: generateRelationshipEvidences (function)
    - packages/shared/src/rules/relationshipRuleEngine.ts :: GenerateRelationshipEvidencesOptions (interface)
    - packages/shared/src/rules/relationshipRuleEngine.ts :: loadRelationshipRuleConfig (function)
    - packages/shared/src/rules/relationshipRuleEngine.ts :: RelationshipEvidenceGenerationResult (interface)
    - packages/shared/src/rules/relationshipRuleProvider.ts :: createRelationshipRuleProvider (function)
    - packages/shared/src/rules/relationshipRuleProvider.ts :: RelationshipRuleProviderLogger (interface)
    - packages/shared/src/rules/relationshipRuleProvider.ts :: RelationshipRuleProviderOptions (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: CompiledRelationshipRule (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: CompiledRelationshipRulePropagation (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: CompiledRelationshipRules (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: CompiledRelationshipRuleStep (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: CompiledSymbolProfile (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: CompiledSymbolProfileRequirement (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: CompiledSymbolProfileSource (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: CompiledSymbolProfileTarget (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: RelationshipResolver (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: RelationshipResolverOptions (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: RelationshipResolverResult (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: RelationshipRuleChain (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: RelationshipRuleChainStep (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: RelationshipRuleConfig (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: RelationshipRuleConfigLoadResult (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: RelationshipRulePropagationConfig (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: RelationshipRulesConfig (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: RelationshipRuleStepConfig (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: RelationshipRuleWarning (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: SymbolCorrectnessProfileConfig (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: SymbolProfileLookup (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: SymbolProfileRequirementConfig (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: SymbolProfileRequirementDirection (type)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: SymbolProfileSourceConfig (interface)
    - packages/shared/src/rules/relationshipRuleTypes.ts :: SymbolProfileTargetConfig (interface)
    - packages/shared/src/rules/symbolCorrectnessProfiles.ts :: compileSymbolProfiles (function)
    - packages/shared/src/rules/symbolCorrectnessProfiles.ts :: CompileSymbolProfilesResult (interface)
    - packages/shared/src/rules/symbolCorrectnessProfiles.ts :: loadSymbolCorrectnessProfiles (function)
    - packages/shared/src/rules/symbolCorrectnessProfiles.ts :: SymbolProfileLoadResult (interface)
    - packages/shared/src/telemetry/inferenceAccuracy.ts :: AccuracySample (interface)
    - packages/shared/src/telemetry/inferenceAccuracy.ts :: AccuracyTotals (interface)
    - packages/shared/src/telemetry/inferenceAccuracy.ts :: BenchmarkAccuracySummary (interface)
    - packages/shared/src/telemetry/inferenceAccuracy.ts :: InferenceAccuracySummary (interface)
    - packages/shared/src/telemetry/inferenceAccuracy.ts :: InferenceAccuracyTracker (class)
    - packages/shared/src/telemetry/inferenceAccuracy.ts :: InferenceAccuracyTrackerOptions (interface)
    - packages/shared/src/telemetry/inferenceAccuracy.ts :: InferenceOutcome (type)
    - packages/shared/src/telemetry/inferenceAccuracy.ts :: RecordOutcomeOptions (interface)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: CFixtureOracleOptions (interface)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: COracleEdge (interface)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: COracleEdgeRecord (interface)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: COracleEdgeRelation (type)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: COracleMergeResult (interface)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: COracleOverrideConfig (interface)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: COracleOverrideEntry (interface)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: COracleProvenance (type)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: COracleSegmentPartition (interface)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: generateCFixtureGraph (function)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: mergeCOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: partitionCOracleSegments (function)
    - packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts :: serializeCOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: CSharpFixtureOracleOptions (interface)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: CSharpOracleEdge (interface)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: CSharpOracleEdgeRecord (interface)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: CSharpOracleEdgeRelation (type)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: CSharpOracleMergeResult (interface)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: CSharpOracleOverrideConfig (interface)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: CSharpOracleOverrideEntry (interface)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: CSharpOracleProvenance (type)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: CSharpOracleSegmentPartition (interface)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: generateCSharpFixtureGraph (function)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: mergeCSharpOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: partitionCSharpOracleSegments (function)
    - packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts :: serializeCSharpOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: generateJavaFixtureGraph (function)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: JavaFixtureOracleOptions (interface)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: JavaOracleEdge (interface)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: JavaOracleEdgeRecord (interface)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: JavaOracleEdgeRelation (type)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: JavaOracleMergeResult (interface)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: JavaOracleOverrideConfig (interface)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: JavaOracleOverrideEntry (interface)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: JavaOracleProvenance (type)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: JavaOracleSegmentPartition (interface)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: mergeJavaOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: partitionJavaOracleSegments (function)
    - packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts :: serializeJavaOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: generatePythonFixtureGraph (function)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: mergePythonOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: partitionPythonOracleSegments (function)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: PythonFixtureOracleOptions (interface)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: PythonOracleEdge (interface)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: PythonOracleEdgeRecord (interface)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: PythonOracleEdgeRelation (type)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: PythonOracleMergeResult (interface)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: PythonOracleOverrideConfig (interface)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: PythonOracleOverrideEntry (interface)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: PythonOracleProvenance (type)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: PythonOracleSegmentPartition (interface)
    - packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts :: serializePythonOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: generateRubyFixtureGraph (function)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: mergeRubyOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: partitionRubyOracleSegments (function)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: RubyFixtureOracleOptions (interface)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: RubyOracleEdge (interface)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: RubyOracleEdgeRecord (interface)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: RubyOracleEdgeRelation (type)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: RubyOracleMergeResult (interface)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: RubyOracleOverrideConfig (interface)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: RubyOracleOverrideEntry (interface)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: RubyOracleProvenance (type)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: RubyOracleSegmentPartition (interface)
    - packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts :: serializeRubyOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: generateRustFixtureGraph (function)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: mergeRustOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: partitionRustOracleSegments (function)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: RustFixtureOracleOptions (interface)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: RustOracleEdge (interface)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: RustOracleEdgeRecord (interface)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: RustOracleEdgeRelation (type)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: RustOracleMergeResult (interface)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: RustOracleOverrideConfig (interface)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: RustOracleOverrideEntry (interface)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: RustOracleProvenance (type)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: RustOracleSegmentPartition (interface)
    - packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts :: serializeRustOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: generateTypeScriptFixtureGraph (function)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: mergeOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: OracleEdge (interface)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: OracleEdgeProvenance (type)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: OracleEdgeRecord (interface)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: OracleEdgeRelation (type)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: OracleMergeResult (interface)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: OracleOverrideConfig (interface)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: OracleOverrideEntry (interface)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: OracleSegmentPartition (interface)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: partitionOracleSegments (function)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: serializeOracleEdges (function)
    - packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts :: TypeScriptFixtureOracleOptions (interface)
    - packages/shared/src/tooling/__fixtures__/documentation-links/sample-tool.ts :: sampleTool (function)
    - packages/shared/src/tooling/assetPaths.ts :: AssetAuditOptions (interface)
    - packages/shared/src/tooling/assetPaths.ts :: AssetReferenceIssue (interface)
    - packages/shared/src/tooling/assetPaths.ts :: findBrokenAssetReferences (function)
    - packages/shared/src/tooling/documentationLinks.ts :: DEFAULT_RULES (variable)
    - packages/shared/src/tooling/documentationLinks.ts :: DocumentationAnchorSummary (interface)
    - packages/shared/src/tooling/documentationLinks.ts :: DocumentationDocumentAnchors (interface)
    - packages/shared/src/tooling/documentationLinks.ts :: DocumentationLinkEnforcementResult (interface)
    - packages/shared/src/tooling/documentationLinks.ts :: DocumentationLinkViolation (interface)
    - packages/shared/src/tooling/documentationLinks.ts :: DocumentationRule (interface)
    - packages/shared/src/tooling/documentationLinks.ts :: DocumentationTargetMap (type)
    - packages/shared/src/tooling/documentationLinks.ts :: formatDocumentationLinkComment (function)
    - packages/shared/src/tooling/documentationLinks.ts :: parseDocumentationAnchors (function)
    - packages/shared/src/tooling/documentationLinks.ts :: ParseDocumentationAnchorsOptions (interface)
    - packages/shared/src/tooling/documentationLinks.ts :: resolveCodeToDocumentationMap (function)
    - packages/shared/src/tooling/documentationLinks.ts :: ResolvedDocumentationTarget (interface)
    - packages/shared/src/tooling/documentationLinks.ts :: runDocumentationLinkEnforcement (function)
    - packages/shared/src/tooling/documentationLinks.ts :: RunDocumentationLinkEnforcementOptions (interface)
    - packages/shared/src/tooling/githubSlugger.ts :: createSlugger (function)
    - packages/shared/src/tooling/githubSlugger.ts :: GitHubSlugger (class)
    - packages/shared/src/tooling/githubSlugger.ts :: slug (function)
    - packages/shared/src/tooling/githubSlugger.ts :: SlugContext (interface)
    - packages/shared/src/tooling/githubSluggerRegex.ts :: GITHUB_SLUG_REMOVE_PATTERN (variable)
    - packages/shared/src/tooling/markdownLinks.ts :: findBrokenMarkdownLinks (function)
    - packages/shared/src/tooling/markdownLinks.ts :: MarkdownLinkAuditOptions (interface)
    - packages/shared/src/tooling/markdownLinks.ts :: MarkdownLinkIssue (interface)
    - packages/shared/src/tooling/markdownShared.ts :: computeLineStarts (function)
    - packages/shared/src/tooling/markdownShared.ts :: extractReferenceDefinitions (function)
    - packages/shared/src/tooling/markdownShared.ts :: parseLinkTarget (function)
    - packages/shared/src/tooling/markdownShared.ts :: ReferenceDefinition (interface)
    - packages/shared/src/tooling/markdownShared.ts :: toLineAndColumn (function)
    - packages/shared/src/tooling/ollamaClient.ts :: invokeOllamaChat (function)
    - packages/shared/src/tooling/ollamaClient.ts :: OllamaChatRequest (interface)
    - packages/shared/src/tooling/ollamaClient.ts :: OllamaChatResult (interface)
    - packages/shared/src/tooling/ollamaClient.ts :: OllamaChatUsage (interface)
    - packages/shared/src/tooling/ollamaClient.ts :: OllamaInvocationError (class)
    - packages/shared/src/tooling/ollamaEndpoint.ts :: resolveOllamaEndpoint (function)
    - packages/shared/src/tooling/ollamaEndpoint.ts :: ResolveOllamaEndpointOptions (interface)
    - packages/shared/src/tooling/ollamaEndpoint.ts :: WorkspaceConfigurationLike (interface)
    - packages/shared/src/tooling/ollamaMock.ts :: createMockOllamaResponse (function)
    - packages/shared/src/tooling/ollamaMock.ts :: CreateMockOllamaResponseOptions (interface)
    - packages/shared/src/tooling/ollamaMock.ts :: MockOllamaResponse (interface)
    - packages/shared/src/tooling/pathUtils.ts :: normalizeWorkspacePath (function)
    - packages/shared/src/tooling/pathUtils.ts :: toWorkspaceFileUri (function)
    - packages/shared/src/tooling/pathUtils.ts :: toWorkspaceRelativePath (function)
    - packages/shared/src/tooling/symbolReferences.ts :: findSymbolReferenceAnomalies (function)
    - packages/shared/src/tooling/symbolReferences.ts :: SymbolAuditOptions (interface)
    - packages/shared/src/tooling/symbolReferences.ts :: SymbolIssueKind (type)
    - packages/shared/src/tooling/symbolReferences.ts :: SymbolIssueSeverity (type)
    - packages/shared/src/tooling/symbolReferences.ts :: SymbolReferenceIssue (interface)
    - packages/shared/src/tooling/symbolReferences.ts :: SymbolRuleSetting (type)
    - packages/shared/src/uri/normalizeFileUri.ts :: normalizeFileUri (function)
  scripts
    - scripts/analysis/mdmd-layer-audit.ts :: collectLayerReport (function)
    - scripts/analysis/mdmd-layer-audit.ts :: logLayerReport (function)
    - scripts/analysis/mdmd-layer-audit.ts :: main (function)
    - scripts/analysis/mdmd-layer-audit.ts :: parseArgs (function)
    - scripts/doc-tools/enforce-documentation-links.ts :: EXIT_CODES (variable)
    - scripts/doc-tools/enforce-documentation-links.ts :: runCli (function)
    - scripts/graph-tools/audit-doc-coverage.ts :: auditCoverage (function)
    - scripts/graph-tools/audit-doc-coverage.ts :: main (function)
    - scripts/graph-tools/audit-doc-coverage.ts :: parseArgs (function)
    - scripts/graph-tools/audit-doc-coverage.ts :: printReport (function)
    - scripts/graph-tools/inspect-symbol.ts :: main (function)
    - scripts/graph-tools/inspect-symbol.ts :: parseArgs (function)
    - scripts/graph-tools/inspect-symbol.ts :: printResult (function)
    - scripts/graph-tools/snapshot-workspace.ts :: DEFAULT_DB (variable)
    - scripts/graph-tools/snapshot-workspace.ts :: DEFAULT_OUTPUT (variable)
    - scripts/graph-tools/snapshot-workspace.ts :: main (function)
    - scripts/graph-tools/snapshot-workspace.ts :: parseArgs (function)
    - scripts/graph-tools/snapshot-workspace.ts :: snapshotWorkspace (function)
    - scripts/graph-tools/snapshot-workspace.ts :: SnapshotWorkspaceOptions (interface)
    - scripts/graph-tools/snapshot-workspace.ts :: SnapshotWorkspaceResult (interface)
    - scripts/graph-tools/snapshot-workspace.ts :: writeDatabaseWithRecovery (function)
    - scripts/slopcop/config.ts :: compileIgnorePatterns (function)
    - scripts/slopcop/config.ts :: CONFIG_FILE_NAME (variable)
    - scripts/slopcop/config.ts :: loadSlopcopConfig (function)
    - scripts/slopcop/config.ts :: resolveIgnoreGlobs (function)
    - scripts/slopcop/config.ts :: resolveIncludeGlobs (function)
    - scripts/slopcop/config.ts :: resolveRootDirectories (function)
    - scripts/slopcop/config.ts :: SeveritySetting (type)
    - scripts/slopcop/config.ts :: SlopcopConfig (interface)
    - scripts/slopcop/config.ts :: SlopcopConfigSection (interface)
    - scripts/slopcop/config.ts :: SlopcopSymbolConfig (interface)

Symbol correctness profile coverage:
  layer4-orphans (Layer 4 documents must have a Layer 3 parent): 112/467 artifacts satisfied (24% coverage)

Symbol correctness profile violations:
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/benchmarks/astAccuracyFixtures.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/benchmarks/astAccuracyFixtures.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).   
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/changeEvents/saveCodeChange.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/changeEvents/saveCodeChange.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/changeEvents/saveCodeChange.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/changeEvents/saveCodeChange.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/changeEvents/saveDocumentChange.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/changeEvents/saveDocumentChange.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/changeEvents/saveDocumentChange.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/changeEvents/saveDocumentChange.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/dependencies/buildCodeGraph.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/dependencies/buildCodeGraph.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/dependencies/inspectDependencies.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/dependencies/inspectDependencies.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/dependencies/symbolNeighbors.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/dependencies/symbolNeighbors.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/diagnostics/acknowledgementService.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/diagnostics/acknowledgementService.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/diagnostics/diagnosticPublisher.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/diagnostics/diagnosticPublisher.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/diagnostics/diagnosticUtils.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/diagnostics/diagnosticUtils.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/diagnostics/hysteresisController.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/diagnostics/hysteresisController.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/diagnostics/hysteresisController.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/diagnostics/hysteresisController.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/diagnostics/listOutstandingDiagnostics.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/diagnostics/listOutstandingDiagnostics.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/diagnostics/noiseFilter.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/diagnostics/noiseFilter.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/diagnostics/publishDocDiagnostics.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/diagnostics/publishDocDiagnostics.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/diagnostics/rippleTypes.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/diagnostics/rippleTypes.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/feedCheckpointStore.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/feedCheckpointStore.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/feedDiagnosticsGateway.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/feedDiagnosticsGateway.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/feedFormatDetector.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/feedFormatDetector.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/feedFormatDetector.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/feedFormatDetector.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/knowledgeFeedManager.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/knowledgeFeedManager.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/knowledgeGraphBridge.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/knowledgeGraphBridge.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/knowledgeGraphIngestor.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/knowledgeGraphIngestor.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/llmIngestionOrchestrator.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/llmIngestionOrchestrator.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/lsifParser.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/lsifParser.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/lsifParser.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/lsifParser.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/rippleAnalyzer.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/rippleAnalyzer.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/schemaValidator.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/schemaValidator.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/scipParser.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/scipParser.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/scipParser.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/scipParser.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/symbolBridgeProvider.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/symbolBridgeProvider.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/workspaceIndexProvider.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/workspaceIndexProvider.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/knowledge/workspaceIndexProvider.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/knowledge/workspaceIndexProvider.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/live-docs/generator.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/live-docs/generator.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD 
layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/live-docs/system/generator.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/live-docs/system/generator.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/maintenance/removeOrphans.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/maintenance/removeOrphans.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/overrides/overrideLink.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/overrides/overrideLink.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/settings/settingsBridge.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/settings/settingsBridge.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/utils/uri.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/utils/uri.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/watchers/artifactWatcher.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/watchers/artifactWatcher.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/features/watchers/pathReferenceDetector.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/features/watchers/pathReferenceDetector.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/main.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/main.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).      
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/runtime/environment.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/runtime/environment.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/runtime/environment.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/runtime/environment.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/runtime/knowledgeFeeds.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/runtime/knowledgeFeeds.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/runtime/settings.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/runtime/settings.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/runtime/settings.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/runtime/settings.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/telemetry/driftHistoryStore.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/telemetry/driftHistoryStore.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer 
'3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/telemetry/inferenceAccuracy.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/telemetry/inferenceAccuracy.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/telemetry/inferenceAccuracy.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/telemetry/inferenceAccuracy.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer 
'3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/telemetry/latencyTracker.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/telemetry/latencyTracker.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/server/src/telemetry/latencyTracker.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/server/src/telemetry/latencyTracker.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/config/liveDocumentationConfig.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/config/liveDocumentationConfig.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/contracts/dependencies.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/contracts/dependencies.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/contracts/diagnostics.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/contracts/diagnostics.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/contracts/llm.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/contracts/llm.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 
0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/contracts/lsif.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/contracts/lsif.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/contracts/maintenance.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/contracts/maintenance.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/contracts/overrides.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/contracts/overrides.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/contracts/scip.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/contracts/scip.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/contracts/symbols.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/contracts/symbols.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/contracts/telemetry.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/contracts/telemetry.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/db/graphStore.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/db/graphStore.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/db/graphStore.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/db/graphStore.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 
0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/domain/artifacts.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/domain/artifacts.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/index.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/index.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).     
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/fallbackHeuristicTypes.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/fallbackHeuristicTypes.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/fallbackInference.languages.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/fallbackInference.languages.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/fallbackInference.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/fallbackInference.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/artifactLayerUtils.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/artifactLayerUtils.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/cFunctions.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/cFunctions.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/csharp.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/csharp.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer 
'3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/directives.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/directives.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/imports.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/imports.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/includes.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/includes.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/index.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/index.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/java.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/java.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/markdown.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/markdown.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/referenceResolver.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/referenceResolver.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/ruby.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/ruby.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/rust.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/rust.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/shared.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/shared.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer 
'3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/heuristics/webforms.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/heuristics/webforms.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/linkInference.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/linkInference.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/linkInference.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/linkInference.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' 
(observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/llm/confidenceCalibrator.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/llm/confidenceCalibrator.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/llm/relationshipExtractor.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/llm/relationshipExtractor.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/inference/llmSampling.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/inference/llmSampling.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/knowledge/knowledgeGraphBridge.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/knowledge/knowledgeGraphBridge.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/language/typeScriptAstUtils.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/language/typeScriptAstUtils.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer 
'3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/live-docs/adapters/aspnet.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/live-docs/adapters/aspnet.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/live-docs/adapters/c.docstring.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/live-docs/adapters/c.docstring.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/live-docs/adapters/csharp.hangfire.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/live-docs/adapters/csharp.hangfire.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/live-docs/adapters/python.docstring.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/live-docs/adapters/python.docstring.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/live-docs/adapters/ruby.docstring.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/live-docs/adapters/ruby.docstring.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/live-docs/adapters/rust.docstring.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/live-docs/adapters/rust.docstring.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/live-docs/analysis/coActivation.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/live-docs/analysis/coActivation.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/live-docs/core.docstring.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/live-docs/core.docstring.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/live-docs/generator.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/live-docs/generator.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/live-docs/markdown.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/live-docs/markdown.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' 
(observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/live-docs/schema.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/live-docs/schema.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/reporting/testReport.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/reporting/testReport.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/rules/relationshipRuleProvider.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/rules/relationshipRuleProvider.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/cFixtureOracle.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/cFixtureOracle.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/javaFixtureOracle.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/javaFixtureOracle.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/rustFixtureOracle.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/rustFixtureOracle.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/__fixtures__/documentation-links/sample-tool.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/__fixtures__/documentation-links/sample-tool.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/assetPaths.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/assetPaths.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' 
(observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/assetPaths.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/assetPaths.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/documentationLinks.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/documentationLinks.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/documentationLinks.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/documentationLinks.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/githubSlugger.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/githubSlugger.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/githubSlugger.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/githubSlugger.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/githubSluggerRegex.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/githubSluggerRegex.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/markdownLinks.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/markdownLinks.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/markdownLinks.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/markdownLinks.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/markdownShared.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/markdownShared.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/ollamaClient.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/ollamaClient.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/ollamaEndpoint.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/ollamaEndpoint.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/ollamaMock.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/ollamaMock.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/slopcopAssetCli.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/slopcopAssetCli.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/slopcopSymbolsCli.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/slopcopSymbolsCli.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/symbolReferences.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/symbolReferences.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/tooling/symbolReferences.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/tooling/symbolReferences.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/packages/shared/src/uri/normalizeFileUri.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/packages/shared/src/uri/normalizeFileUri.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/analysis/mdmd-layer-audit.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/analysis/mdmd-layer-audit.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 
0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/doc-tools/combine-summaries.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/doc-tools/combine-summaries.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/doc-tools/enforce-documentation-links.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/doc-tools/enforce-documentation-links.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/doc-tools/enforce-documentation-links.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/doc-tools/enforce-documentation-links.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/doc-tools/list-layer4-links.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/doc-tools/list-layer4-links.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/doc-tools/replace-layer4-links.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/doc-tools/replace-layer4-links.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/doc-tools/show-heading-codepoints.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/doc-tools/show-heading-codepoints.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/doc-tools/slug-heading.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/doc-tools/slug-heading.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/doc-tools/update-stage0-links.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/doc-tools/update-stage0-links.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/fixture-tools/benchmark-doc.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/fixture-tools/benchmark-doc.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/fixture-tools/benchmark-manifest.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/fixture-tools/benchmark-manifest.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/fixture-tools/find-parent-includes.mjs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/fixture-tools/find-parent-includes.mjs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' 
(observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/fixture-tools/fixtureMaterializer.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/fixture-tools/fixtureMaterializer.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/fixture-tools/record-fallback-inference.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/fixture-tools/record-fallback-inference.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer 
'3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/fixture-tools/summarize-snapshot.mjs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/fixture-tools/summarize-snapshot.mjs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/fixture-tools/sync-ast-doc.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/fixture-tools/sync-ast-doc.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/fixture-tools/verify-fixtures.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/fixture-tools/verify-fixtures.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/graph-tools/snapshot-workspace.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/graph-tools/snapshot-workspace.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/ollama/run-chat.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/ollama/run-chat.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).       
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/rebuild-better-sqlite3.mjs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/rebuild-better-sqlite3.mjs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/reporting/generateTestReport.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/reporting/generateTestReport.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/run-benchmarks.mjs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/run-benchmarks.mjs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).       
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/safe-to-commit.mjs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/safe-to-commit.mjs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).       
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/slopcop/config.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/slopcop/config.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).        
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/scripts/verify.mjs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/scripts/verify.mjs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/astAccuracy.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/astAccuracy.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/basics/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/basics/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/basics/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/basics/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/basics/src/main.c.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/basics/src/main.c.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/basics/src/util.c.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/basics/src/util.c.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/basics/src/util.h.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/basics/src/util.h.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/libuv/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/libuv/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/libuv/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/libuv/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/logger.c.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/logger.c.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/logger.h.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/logger.h.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/main.c.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/main.c.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/metrics.c.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/metrics.c.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/metrics.h.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/metrics.h.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/pipeline.c.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/pipeline.c.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/pipeline.h.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/c/modular/src/pipeline.h.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/App.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/App.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/Data/Repository.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/Data/Repository.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/Models/FormattedReport.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/Models/FormattedReport.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/Models/Formatter.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/Models/Formatter.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/Models/Record.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/Models/Record.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/Services/ReportService.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/Services/ReportService.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/roslyn-compilers/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/roslyn-compilers/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/roslyn-compilers/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/roslyn-compilers/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/roslyn-compilers/oracle.overrides.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/roslyn-compilers/oracle.overrides.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/oracle.overrides.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/oracle.overrides.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/src/App_Code/Globals.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/src/App_Code/Globals.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/src/Pages/Default.aspx.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/src/Pages/Default.aspx.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/src/Pages/Default.aspx.designer.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/src/Pages/Default.aspx.designer.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/src/Scripts/appConfig.js.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/csharp/webforms/src/Scripts/appConfig.js.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/fixtures.manifest.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/fixtures.manifest.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/src/com/example/app/App.java.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/src/com/example/app/App.java.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/src/com/example/data/Catalog.java.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/src/com/example/data/Catalog.java.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/src/com/example/data/Reader.java.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/src/com/example/data/Reader.java.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/src/com/example/format/ReportWriter.java.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/src/com/example/format/ReportWriter.java.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/src/com/example/model/Record.java.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/basic/src/com/example/model/Record.java.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/okhttp/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/okhttp/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/okhttp/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/okhttp/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/analytics/Analyzer.java.mdmd.md :: expected ≥1 documents (incoming), observed 0       
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/analytics/Analyzer.java.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java.mdmd.md to targets matching 
'.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/data/Repository.java.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/data/Repository.java.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/data/SourceRegistry.java.mdmd.md :: expected ≥1 documents (incoming), observed 0      
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/data/SourceRegistry.java.mdmd.md to targets 
matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/metrics/SummaryBuilder.java.mdmd.md :: expected ≥1 documents (incoming), observed 0   
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/metrics/SummaryBuilder.java.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/model/Sample.java.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/model/Sample.java.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/model/Summary.java.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/model/Summary.java.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/util/Logger.java.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/java/service/src/com/example/service/util/Logger.java.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/oracle.overrides.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/oracle.overrides.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/src/helpers.py.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/src/helpers.py.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/src/main.py.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/src/main.py.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/src/util.py.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/basics/src/util.py.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/oracle.overrides.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/oracle.overrides.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/__init__.py.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/__init__.py.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/main.py.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/main.py.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/metrics.py.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/metrics.py.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/pipeline.py.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/pipeline.py.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/repositories.py.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/repositories.py.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/validators.py.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/pipeline/src/validators.py.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/requests/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/requests/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/requests/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/requests/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/requests/oracle.overrides.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/python/requests/oracle.overrides.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/lib/data_store.rb.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/lib/data_store.rb.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/lib/formatter.rb.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/lib/formatter.rb.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/lib/main.rb.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/lib/main.rb.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/lib/reporter.rb.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/lib/reporter.rb.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/lib/templates.rb.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/basic/lib/templates.rb.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/cli.rb.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/cli.rb.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/commands/report.rb.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/commands/report.rb.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/services/analyzer.rb.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/services/analyzer.rb.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/services/cache.rb.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/services/cache.rb.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/services/data_loader.rb.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/services/data_loader.rb.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/support/logger.rb.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/ruby/cli/lib/support/logger.rb.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/src/analytics.rs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/src/analytics.rs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/src/io.rs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/src/io.rs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/src/main.rs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/src/main.rs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/src/metrics.rs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/src/metrics.rs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/src/models.rs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/analytics/src/models.rs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/basics/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/basics/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/basics/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/basics/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/basics/src/main.rs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/basics/src/main.rs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/basics/src/math.rs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/basics/src/math.rs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/basics/src/utils.rs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/basics/src/utils.rs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/log/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/log/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/log/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/rust/log/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/oracle.overrides.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/oracle.overrides.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/src/helpers.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/src/helpers.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/src/index.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/src/index.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/src/models.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/src/models.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/src/types.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/src/types.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/src/util.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/basic/src/util.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/ky/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/ky/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/ky/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/ky/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/expected.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/expected.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/inferred.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/inferred.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/oracle.overrides.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/oracle.overrides.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/index.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/index.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/models/widget.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/models/widget.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/repositories/storage.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/repositories/storage.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/services/dataService.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/services/dataService.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/services/reportService.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/services/reportService.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/utils/format.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/fixtures/typescript/layered/src/utils/format.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/rebuildStability.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/rebuildStability.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/benchmarks/utils/repoPaths.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/benchmarks/utils/repoPaths.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/clean-dist.mjs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/clean-dist.mjs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0). 
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/blazor-telemetry/workspace/appsettings.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/blazor-telemetry/workspace/appsettings.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/blazor-telemetry/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md :: expected ≥1 documents (incoming), observed 0       
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/blazor-telemetry/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/blazor-telemetry/workspace/Pages/_Host.cshtml.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/blazor-telemetry/workspace/Pages/_Host.cshtml.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/blazor-telemetry/workspace/Pages/_Host.cshtml.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/blazor-telemetry/workspace/Pages/_Host.cshtml.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/blazor-telemetry/workspace/wwwroot/js/blazor-telemetry.js.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/blazor-telemetry/workspace/wwwroot/js/blazor-telemetry.js.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/data/graph-snapshots/workspace.snapshot.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/data/graph-snapshots/workspace.snapshot.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Extensions/WidgetExtensions.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0        
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Extensions/WidgetExtensions.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/RenderContext.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/RenderContext.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetMetadata.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetMetadata.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/CompositeWidget.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/CompositeWidget.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/LatencyProbeWidget.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/LatencyProbeWidget.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/SymbolDriftWidget.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/SymbolDriftWidget.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetSnapshot.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetSnapshot.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-reflection/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md :: expected ≥1 documents (incoming), observed 0      
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-reflection/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md to targets 
matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-reflection/workspace/Services/ReflectionFactory.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-reflection/workspace/Services/ReflectionFactory.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/fixtures.manifest.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/fixtures.manifest.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/queue-worker/workspace/appsettings.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/queue-worker/workspace/appsettings.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/queue-worker/workspace/Controllers/TelemetryController.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/queue-worker/workspace/Controllers/TelemetryController.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/queue-worker/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/queue-worker/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/queue-worker/workspace/Services/TelemetryScheduler.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/queue-worker/workspace/Services/TelemetryScheduler.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/queue-worker/workspace/Workers/TelemetryWorker.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/queue-worker/workspace/Workers/TelemetryWorker.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/razor-appsettings/workspace/appsettings.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/razor-appsettings/workspace/appsettings.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/razor-appsettings/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md :: expected ≥1 documents (incoming), observed 0      
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/razor-appsettings/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md to targets 
matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/razor-appsettings/workspace/Pages/Index.cshtml.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/razor-appsettings/workspace/wwwroot/js/telemetry.js.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/razor-appsettings/workspace/wwwroot/js/telemetry.js.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/simple-workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/simple-workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/simple-workspace/data/knowledge-feeds/001-doc-links.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/simple-workspace/data/knowledge-feeds/001-doc-links.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/simple-workspace/data/knowledge-feeds/002-transform.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/simple-workspace/data/knowledge-feeds/002-transform.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/simple-workspace/src/core.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/simple-workspace/src/core.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/simple-workspace/src/dataAlpha.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/simple-workspace/src/dataAlpha.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/simple-workspace/src/dataBeta.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/simple-workspace/src/dataBeta.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/simple-workspace/src/feature.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/simple-workspace/src/feature.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/simple-workspace/src/util.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/simple-workspace/src/util.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/simple-workspace/tmp.snapshot.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/simple-workspace/tmp.snapshot.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' 
MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/slopcop-assets/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/slopcop-assets/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/slopcop-assets/workspace/pages/index.html.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/slopcop-assets/workspace/pages/index.html.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/slopcop-assets/workspace/public/styles/missing.css.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/slopcop-assets/workspace/public/styles/missing.css.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/slopcop-assets/workspace/slopcop.config.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/slopcop-assets/workspace/slopcop.config.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/slopcop-assets/workspace/styles/site.css.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/slopcop-assets/workspace/styles/site.css.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/slopcop-symbols/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md :: expected ≥1 documents (incoming), observed 0        
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/slopcop-symbols/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/slopcop-symbols/workspace/slopcop.config.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/slopcop-symbols/workspace/slopcop.config.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/slopcop-symbols/workspace/src/component.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/slopcop-symbols/workspace/src/component.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/spa-runtime-config/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md :: expected ≥1 documents (incoming), observed 0     
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/spa-runtime-config/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/spa-runtime-config/workspace/src/bootstrap.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/spa-runtime-config/workspace/src/bootstrap.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/spa-runtime-config/workspace/src/config/runtime.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/spa-runtime-config/workspace/src/config/runtime.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/spa-runtime-config/workspace/tsconfig.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/spa-runtime-config/workspace/tsconfig.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/webforms-appsettings/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md :: expected ≥1 documents (incoming), observed 0   
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/webforms-appsettings/workspace/data/graph-snapshots/workspace.snapshot.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Default.aspx.cs.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Default.aspx.cs.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Default.aspx.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Default.aspx.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Scripts/app-insights.js.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Scripts/app-insights.js.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/fixtures/webforms-appsettings/workspace/Web.config.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/fixtures/webforms-appsettings/workspace/Web.config.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/live-docs/inspect-cli.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/live-docs/inspect-cli.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/live-docs/polyglot-fixtures.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/live-docs/polyglot-fixtures.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/live-docs/system-output.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/live-docs/system-output.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/perf/diagnosticLatency.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/slopcop/assetsAudit.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/slopcop/assetsAudit.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/slopcop/symbolsAudit.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/slopcop/symbolsAudit.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' 
(observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/us1/markdownDrift.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/us1/markdownDrift.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/us3/markdownLinkDrift.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/us3/markdownLinkDrift.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/us4/scopeCollision.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/us4/scopeCollision.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/us5/__fixtures__/llm-ingestion/dry-run.sample.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/us5/__fixtures__/llm-ingestion/dry-run.sample.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/us5/transformRipple.test.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/us5/transformRipple.test.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/vscode/suite/index.ts.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/vscode/suite/index.ts.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
  layer4-orphans (Layer 4 documents must have a Layer 3 parent) :: must-have-l3-parent
    - .mdmd/layer-4/tests/integration/vscode/tsconfig.json.mdmd.md :: expected ≥1 documents (incoming), observed 0
    - Expected 1 incoming 'documents' link from .mdmd/layer-4/tests/integration/vscode/tsconfig.json.mdmd.md to targets matching '.mdmd/layer-3/**/*.mdmd.md' MDMD layer '3' (observed 0).
```

*Viewed [live-documentation-server.mdmd.md](file:///d:/Projects/Live-Documentation/.mdmd/layer-3/live-documentation-server.mdmd.md) *

*Viewed [live-documentation-extension.mdmd.md](file:///d:/Projects/Live-Documentation/.mdmd/layer-3/live-documentation-extension.mdmd.md) *

*User accepted the command `type audit.log | Select-String "must-have-l3-parent" | Select-String "packages/extension" -Context 0,1`*

*Checked command status*

*User accepted the command `Test-Path d:\Projects\Live-Documentation\.mdmd\layer-4\packages\extension\src\commands\analyzeWithAI.test.ts.mdmd.md`*

*Searched filesystem*

*Searched filesystem*

### User Input

You seem to query the older `audit.log` a lot but that artifact isn't being updated by you to the best of my knowledge?

*User accepted the command `npm run graph:audit > audit.log`*

### User Input

New audit log file write complete. Youa re clear to proceed.

*User accepted the command `type audit.log | Select-String "layer4-orphans" -Context 0,1 | Select-String "expected" -Context 0,1`*

*Viewed [task.md](file:///C:/Users/User/.gemini/antigravity/brain/a040f9e7-b254-49e0-b13e-098b3caa76b9/task.md) *

*Checked command status*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*User accepted the command `npm run graph:audit > audit.log`*

*Checked command status*

### User Input

New audit log generated once more. Please continue.