# Where the PowerShell grammar fails on dbatools and AL-Go

Current as of November 19, 2026. This is for the builder who takes the engine's PowerShell grammar (`packages/engine/grammars/powershell`). It lists every file of the two corpora that the grammar cannot read in full, at the first place it fails, with the idiom that breaks it there where the line tells: 112 of 1,793 files in dbatools and 78 of 198 in AL-Go.

PowerShell 7.7's own parser reads every one of these files without an error.

**How the failing place and the idiom were found.** The failing place is the grammar's first error node, followed down to the deepest. An idiom is named when one of the known patterns stands on that line or on the two before it, so a name is a strong hint, not a proof.

**Checked one at a time:**
- **An attribute on an assignment:** `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('…', '…', Justification = '…')]` on the line before `$x = …`. This accounts for 43 of AL-Go's 78.
- **`./script.ps1`,** a script run by a path. The grammar reads it, without an error, as the dot-source `. /script.ps1`, so it appears in no row here. It costs tSQLt five loads and costs the wires fixture its one measured miss.

**"Not told by the line"** rows name the line only. In several dbatools tests that line is a `Mock` or an `It` that parses on its own, so the cause lies earlier in the file. One such file, `tests/Copy-DbaPolicyManagement.Tests.ps1`, is read with lines 1 to 173 in one error node. Its test stubs (`Write-Message`, `Connect-DbaInstance`, `New-Object`) therefore stood at the file's own level. Until the adapter stopped counting a definition inside unread text, they drew 562 false wires.

### dbatools: 112 of 1793 files

