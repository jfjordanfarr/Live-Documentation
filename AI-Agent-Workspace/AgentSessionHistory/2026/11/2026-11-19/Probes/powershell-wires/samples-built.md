# Every wire of the second sample

Current as of November 19, 2026. These are the rows behind the second sample in [the probe](README.md#built-the-roots-rulings-and-what-the-build-found-added-november-19-2026-evening).

- **What was drawn.** Sixty wires the built adapter draws, thirty on dbatools and thirty on AL-Go, drawn with the seed `2026-11-19-built`.
- **Who judged.** Each wire was read in the source by me and by a second judge, a general-purpose subagent of my tier given the corpora and the list only.
- **In what order.** I wrote my verdicts before opening its file, and its hand-back carried none.
- **The verdicts.** **T** true, **A** arguable; no wire was judged false. The two verdicts agree on every row.

| # | Corpus | From | To | What | Mine | Theirs | Why (A), mine; theirs |
|---|---|---|---|---|---|---|---|
| 1 | dbatools | `tests/Set-DbaDbSequence.Tests.ps1` | `public/Set-DbaDbSequence.ps1` | calls Set-DbaDbSequence | T | T |  |
| 2 | dbatools | `public/Set-DbaResourceGovernor.ps1` | `public/Get-DbaResourceGovernor.ps1` | calls Get-DbaResourceGovernor | T | T |  |
| 3 | dbatools | `public/Get-DbaRegServer.ps1` | `private/functions/Get-RegServerGroupReverseParse.ps1` | calls Get-RegServerGroupReverseParse | T | T |  |
| 4 | dbatools | `tests/Get-DbaUnusedLogin.Tests.ps1` | `public/Get-DbaUnusedLogin.ps1` | calls Get-DbaUnusedLogin | T | T |  |
| 5 | dbatools | `dbatools.psm1` | `public/Set-DbaDbOwner.ps1` | a load | T | T |  |
| 6 | dbatools | `tests/Sync-DbaLoginPermission.Tests.ps1` | `public/New-DbaDbUser.ps1` | calls New-DbaDbUser | T | T |  |
| 7 | dbatools | `tests/Select-DbaDbSequenceNextValue.Tests.ps1` | `public/Connect-DbaInstance.ps1` | calls Connect-DbaInstance | T | T |  |
| 8 | dbatools | `public/Get-DbaReplArticle.ps1` | `public/Get-DbaReplPublication.ps1` | calls Get-DbaReplPublication | T | T |  |
| 9 | dbatools | `tests/Invoke-DbaDbccDropCleanBuffer.Tests.ps1` | `public/Invoke-DbaDbccDropCleanBuffer.ps1` | calls Invoke-DbaDbccDropCleanBuffer | T | T |  |
| 10 | dbatools | `dbatools.psm1` | `public/Get-DbaBackupDevice.ps1` | a load | T | T |  |
| 11 | dbatools | `tests/Dismount-DbaDatabase.Tests.ps1` | `public/New-DbaDatabase.ps1` | calls New-DbaDatabase | T | T |  |
| 12 | dbatools | `public/Get-DbaBuild.ps1` | `private/functions/flowcontrol/Test-FunctionInterrupt.ps1` | calls Test-FunctionInterrupt | T | T |  |
| 13 | dbatools | `dbatools.psm1` | `private/functions/Set-FileSystemSetting.ps1` | a load | T | T |  |
| 14 | dbatools | `dbatools.psm1` | `public/Remove-DbaDbMailProfile.ps1` | a load | T | T |  |
| 15 | dbatools | `dbatools.psm1` | `public/Get-DbaReplArticleColumn.ps1` | a load | T | T |  |
| 16 | dbatools | `tests/Import-DbaCsv.Tests.ps1` | `public/Get-DbaDbTable.ps1` | calls Get-DbaDbTable | T | T |  |
| 17 | dbatools | `private/dynamicparams/mailserver.ps1` | `private/functions/tabcompletion/Register-DbaTeppScriptBlock.ps1` | calls Register-DbaTeppScriptblock | T | T |  |
| 18 | dbatools | `public/New-DbaLinkedServer.ps1` | `private/functions/flowcontrol/Test-Bound.ps1` | calls Test-Bound | T | T |  |
| 19 | dbatools | `tests/Get-DbaAgReplica.Tests.ps1` | `public/Get-DbaEndpoint.ps1` | calls Get-DbaEndpoint | T | T |  |
| 20 | dbatools | `dbatools.psm1` | `public/Copy-DbaBackupDevice.ps1` | a load | T | T |  |
| 21 | dbatools | `tests/Connect-DbaInstance.WindowsSspi.Tests.ps1` | `public/Connect-DbaInstance.ps1` | calls Connect-DbaInstance | T | T |  |
| 22 | dbatools | `.github/scripts/gh-actions-repl-3.ps1` | `public/Get-DbaReplSubscription.ps1` | calls Get-DbaReplSubscription | T | T |  |
| 23 | dbatools | `public/Enable-DbaFilestream.ps1` | `public/Get-DbaWsfcNode.ps1` | calls Get-DbaWsfcNode | T | T |  |
| 24 | dbatools | `public/Test-DbaAgSpn.ps1` | `private/functions/flowcontrol/Test-Bound.ps1` | calls Test-Bound | T | T |  |
| 25 | dbatools | `tests/Get-DbaCmConnection.Tests.ps1` | `public/New-DbaCmConnection.ps1` | calls New-DbaCmConnection | T | T |  |
| 26 | dbatools | `dbatools.psm1` | `public/Get-DbaRunningJob.ps1` | a load | T | T |  |
| 27 | dbatools | `public/Install-DbaMaintenanceSolution.ps1` | `public/Get-DbaDbTable.ps1` | calls Get-DbaDbTable | T | T |  |
| 28 | dbatools | `public/Get-DbaXESession.ps1` | `private/functions/Select-DefaultView.ps1` | calls Select-DefaultView | T | T |  |
| 29 | dbatools | `tests/Get-DbaDbStoredProcedure.Tests.ps1` | `public/Connect-DbaInstance.ps1` | calls Connect-DbaInstance | T | T |  |
| 30 | dbatools | `public/Copy-DbaSystemDbUserObject.ps1` | `private/functions/flowcontrol/Test-FunctionInterrupt.ps1` | calls Test-FunctionInterrupt | T | T |  |
| 31 | al-go | `e2eTests/scenarios/IncludeDependencies/runtest.ps1` | `e2eTests/Workflows/RunTestCurrent.ps1` | calls RunTestCurrent | T | T |  |
| 32 | al-go | `e2eTests/e2eTestHelper.psm1` | `e2eTests/Workflows/RunPublishToEnvironment.ps1` | a load | T | T |  |
| 33 | al-go | `e2eTests/scenarios/IncludeDependencies/runtest.ps1` | `e2eTests/Workflows/RunTestNextMinor.ps1` | calls RunTestNextMinor | T | T |  |
| 34 | al-go | `e2eTests/Workflows/RunCICD.ps1` | `e2eTests/e2eTestHelper.psm1` | calls RunWorkflow | T | T |  |
| 35 | al-go | `Actions/RunPipeline/RunPipeline.ps1` | `Actions/AL-Go-Helper.ps1` | calls AnalyzeRepo, Assert-DockerIsRunning, CheckAppDependencyProbingPaths, ConvertTo-HashTable, DownloadAndImportBcContainerHelper, Get-ScriptOverrides, Get-VersionNumber, GetContainerName, OutputMessageAndArray | T | T |  |
| 36 | al-go | `Tests/WorkflowSanitation/WorkflowReferences.Test.ps1` | `Tests/TestActionsHelper.psm1` | calls GetWorkflowsInPath, TestActionsReferences, TestWorkflowReferences | T | T |  |
| 37 | al-go | `e2eTests/scenarios/CustomTemplate/runtest.ps1` | `Actions/CheckForUpdates/CheckForUpdates.HelperFunctions.ps1` | a load | T | T |  |
| 38 | al-go | `e2eTests/e2eTestHelper.psm1` | `e2eTests/Workflows/RunTestNextMajor.ps1` | a load | T | T |  |
| 39 | al-go | `Actions/ReviewAgent/ReviewAgent.ps1` | `Actions/ReviewAgent/scripts/Invoke-CopilotPRReview.ps1` | a load | T | T |  |
| 40 | al-go | `e2eTests/e2eTestHelper.psm1` | `e2eTests/Workflows/RunCreateTestApp.ps1` | a load | T | T |  |
| 41 | al-go | `Tests/CreateReleaseNotes.Test.ps1` | `Actions/AL-Go-Helper.ps1` | a load | T | T |  |
| 42 | al-go | `Actions/DownloadProjectDependencies/ComputeDependencyArtifactPattern.ps1` | `Actions/AL-Go-Helper.ps1` | calls ConvertTo-HashTable | T | T |  |
| 43 | al-go | `Tests/MarkdownLinks/AkaMSLinks.Test.ps1` | `Tests/TestActionsHelper.psm1` | calls GetRepoRoot | T | T |  |
| 44 | al-go | `e2eTests/Test-AL-Go.ps1` | `e2eTests/Workflows/RunCreateRelease.ps1` | calls RunCreateRelease | T | T |  |
| 45 | al-go | `Actions/CreateApp/AppHelper.psm1` | `Actions/AL-Go-Helper.ps1` | a load | T | T |  |
| 46 | al-go | `Actions/ReviewAgent/ReviewAgent.ps1` | `Actions/AL-Go-Helper.ps1` | calls ConvertTo-HashTable, GetPackageVersion | T | T |  |
| 47 | al-go | `Actions/CreateApp/CreateApp.ps1` | `Actions/Github-Helper.psm1` | calls Set-JsonContentLF | T | T |  |
| 48 | al-go | `e2eTests/scenarios/UseProjectDependencies/runtest.ps1` | `e2eTests/Test-Functions.ps1` | calls Test-ArtifactsFromRun | T | T |  |
| 49 | al-go | `Tests/Deliver.Module.Test.ps1` | `Actions/Deliver/Deliver.psm1` | calls Get-ProjectsInDeliveryOrder | T | T |  |
| 50 | al-go | `Tests/SetupBCQuality.Action.Test.ps1` | `Tests/TestActionsHelper.psm1` | calls GetActionScript, YamlTest | T | T |  |
| 51 | al-go | `Tests/SetupBCQuality.Action.Test.ps1` | `Actions/SetupBCQuality/SetupBCQuality.psm1` | calls Invoke-WithGitHubToken | T | T |  |
| 52 | al-go | `Tests/DetermineArtifactUrl.Test.ps1` | `Actions/AL-Go-Helper.ps1` | calls DetermineArtifactUrl, DownloadAndImportBcContainerHelper | T | T |  |
| 53 | al-go | `e2eTests/Test-AL-Go-Upgrade.ps1` | `Actions/CheckForUpdates/yamlclass.ps1` | a load | T | T |  |
| 54 | al-go | `Actions/CreateReleaseNotes/CreateReleaseNotes.ps1` | `Actions/AL-Go-Helper.ps1` | calls DownloadAndImportBcContainerHelper | T | T |  |
| 55 | al-go | `Tests/RunTests.Action.Test.ps1` | `Actions/RunTests/RunTests.ps1` | calls Get-TestRunnerContainerName, Get-TestRunnerCredential | T | T |  |
| 56 | al-go | `e2eTests/Test-AL-Go.ps1` | `e2eTests/Workflows/RunCreateApp.ps1` | calls RunCreateApp | T | T |  |
| 57 | al-go | `e2eTests/scenarios/CopilotCodeReview/runtest.ps1` | `Actions/AL-Go-Helper.ps1` | calls ConvertTo-HashTable, Get-PlainText | A | A | ConvertTo-HashTable (line 89) reaches AL-Go-Helper.ps1 through e2eTestHelper.psm1; Get-PlainText at line 11 is a parameter's default, evaluated before the script imports anything, so it reaches the definition only in a session that already loaded it, and E2E.yaml:304 passes every parameter; ConvertTo-HashTable (line 89) holds via the e2eTestHelper.psm1 import at line 46 (re-exports AL-Go-Helper functions); but Get-PlainText at line 11 is a param default, evaluated before that import. CI (.github/workflows/E2E.yaml:304) passes every parameter, so it never runs; locally it reaches whatever the session already has |
| 58 | al-go | `Tests/CreateReleaseNotes.Test.ps1` | `Tests/TestActionsHelper.psm1` | calls GetActionScript, YamlTest | T | T |  |
| 59 | al-go | `Actions/CreateApp/CreateApp.ps1` | `Actions/.Modules/DebugLogHelper.psm1` | calls OutputWarning | T | T |  |
| 60 | al-go | `Actions/AnalyzeTests/TestResultAnalyzer.ps1` | `Actions/TelemetryHelper.psm1` | calls Add-TelemetryProperty, Trace-Information | T | T |  |