| File | First failing line | Idiom | That line |
|---|---:|---|---|
| `.github/runners/bootstrap-runner.ps1` | 249 | a numeric multiplier (`1MB`, `10KB`) | `if ($partitionMax - $partitionNow -gt 1GB) {` |
| `.github/runners/controller/Modules/FleetCore/FleetCore.psm1` | 24 | a class deriving from a .NET type | `class TransientFleetException : System.Exception {` |
| `.github/runners/debug.ps1` | 56 | not told by the line | `gh api "repos/$Repo/actions/runners?per_page=100" --jq ".runners[] \| .name + \"  \" + .sta` |
| `.github/runners/deploy-controller.ps1` | 120 | a numeric multiplier (`1MB`, `10KB`) | `Write-Host "packaged $([math]::Round((Get-Item -Path $zipPath).Length / 1KB)) KB from $sta` |
| `.github/runners/image-scripts/step1-tools.ps1` | 133 | a numeric multiplier (`1MB`, `10KB`) | `Get-PSDrive -Name C \| ForEach-Object { "C: free $([math]::Round($_.Free / 1GB, 1)) GB" }` |
| `.github/runners/image-scripts/step2-sqlinstance.ps1` | 40 | a numeric multiplier (`1MB`, `10KB`) | `if ($partitionMax - $partitionNow -gt 1GB) {` |
| `.github/runners/phase0/install-runner.ps1` | 46 | a numeric multiplier (`1MB`, `10KB`) | `"downloaded $([math]::Round((Get-Item -Path $zipPath).Length / 1MB, 1)) MB in $([int]$stop` |
| `.github/runners/phase0/inventory.ps1` | 35 | a numeric multiplier (`1MB`, `10KB`) | `"$($_.DeviceID) $([math]::Round($_.FreeSpace / 1GB, 1)) GB free of $([math]::Round($_.Size` |
| `.github/runners/reconcile-runner-fleet.ps1` | 16 | a class deriving from a .NET type | `class TransientFleetException : System.Exception {` |
| `.github/runners/tests/bootstrap-runner.Tests.ps1` | 99 | not told by the line | `Mock Get-Service { }` |
| `.github/runners/tests/fleet-controller.Tests.ps1` | 738 | not told by the line | `Mock Invoke-FleetReconcile { }` |
| `.github/scripts/gh-actions-repl-3.ps1` | 55 | not told by the line | `#>` |
| `private/configurations/settings/assets.ps1` | 6 | not told by the line | `Set-DbatoolsConfig -FullName 'assets.sqlbuildreference' -Value 'https://dataplat.github.io` |
| `private/configurations/settings/azure.ps1` | 2 | not told by the line | `Set-DbatoolsConfig -FullName 'azure.tenantid' -Value $null -Initialize -Validation string ` |
| `private/configurations/settings/paths.ps1` | 49 | not told by the line | `Set-DbatoolsConfig -FullName 'Path.DbatoolsData' -Value (Join-DbaPath $script:AppData "Pow` |
| `private/configurations/settings/sql.ps1` | 5 | not told by the line | `Set-DbatoolsConfig -FullName 'sql.connection.database' -Value $null -Initialize -Validatio` |
| `private/functions/Convert-DbaTimelineStatusColor.ps1` | 51 | a `switch` label in double quotes with a space | `"In Progress" { "#00CCFF" }` |
| `private/functions/Get-SqlDefaultPaths.ps1` | 28 | not told by the line | `switch ($filetype) { "mdf" { $filetype = "data" } "ldf" { $filetype = "log" } }` |
| `private/functions/New-DbaLogShippingPrimaryDatabase.ps1` | 209 | `switch` as an expression (`$x = switch ...`) | `$MonitorServerSecurityMode = switch ($MonitorServerSecurityMode) { "WINDOWS" { 1 } "SQLSER` |
| `private/functions/New-DbaLogShippingSecondaryDatabase.ps1` | 173 | `switch` as an expression (`$x = switch ...`) | `$RestoreMode = switch ($RestoreMode) { "NoRecovery" { 0 }  "Standby" { 1 } }` |
| `private/functions/New-DbaLogShippingSecondaryPrimary.ps1` | 240 | `switch` as an expression (`$x = switch ...`) | `$MonitorServerSecurityMode = switch ($MonitorServerSecurityMode) { "WINDOWS" { 1 } "SQLSER` |
| `public/Add-DbaAgReplica.ps1` | 236 | a `switch` label in double quotes with a space | `"Read-intent only" { "AllowReadIntentConnectionsOnly" }` |
| `public/Add-DbaExtendedProperty.ps1` | 174 | a method call followed by a member, as a command argument | `Add-Member -Force -InputObject $prop -MemberType NoteProperty -Name Type -Value $object.Ge` |
| `public/Backup-DbaDatabase.ps1` | 993 | not told by the line | `$FileList += $Headerinfo.FileList \| Where-Object { $_.FileType -eq "D" } \| Select-Object F` |
| `public/Connect-DbaInstance.ps1` | 1194 | a nested type name (`[Outer+Inner]`) | `$sqlConnectionInfo.Authentication = [Microsoft.SqlServer.Management.Common.SqlConnectionIn` |
| `public/ConvertTo-DbaTimeline.ps1` | 186 | not told by the line | `$data = $InputObject \| Select-Object @{ Name = "SqlInstance"; Expression = { $_.SqlInstanc` |
| `public/Copy-DbaDbMail.ps1` | 171 | not told by the line | `[cmdletbinding(SupportsShouldProcess)]` |
| `public/Copy-DbaDbTableData.ps1` | 460 | `switch -regex` / `-wildcard` / `-exact` / `-casesensitive` / `-file` | `"^(Binary\|Char\|NChar\|NVarChar\|VarBinary\|VarChar)$" {` |
| `public/Export-DbaCsv.ps1` | 443 | a numeric multiplier (`1MB`, `10KB`) | `FileSizeMB      = if ($fileInfo) { [math]::Round($fileInfo.Length / 1MB, 2) } else { 0 }` |
| `public/Export-DbaReplServerSetting.ps1` | 133 | a backtick continuation inside parentheses | `$out = $repserver.Script([Microsoft.SqlServer.Replication.ScriptOptions]::Creation '` |
| `public/Find-DbaInstance.ps1` | 644 | not told by the line | `$entry = New-Object -TypeName System.DirectoryServices.DirectoryEntry -ArgumentList "LDAP:` |
| `public/Get-DbaAgentServer.ps1` | 131 | not told by the line | `Add-Member -Force -InputObject $jobServer -MemberType ScriptProperty -Name JobHistoryIsEna` |
| `public/Get-DbaBackupInformation.ps1` | 393 | a `switch` label in double quotes with a space | `"Database Differential" { "Differential" }` |
| `public/Get-DbaClientProtocol.ps1` | 106 | not told by the line | `$prot \| Add-Member -Force -MemberType ScriptProperty -Name IsEnabled -Value { switch ( $th` |
| `public/Get-DbaCmObject.ps1` | 311 | a labelled loop or a `break`/`continue` to a label | `continue main` |
| `public/Get-DbaDatabase.ps1` | 411 | `-cin` / `-cnotin` / `-iin` / `-inotin` | `if ($dt.name -cnotin $foundNames) {` |
| `public/Get-DbaDbLogSpace.ps1` | 162 | a numeric multiplier (`1MB`, `10KB`) | `LogSize             = [dbasize]($ls.'Log Size (MB)' * 1MB)` |
| `public/Get-DbaDbMailProfile.ps1` | 139 | a method call followed by a member, as a command argument | `$prof \| Add-Member -Force -MemberType NoteProperty -Name MailAccount -Value $prof.EnumAcco` |
| `public/Get-DbaExtendedProperty.ps1` | 155 | a method call followed by a member, as a command argument | `Add-Member -Force -InputObject $prop -MemberType NoteProperty -Name Type -Value $object.Ge` |
| `public/Get-DbaExtendedProtection.ps1` | 135 | a `switch` inside a sub-expression in a string | `ExtendedProtection = "$extendedProtection - $(switch ($extendedProtection) { 0 { "Off" } 1` |
| `public/Get-DbaNetworkActivity.ps1` | 105 | a numeric multiplier (`1MB`, `10KB`) | `$NICs \| Add-Member -Force -MemberType ScriptProperty -Name Bandwith -Value { switch ( $thi` |
| `public/Get-DbaNetworkConfiguration.ps1` | 259 | `switch` as an expression (`$x = switch ...`) | `$extendedProtection = switch ((Get-ItemProperty -Path $regPath -Name ExtendedProtection).E` |
| `public/Get-DbaService.ps1` | 267 | a `switch` inside a sub-expression in a string | `Add-Member -Force -InputObject $service -MemberType NoteProperty -Name State -Value $(swit` |
| `public/Get-DbaWsfcDisk.ps1` | 86 | a numeric multiplier (`1MB`, `10KB`) | `Size            = [dbasize]($diskpart.TotalSize * 1MB)` |
| `public/Get-DbaXESession.ps1` | 122 | `switch` as an expression (`$x = switch ...`) | `$status = switch ($x.IsRunning) { $true { "Running" } $false { "Stopped" } }` |
| `public/Get-DbaXESessionTarget.ps1` | 125 | `switch` as an expression (`$x = switch ...`) | `$status = switch ($xsession.IsRunning) { $true { "Running" } $false { "Stopped" } }` |
| `public/Import-DbatoolsConfig.ps1` | 140 | a labelled loop or a `break`/`continue` to a label | `continue element` |
| `public/Install-DbaInstance.ps1` | 409 | not told by the line | `"^\[(.+)\]\s*$" {` |
| `public/Invoke-DbaDbLogShipping.ps1` | 1719 | `switch` as an expression (`$x = switch ...`) | `"SQLSERVER" { 0 } "WINDOWS" { 1 } default { 1 }` |
| `public/New-DbaAgentJob.ps1` | 205 | `switch` as an expression (`$x = switch ...`) | `"Never" { 0 } "OnSuccess" { 1 } "OnFailure" { 2 } "Always" { 3 }` |
| `public/New-DbaAvailabilityGroup.ps1` | 435 | a `switch` label in double quotes with a space | `"Read-intent only" { "AllowReadIntentConnectionsOnly" }` |
| `public/New-DbaAzAccessToken.ps1` | 237 | not told by the line | `$cred = New-Object Microsoft.IdentityModel.Clients.ActiveDirectory.ClientCredential -Argum` |
| `public/Reset-DbaAdmin.ps1` | 321 | a string followed directly by a variable (`"text"$value`) | `$netstart = net start ""$displayName"" /mReset-DbaAdmin 2>&1` |
| `public/Save-DbaCommunitySoftware.ps1` | 356 | a labelled loop or a `break`/`continue` to a label | `continue softwareLoop` |
| `public/Set-DbaAgReplica.ps1` | 211 | a `switch` label in double quotes with a space | `"Read-intent only" { "AllowReadIntentConnectionsOnly" }` |
| `public/Set-DbaAgentJob.ps1` | 248 | `switch` as an expression (`$x = switch ...`) | `$EventLogLevel = switch ($EventLogLevel) { "Never" { 0 } "OnSuccess" { 1 } "OnFailure" { 2` |
| `public/Set-DbaAgentServer.ps1` | 251 | `switch` as an expression (`$x = switch ...`) | `$AgentMailType = switch ($AgentMailType) { "SqlAgentMail" { 0 } "DatabaseMail" { 1 } }` |
| `public/Set-DbaDbCompression.ps1` | 334 | `switch` as an expression (`$x = switch ...`) | `IndexType                     = Switch ($obj.HasHeapIndex) { $false { "ClusteredIndex" } $` |
| `public/Set-DbaExtendedProtection.ps1` | 111 | `switch` as an expression (`$x = switch ...`) | `$Value = switch ($Value) { "Off" { 0 } "Allowed" { 1 } "Required" { 2 } }` |
| `public/Test-DbaBuild.ps1` | 194 | not told by the line | `[CmdletBinding()]` |
| `public/Test-DbaCmConnection.ps1` | 292 | a labelled loop or a `break`/`continue` to a label | `break types` |
| `public/Test-DbaDbLogShipStatus.ps1` | 297 | `switch` as an expression (`$x = switch ...`) | `InstanceType          = switch ($result.IsPrimary) { $true { "Primary Instance" } $false {` |
| `public/Test-DbaDiskAlignment.ps1` | 308 | a numeric multiplier (`1MB`, `10KB`) | `PartitionSize           = [DbaSize]($($partition.Size / 1MB) * 1024 * 1024)` |
| `tests/Add-DbaAgDatabase.Tests.ps1` | 76 | not told by the line | `Mock Copy-DbaDbCertificate { }` |
| `tests/Compare-DbaDbSchema.Tests.ps1` | 55 | not told by the line | `Add-Member -InputObject $process -MemberType ScriptMethod -Name WaitForExit -Value {` |
| `tests/Compare-DbaLogin.Tests.ps1` | 43 | not told by the line | `Mock Stop-Function { }` |
| `tests/Connect-DbaInstance.Tests.ps1` | 141 | not told by the line | `Mock Add-ConnectionHashValue { } -ModuleName dbatools` |
| `tests/Copy-DbaPolicyManagement.Tests.ps1` | 132 | not told by the line | `$mockDestinationPolicies \| Add-Member -Force -MemberType ScriptMethod -Name Refresh -Value` |
| `tests/Copy-DbaXESessionTemplate.Tests.ps1` | 38 | not told by the line | `# We don't remove the templates as they might be useful for the user` |
| `tests/Expand-DbaDbLogFile.Tests.ps1` | 48 | not told by the line | `$script:mockLogFile \| Add-Member -MemberType ScriptMethod -Name Refresh -Value { }` |
| `tests/Export-DbaCredential.Tests.ps1` | 31 | not told by the line | `Mock Test-ExportDirectory { } -ModuleName dbatools` |
| `tests/Export-DbaDacPackage.Tests.ps1` | 37 | not told by the line | `Mock Test-ExportDirectory { }` |
| `tests/Export-DbaLinkedServer.Tests.ps1` | 32 | not told by the line | `Mock Test-ExportDirectory { } -ModuleName dbatools` |
| `tests/Export-DbaScript.Tests.ps1` | 32 | not told by the line | `Mock Test-ExportDirectory { } -ModuleName dbatools` |
| `tests/Export-DbaUser.Tests.ps1` | 45 | not told by the line | `Mock Stop-Function { }` |
| `tests/Find-DbaDatabase.Tests.ps1` | 73 | not told by the line | `$results = Find-DbaDatabase -SqlInstance $TestConfig.InstanceMulti2 -Property ServiceBroke` |
| `tests/Find-DbaInstance.Tests.ps1` | 62 | not told by the line | `Add-Member -InputObject $udpClient -MemberType ScriptMethod -Name Close -Value {` |
| `tests/Get-DbaAgRingBuffer.Tests.ps1` | 134 | not told by the line | `TimeStamp = [long]$this.ConnectionContext.ExecuteScalar("SELECT ms_ticks FROM sys.dm_os_sy` |
| `tests/Get-DbaBuild.Tests.ps1` | 159 | not told by the line | `Mock Update-DbaBuildReference -ModuleName dbatools -MockWith { }` |
| `tests/Get-DbaDatabase.Tests.ps1` | 217 | not told by the line | `#  Import-Module $Base\..\dbatools.psd1` |
| `tests/Get-DbaDbCompression.Tests.ps1` | 59 | a method call followed by a member, as a command argument | `$results.DatabaseId \| Get-Unique \| Should -Be $server.Query("SELECT database_id FROM sys.d` |
| `tests/Get-DbaKbUpdate.Tests.ps1` | 29 | not told by the line | `Mock -CommandName Invoke-WebRequest -ModuleName dbatools -MockWith { }` |
| `tests/Get-DbaLastBackup.Tests.ps1` | 48 | not told by the line | `Mock Get-DbaDbBackupHistory { }` |
| `tests/Get-DbaNetworkEncryption.Tests.ps1` | 66 | not told by the line | `Add-Member -InputObject $stream -MemberType ScriptMethod -Name Dispose -Value {` |
| `tests/Get-DbaReplSubscription.Tests.ps1` | 30 | not told by the line | `Mock Add-ReplicationLibrary { }` |
| `tests/Get-DbaTcpPort.Tests.ps1` | 29 | not told by the line | `$resultsIpv6 = Get-DbaTcpPort -SqlInstance $TestConfig.InstanceSingle -All -ExcludeIpv6` |
| `tests/Import-DbaCsv.Tests.ps1` | 125 | not told by the line | `$results = $pathSuperSmall \| Import-DbaCsv -SqlInstance $TestConfig.InstanceMulti1 -Databa` |
| `tests/Import-DbaParquet.Tests.ps1` | 165 | not told by the line | `$result = Import-DbaParquet -Path $pathMixedTypes -SqlInstance $TestConfig.InstanceMulti1 ` |
| `tests/Install-DbaInstance.Tests.ps1` | 69 | not told by the line | `Mock -CommandName Set-DbaPrivilege -ModuleName dbatools -MockWith { }` |
| `tests/Install-DbaSqlPackage.Tests.ps1` | 38 | not told by the line | `# and safe to leave installed for other tests` |
| `tests/Invoke-DbaAdvancedInstall.Tests.ps1` | 49 | not told by the line | `Mock -CommandName Set-DbaPrivilege -ModuleName dbatools -MockWith { }` |
| `tests/Invoke-DbaAdvancedRestore.Tests.ps1` | 90 | not told by the line | `Add-Member -InputObject $script:mockServer.ConnectionContext -Name Disconnect -MemberType ` |
| `tests/Invoke-DbaDbDataGenerator.Tests.ps1` | 140 | a method call followed by a member, as a command argument | `Set-Content -Path $junkTypeConfigPath -Value $configTemplate.Replace("__MASKINGTYPE__", "L` |
| `tests/Invoke-DbaDbDataMasking.Tests.ps1` | 159 | not told by the line | `Mock Write-ProgressHelper { } -ModuleName dbatools` |
| `tests/Invoke-DbaDbTransfer.Tests.ps1` | 102 | a method call followed by a member, as a command argument | `$db.Query("select id from dbo.transfer_test").id \| Should -BeIn $db2.Query("select id from` |
| `tests/Invoke-DbaDbUpgrade.Tests.ps1` | 97 | a method call followed by a member, as a command argument | `$upgradeResult.OriginalCompatibility \| Should -Be $previousCompatibility.ToString().Replac` |
| `tests/Invoke-DbatoolsFormatter.Tests.ps1` | 86 | not told by the line | `# No additional cleanup needed as TestDrive handles temporary file cleanup` |
| `tests/New-DbaDbMailAccount.Tests.ps1` | 37 | not told by the line | `Mock Stop-Function { }` |
| `tests/New-DbaDbTransfer.Tests.ps1` | 150 | a method call followed by a member, as a command argument | `$transfer.DestinationPassword \| Should -Be $creds.GetNetworkCredential().Password` |
| `tests/New-DbaFirewallRule.Tests.ps1` | 82 | not told by the line | `Mock Invoke-Command2 { }` |
| `tests/New-DbaLogin.Tests.ps1` | 72 | not told by the line | `Add-Member -InputObject $script:pendingLogin -Name Refresh -MemberType ScriptMethod -Value` |
| `tests/Remove-DbaAgentJobSchedule.Tests.ps1` | 140 | not told by the line | `Mock Stop-Function { }` |
| `tests/Restore-DbaDatabase.Tests.ps1` | 1232 | not told by the line | `$results = Restore-DbaDatabase -SqlInstance $TestConfig.InstanceSingle -WithReplace -Datab` |
| `tests/Set-DbaDbMailAccount.Tests.ps1` | 37 | not told by the line | `Mock Stop-Function { }` |
| `tests/Set-DbaMaxDop.Tests.ps1` | 29 | not told by the line | `Mock Stop-Function { } -ModuleName dbatools` |
| `tests/Test-DbaAgPolicyState.Tests.ps1` | 85 | not told by the line | `$availabilityGroup \| Add-Member -Force -MemberType ScriptMethod -Name Refresh -Value { }` |
| `tests/Test-DbaDbCompatibility.Tests.ps1` | 27 | not told by the line | `# No specific setup needed for this command` |
| `tests/Test-DbaDbOwner.Tests.ps1` | 260 | not told by the line | `}` |
| `tests/Test-DbaLastBackup.Tests.ps1` | 56 | not told by the line | `Add-Member -InputObject $script:mockDatabases -Name Refresh -MemberType ScriptMethod -Valu` |
| `tests/Test-DbaMaxMemory.Tests.ps1` | 63 | not told by the line | `Mock Get-DbaMaxMemory -MockWith { }` |
| `tests/Update-DbaInstance.Tests.ps1` | 96 | not told by the line | `Mock -CommandName Initialize-CredSSP -ModuleName dbatools -MockWith { }` |
| `tests/appveyor.common.ps1` | 371 | not told by the line | `Get-Item $returnValue.GetEnumerator().Name` |

### al-go: 78 of 198 files

| File | First failing line | Idiom | That line |
|---|---:|---|---|
| `Actions/AL-Go-Helper.ps1` | 26 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Actions/AnalyzeTests/TestResultAnalyzer.ps1` | 68 | a class constructor or method parameter with a default value | `FailureNode([bool]$isLeaf = $false) {` |
| `Actions/BuildPowerPlatform/BuildPowerPlatform.ps1` | 38 | a string followed directly by a variable (`"text"$value`) | `Write-Host "Number of Business Central Power App connections found: "$currentPowerAppSetti` |
| `Actions/CheckForUpdates/CheckForUpdates.HelperFunctions.ps1` | 755 | a `switch` label in double quotes with a space | `"AppSource App" {` |
| `Actions/CreateReleaseNotes/CreateReleaseNotes.ps1` | 48 | not told by the line | `$compareResult = CompareSemVerStrs -semVerStr1 $tag_name -semVerStr2 $latestReleaseTag` |
| `Actions/DeployPowerPlatform/DeterminePowerPlatformSolutionFolder.ps1` | 11 | a string followed directly by a variable (`"text"$value`) | `Write-Host "Power Platform solution file:"$filePath` |
| `Actions/DetermineProjectsToBuild/DetermineProjectsToBuild.Action.ps1` | 80 | a generic type with bracketed arguments (`[Dictionary[[String], [String]]]`) | `$additionalDataForTelemetry = [System.Collections.Generic.Dictionary[[System.String], [Sys` |
| `Actions/DetermineProjectsToBuild/DetermineProjectsToBuild.psm1` | 505 | a generic type with bracketed arguments (`[Dictionary[[String], [String]]]`) | `$additionalDataForTelemetry = [System.Collections.Generic.Dictionary[[System.String], [Sys` |
| `Actions/GetWorkflowMultiRunBranches/GetWorkflowMultiRunBranches.ps1` | 39 | not told by the line | `$allBranches = @(invoke-git -returnValue for-each-ref --format="%(refname:short)" refs/rem` |
| `Actions/Invoke-AlGoAction.ps1` | 9 | a generic type with bracketed arguments (`[Dictionary[[String], [String]]]`) | `[System.Collections.Generic.Dictionary[[System.String], [System.String]]] $AdditionalData ` |
| `Actions/MarkDownHelper.psm1` | 28 | a jagged array type (`[string[][]]`) | `[string[][]] $Rows` |
| `Actions/ReviewAgent/ReviewAgent.ps1` | 256 | a method call followed by a member, as a command argument | `Write-ReviewOutput -Name eligible -Value $eligible.ToString().ToLowerInvariant()` |
| `Actions/ReviewAgent/scripts/CommentPublishing.ps1` | 6 | not told by the line | `$normalized = ($Value ?? '').Trim().ToLowerInvariant().Replace('_', '-').Replace(' ', '-')` |
| `Actions/ReviewAgent/scripts/FindingDeduplication.ps1` | 17 | not told by the line | `$normalized = ((($FilePath ?? '') -replace '\\', '/') -replace '^/', '')` |
| `Actions/ReviewAgent/scripts/GitHub.ps1` | 90 | not told by the line | `$normalized = (($ServerUrl ?? '') + '').Trim().TrimEnd('/')` |
| `Actions/ReviewAgent/scripts/Invoke-CopilotPRReview.psm1` | 108 | not told by the line | `$GitHubServerUrl  = (($env:GITHUB_SERVER_URL ?? 'https://github.com') + '').Trim().TrimEnd` |
| `Actions/ReviewAgent/scripts/LoggingAndValidation.ps1` | 9 | not told by the line | `$script:IsGitHubActions = (($env:GITHUB_ACTIONS ?? '') -eq 'true')` |
| `Actions/ReviewAgent/scripts/ReportParsing.ps1` | 45 | not told by the line | `$fromSub = ($fromSub ?? '').Trim()` |
| `Actions/ReviewAgent/scripts/ReviewExecution.ps1` | 126 | `-cin` / `-cnotin` / `-iin` / `-inotin` | `if ($finding.severity -cin @('blocker', 'major')) {` |
| `Actions/TelemetryHelper.psm1` | 104 | a generic type with bracketed arguments (`[Dictionary[[String], [String]]]`) | `[System.Collections.Generic.Dictionary[[System.String], [System.String]]] $Data = @{},` |
| `Actions/WorkflowPostProcess/WorkflowPostProcess.ps1` | 59 | a generic type with bracketed arguments (`[Dictionary[[String], [String]]]`) | `[System.Collections.Generic.Dictionary[[System.String], [System.String]]] $AdditionalData ` |
| `Internal/Deploy.ps1` | 37 | not told by the line | `$branchName = "deploy/$BaseBranch/$((Get-Date).ToUniversalTime().ToString('"yyMMddHHmmss'"` |
| `Internal/Scripts/RemoveTempRepos.ps1` | 18 | not told by the line | `invoke-gh repo delete "https://github.com/$repo" --yes \| Out-Host` |
| `Tests/AL-Go-Helper.Test.ps1` | 34 | not told by the line | `Mock Write-Host { }` |
| `Tests/AddExistingApp.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/AlToolTestRunner.Test.ps1` | 470 | not told by the line | `Mock -ModuleName AlToolTestRunner OutputDebug {}` |
| `Tests/AnalyzeTests.Test.ps1` | 45 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/Authenticate.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/BuildPowerPlatform.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/BuildReferenceDocumentation.Action.Test.ps1` | 13 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/CalculateArtifactNames.Test.ps1` | 11 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/CheckForUpdates.Action.Test.ps1` | 11 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/CompileFromWorkspace.Test.ps1` | 457 | not told by the line | `Mock New-WorkspaceFromFolders { } -ModuleName CompileFromWorkspace` |
| `Tests/CreateApp.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/CreateDevelopmentEnvironment.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/CreateReleaseNotes.Test.ps1` | 14 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/Deliver.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/Deliver.Module.Test.ps1` | 15 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/Deploy.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/Deploy.Module.Test.ps1` | 43 | not told by the line | `Mock OutputGroupStart { }` |
| `Tests/DetermineArtifactUrl.Test.ps1` | 68 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/DetermineArtifactsForRelease.Test.ps1` | 17 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/DetermineBuildProject.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/DetermineDeliveryTargets.Test.ps1` | 8 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/DetermineDeploymentEnvironments.Test.ps1` | 9 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/DetermineProjectsToBuild.Test.ps1` | 12 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/DownloadPreviousRelease.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/DownloadProjectDependencies.Test.ps1` | 16 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/GetWorkflowMultiRunBranches.Test.ps1` | 9 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/GitHub-Helper.Test.ps1` | 11 | not told by the line | `Mock Start-Sleep -ModuleName Github-Helper {}` |
| `Tests/IncrementVersionNumber.Action.Test.ps1` | 11 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/PipelineCleanup.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/ProcessALCodeAnalysisLogs.Test.ps1` | 11 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/PullRequestStatusCheck.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/ReadPowerPlatformSettings.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/ReadSecrets.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/ReadSettings.Action.Test.ps1` | 11 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/ReadSettings.Test.ps1` | 6 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/ResolveProjectFolders.Test.ps1` | 5 | not told by the line | `Mock Write-Host { }` |
| `Tests/ReviewAgent.Action.Test.ps1` | 342 | not told by the line | `Mock Import-Module {}` |
| `Tests/ReviewAgent/Invoke-CopilotPRReview.Metrics.Tests.ps1` | 384 | not told by the line | `Mock Start-Sleep {}` |
| `Tests/ReviewAgent/Invoke-CopilotPRReview.Tests.ps1` | 260 | not told by the line | `{ [bool]($location.inferred ?? $false) } \| Should -Not -Throw` |
| `Tests/RunPipeline.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/RunTests.Action.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/RunTests.Test.ps1` | 17 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/Sign.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/TelemetryHelper.Test.ps1` | 11 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/Troubleshooting.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/UnpublishOldAppVersions.Test.ps1` | 14 | not told by the line | `Mock OutputDebugFunctionCall { }` |
| `Tests/ValidateWorkflowInput.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/VerifyPRChanges.Action.Test.ps1` | 11 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/WorkflowInitialize.Test.ps1` | 10 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/WorkflowPostProcess.Test.ps1` | 11 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `Tests/WorkflowSanitation/WorkflowFileContent.Test.ps1` | 123 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `e2eTests/Test-Functions.ps1` | 123 | an attribute on an assignment (`[SuppressMessageAttribute(…)]` then `$x = …`) | `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments',` |
| `e2eTests/e2eTestHelper.psm1` | 270 | not told by the line | `gh api --method POST /repos/$repository/actions/runs/$($run.id)/cancel \| Out-Null` |
| `e2eTests/scenarios/CustomTemplate/runtest.ps1` | 266 | a method call followed by a member, as a command argument | `Get-ContentLF -Path (Join-Path (Get-Location) $customWorkflowfileRelativePath) \| Should -B` |
| `e2eTests/scenarios/FederatedCredentials/runtest.ps1` | 128 | not told by the line | `$artifacts = gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 202` |
