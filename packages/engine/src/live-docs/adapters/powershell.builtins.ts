/**
 * The commands PowerShell itself ships, by edition: every cmdlet and function of
 * the modules PowerShell installs with itself.
 *
 * A call whose name is one of these never wires to a workspace file merely by
 * that file being the only one that defines the name: a script that defines
 * such a function does so as a stand-in, often only on an older PowerShell
 * (dbatools' `opt/` back-ports), and the shipped command is what answers
 * elsewhere. A definition the caller loads still wins, as a function shadows a
 * cmdlet of the same name. Nothing else is listed.
 *
 * Sources, recorded on 2026-11-19:
 * - Windows PowerShell 5.1: Microsoft's reference, the command pages of every
 *   module under `reference/5.1` of MicrosoftDocs/PowerShell-Docs at commit
 *   `aedd8efe1fece22f04e478c2521c3fccc17ab03d`:
 *   CimCmdlets, ISE, Microsoft.PowerShell.Archive, Microsoft.PowerShell.Core,
 *   Microsoft.PowerShell.Diagnostics, Microsoft.PowerShell.Host,
 *   Microsoft.PowerShell.LocalAccounts, Microsoft.PowerShell.Management,
 *   Microsoft.PowerShell.ODataUtils, Microsoft.PowerShell.Operation.Validation,
 *   Microsoft.PowerShell.Security, Microsoft.PowerShell.Utility, Microsoft.WSMan.Management,
 *   PSDiagnostics, PSReadLine, PSScheduledJob, PSWorkflow, PSWorkflowUtility.
 *   Windows PowerShell 5.1 is frozen, so its list is fixed.
 * - PowerShell 7: `Get-Command -Module` over every module installed under
 *   `$PSHOME` by PowerShell 7.7.0 on Debian GNU/Linux 13 (trixie):
 *   Microsoft.PowerShell.Archive, Microsoft.PowerShell.Core, Microsoft.PowerShell.Host,
 *   Microsoft.PowerShell.Management, Microsoft.PowerShell.PSResourceGet,
 *   Microsoft.PowerShell.Security, Microsoft.PowerShell.ThreadJob, Microsoft.PowerShell.Utility,
 *   PackageManagement, PowerShellGet, PSReadLine.
 *   Its Windows-only modules are not installed there; their commands that
 *   Windows PowerShell 5.1 also ships are in the first list.
 */

/** Windows PowerShell 5.1's commands, 366. */
export const WINDOWS_POWERSHELL_51_COMMANDS: readonly string[] = [
  "Add-Computer", "Add-Content", "Add-History", "Add-JobTrigger", "Add-LocalGroupMember", "Add-Member",
  "Add-PSSnapin", "Add-Type", "Checkpoint-Computer", "Clear-Content", "Clear-EventLog", "Clear-History",
  "Clear-Host", "Clear-Item", "Clear-ItemProperty", "Clear-RecycleBin", "Clear-Variable", "Compare-Object",
  "Complete-Transaction", "Compress-Archive", "Connect-PSSession", "Connect-WSMan", "Convert-Path", "Convert-String",
  "ConvertFrom-Csv", "ConvertFrom-Json", "ConvertFrom-SddlString", "ConvertFrom-SecureString", "ConvertFrom-String",
  "ConvertFrom-StringData", "ConvertTo-Csv", "ConvertTo-Html", "ConvertTo-Json", "ConvertTo-SecureString",
  "ConvertTo-Xml", "Copy-Item", "Copy-ItemProperty", "Debug-Job", "Debug-Process", "Debug-Runspace",
  "Disable-ComputerRestore", "Disable-JobTrigger", "Disable-LocalUser", "Disable-PSBreakpoint", "Disable-PSRemoting",
  "Disable-PSSessionConfiguration", "Disable-PSTrace", "Disable-PSWSManCombinedTrace", "Disable-RunspaceDebug",
  "Disable-ScheduledJob", "Disable-WSManCredSSP", "Disable-WSManTrace", "Disconnect-PSSession", "Disconnect-WSMan",
  "Enable-ComputerRestore", "Enable-JobTrigger", "Enable-LocalUser", "Enable-PSBreakpoint", "Enable-PSRemoting",
  "Enable-PSSessionConfiguration", "Enable-PSTrace", "Enable-PSWSManCombinedTrace", "Enable-RunspaceDebug",
  "Enable-ScheduledJob", "Enable-WSManCredSSP", "Enable-WSManTrace", "Enter-PSHostProcess", "Enter-PSSession",
  "Exit-PSHostProcess", "Exit-PSSession", "Expand-Archive", "Export-Alias", "Export-BinaryMiLog", "Export-Clixml",
  "Export-Console", "Export-Counter", "Export-Csv", "Export-FormatData", "Export-ModuleMember",
  "Export-ODataEndpointProxy", "Export-PSSession", "ForEach-Object", "Format-Custom", "Format-Hex", "Format-List",
  "Format-Table", "Format-Wide", "Get-Acl", "Get-Alias", "Get-AuthenticodeSignature", "Get-ChildItem",
  "Get-CimAssociatedInstance", "Get-CimClass", "Get-CimInstance", "Get-CimSession", "Get-Clipboard",
  "Get-CmsMessage", "Get-Command", "Get-ComputerInfo", "Get-ComputerRestorePoint", "Get-Content",
  "Get-ControlPanelItem", "Get-Counter", "Get-Credential", "Get-Culture", "Get-Date", "Get-Event", "Get-EventLog",
  "Get-EventSubscriber", "Get-ExecutionPolicy", "Get-FileHash", "Get-FormatData", "Get-Help", "Get-History",
  "Get-Host", "Get-HotFix", "Get-IseSnippet", "Get-Item", "Get-ItemProperty", "Get-ItemPropertyValue", "Get-Job",
  "Get-JobTrigger", "Get-LocalGroup", "Get-LocalGroupMember", "Get-LocalUser", "Get-Location", "Get-LogProperties",
  "Get-Member", "Get-Module", "Get-OperationValidation", "Get-PfxCertificate", "Get-Process", "Get-PSBreakpoint",
  "Get-PSCallStack", "Get-PSDrive", "Get-PSHostProcessInfo", "Get-PSProvider", "Get-PSReadLineKeyHandler",
  "Get-PSReadLineOption", "Get-PSSession", "Get-PSSessionCapability", "Get-PSSessionConfiguration", "Get-PSSnapin",
  "Get-Random", "Get-Runspace", "Get-RunspaceDebug", "Get-ScheduledJob", "Get-ScheduledJobOption", "Get-Service",
  "Get-TimeZone", "Get-TraceSource", "Get-Transaction", "Get-TypeData", "Get-UICulture", "Get-Unique",
  "Get-Variable", "Get-Verb", "Get-WinEvent", "Get-WmiObject", "Get-WSManCredSSP", "Get-WSManInstance",
  "Group-Object", "Import-Alias", "Import-BinaryMiLog", "Import-Clixml", "Import-Counter", "Import-Csv",
  "Import-IseSnippet", "Import-LocalizedData", "Import-Module", "Import-PowerShellDataFile", "Import-PSSession",
  "Invoke-AsWorkflow", "Invoke-CimMethod", "Invoke-Command", "Invoke-Expression", "Invoke-History", "Invoke-Item",
  "Invoke-OperationValidation", "Invoke-RestMethod", "Invoke-WebRequest", "Invoke-WmiMethod", "Invoke-WSManAction",
  "Join-Path", "Limit-EventLog", "Measure-Command", "Measure-Object", "Move-Item", "Move-ItemProperty", "New-Alias",
  "New-CimInstance", "New-CimSession", "New-CimSessionOption", "New-Event", "New-EventLog", "New-FileCatalog",
  "New-Guid", "New-IseSnippet", "New-Item", "New-ItemProperty", "New-JobTrigger", "New-LocalGroup", "New-LocalUser",
  "New-Module", "New-ModuleManifest", "New-Object", "New-PSDrive", "New-PSRoleCapabilityFile", "New-PSSession",
  "New-PSSessionConfigurationFile", "New-PSSessionOption", "New-PSTransportOption", "New-PSWorkflowExecutionOption",
  "New-PSWorkflowSession", "New-ScheduledJobOption", "New-Service", "New-TemporaryFile", "New-TimeSpan",
  "New-Variable", "New-WebServiceProxy", "New-WinEvent", "New-WSManInstance", "New-WSManSessionOption",
  "Out-Default", "Out-File", "Out-GridView", "Out-Host", "Out-Null", "Out-Printer", "Out-String", "Pop-Location",
  "Protect-CmsMessage", "Push-Location", "Read-Host", "Receive-Job", "Receive-PSSession",
  "Register-ArgumentCompleter", "Register-CimIndicationEvent", "Register-EngineEvent", "Register-ObjectEvent",
  "Register-PSSessionConfiguration", "Register-ScheduledJob", "Register-WmiEvent", "Remove-CimInstance",
  "Remove-CimSession", "Remove-Computer", "Remove-Event", "Remove-EventLog", "Remove-Item", "Remove-ItemProperty",
  "Remove-Job", "Remove-JobTrigger", "Remove-LocalGroup", "Remove-LocalGroupMember", "Remove-LocalUser",
  "Remove-Module", "Remove-PSBreakpoint", "Remove-PSDrive", "Remove-PSReadLineKeyHandler", "Remove-PSSession",
  "Remove-PSSnapin", "Remove-TypeData", "Remove-Variable", "Remove-WmiObject", "Remove-WSManInstance",
  "Rename-Computer", "Rename-Item", "Rename-ItemProperty", "Rename-LocalGroup", "Rename-LocalUser",
  "Reset-ComputerMachinePassword", "Resolve-Path", "Restart-Computer", "Restart-Service", "Restore-Computer",
  "Resume-Job", "Resume-Service", "Save-Help", "Select-Object", "Select-String", "Select-Xml", "Send-MailMessage",
  "Set-Acl", "Set-Alias", "Set-AuthenticodeSignature", "Set-CimInstance", "Set-Clipboard", "Set-Content", "Set-Date",
  "Set-ExecutionPolicy", "Set-Item", "Set-ItemProperty", "Set-JobTrigger", "Set-LocalGroup", "Set-LocalUser",
  "Set-Location", "Set-LogProperties", "Set-PSBreakpoint", "Set-PSDebug", "Set-PSReadLineKeyHandler",
  "Set-PSReadLineOption", "Set-PSSessionConfiguration", "Set-ScheduledJob", "Set-ScheduledJobOption", "Set-Service",
  "Set-StrictMode", "Set-TimeZone", "Set-TraceSource", "Set-Variable", "Set-WmiInstance", "Set-WSManInstance",
  "Set-WSManQuickConfig", "Show-Command", "Show-ControlPanelItem", "Show-EventLog", "Sort-Object", "Split-Path",
  "Start-Job", "Start-Process", "Start-Service", "Start-Sleep", "Start-Trace", "Start-Transaction",
  "Start-Transcript", "Stop-Computer", "Stop-Job", "Stop-Process", "Stop-Service", "Stop-Trace", "Stop-Transcript",
  "Suspend-Job", "Suspend-Service", "Tee-Object", "Test-ComputerSecureChannel", "Test-Connection",
  "Test-FileCatalog", "Test-ModuleManifest", "Test-Path", "Test-PSSessionConfigurationFile", "Test-WSMan",
  "Trace-Command", "Unblock-File", "Undo-Transaction", "Unprotect-CmsMessage", "Unregister-Event",
  "Unregister-PSSessionConfiguration", "Unregister-ScheduledJob", "Update-FormatData", "Update-Help", "Update-List",
  "Update-TypeData", "Use-Transaction", "Wait-Debugger", "Wait-Event", "Wait-Job", "Wait-Process", "Where-Object",
  "Write-Debug", "Write-Error", "Write-EventLog", "Write-Host", "Write-Information", "Write-Output",
  "Write-Progress", "Write-Verbose", "Write-Warning"
];

/** PowerShell 7.7.0's commands as installed on Linux, 288. */
export const POWERSHELL_7_COMMANDS: readonly string[] = [
  "Add-Content", "Add-History", "Add-Member", "Add-Type", "Clear-Content", "Clear-History", "Clear-Item",
  "Clear-ItemProperty", "Clear-Variable", "Compare-Object", "Compress-Archive", "Compress-PSResource",
  "Convert-Path", "ConvertFrom-CliXml", "ConvertFrom-Csv", "ConvertFrom-Json", "ConvertFrom-Markdown",
  "ConvertFrom-SecureString", "ConvertFrom-StringData", "ConvertTo-CliXml", "ConvertTo-Csv", "ConvertTo-Html",
  "ConvertTo-Json", "ConvertTo-SecureString", "ConvertTo-Xml", "Copy-Item", "Copy-ItemProperty", "Debug-Job",
  "Debug-Process", "Debug-Runspace", "Disable-ExperimentalFeature", "Disable-PSBreakpoint", "Disable-RunspaceDebug",
  "Enable-ExperimentalFeature", "Enable-PSBreakpoint", "Enable-RunspaceDebug", "Enter-PSHostProcess",
  "Enter-PSSession", "Exit-PSHostProcess", "Exit-PSSession", "Expand-Archive", "Export-Alias", "Export-Clixml",
  "Export-Csv", "Export-FormatData", "Export-ModuleMember", "Export-PSSession", "Find-Command", "Find-DscResource",
  "Find-Module", "Find-Package", "Find-PackageProvider", "Find-PSResource", "Find-RoleCapability", "Find-Script",
  "ForEach-Object", "Format-Custom", "Format-Hex", "Format-List", "Format-Table", "Format-Wide", "Get-Alias",
  "Get-ChildItem", "Get-Clipboard", "Get-CmsMessage", "Get-Command", "Get-Content", "Get-Credential",
  "Get-CredsFromCredentialProvider", "Get-Culture", "Get-Date", "Get-Error", "Get-Event", "Get-EventSubscriber",
  "Get-ExecutionPolicy", "Get-ExperimentalFeature", "Get-FileHash", "Get-FormatData", "Get-Help", "Get-History",
  "Get-Host", "Get-InstalledModule", "Get-InstalledPSResource", "Get-InstalledScript", "Get-Item",
  "Get-ItemProperty", "Get-ItemPropertyValue", "Get-Job", "Get-Location", "Get-MarkdownOption", "Get-Member",
  "Get-Module", "Get-Package", "Get-PackageProvider", "Get-PackageSource", "Get-PfxCertificate", "Get-Process",
  "Get-PSBreakpoint", "Get-PSCallStack", "Get-PSDrive", "Get-PSHostProcessInfo", "Get-PSProvider",
  "Get-PSReadLineKeyHandler", "Get-PSReadLineOption", "Get-PSRepository", "Get-PSResourceRepository",
  "Get-PSScriptFileInfo", "Get-PSSession", "Get-PSSubsystem", "Get-Random", "Get-Runspace", "Get-RunspaceDebug",
  "Get-SecureRandom", "Get-TimeZone", "Get-TraceSource", "Get-TypeData", "Get-UICulture", "Get-Unique", "Get-Uptime",
  "Get-Variable", "Get-Verb", "Group-Object", "Import-Alias", "Import-Clixml", "Import-Csv", "Import-LocalizedData",
  "Import-Module", "Import-PackageProvider", "Import-PowerShellDataFile", "Import-PSGetRepository",
  "Import-PSSession", "Install-Module", "Install-Package", "Install-PackageProvider", "Install-PSResource",
  "Install-Script", "Invoke-Command", "Invoke-Expression", "Invoke-History", "Invoke-Item", "Invoke-RestMethod",
  "Invoke-WebRequest", "Join-Path", "Join-String", "Measure-Command", "Measure-Object", "Move-Item",
  "Move-ItemProperty", "New-Alias", "New-Event", "New-Guid", "New-Item", "New-ItemProperty", "New-Module",
  "New-ModuleManifest", "New-Object", "New-PSDrive", "New-PSRoleCapabilityFile", "New-PSScriptFileInfo",
  "New-PSSession", "New-PSSessionConfigurationFile", "New-PSSessionOption", "New-PSTransportOption",
  "New-ScriptFileInfo", "New-TemporaryDirectory", "New-TemporaryFile", "New-TimeSpan", "New-Variable", "Out-Default",
  "Out-File", "Out-Host", "Out-Null", "Out-String", "Pop-Location", "Protect-CmsMessage", "PSConsoleHostReadLine",
  "Publish-Module", "Publish-PSResource", "Publish-Script", "Push-Location", "Read-Host", "Receive-Job",
  "Register-ArgumentCompleter", "Register-EngineEvent", "Register-ObjectEvent", "Register-PackageSource",
  "Register-PSRepository", "Register-PSResourceRepository", "Remove-Alias", "Remove-Event", "Remove-Item",
  "Remove-ItemProperty", "Remove-Job", "Remove-Module", "Remove-PSBreakpoint", "Remove-PSDrive",
  "Remove-PSReadLineKeyHandler", "Remove-PSSession", "Remove-TypeData", "Remove-Variable", "Rename-Item",
  "Rename-ItemProperty", "Reset-PSResourceRepository", "Resolve-Path", "Restart-Computer", "Save-Help",
  "Save-Module", "Save-Package", "Save-PSResource", "Save-Script", "Select-Object", "Select-String", "Select-Xml",
  "Send-MailMessage", "Set-Alias", "Set-Clipboard", "Set-Content", "Set-Date", "Set-ExecutionPolicy", "Set-Item",
  "Set-ItemProperty", "Set-Location", "Set-MarkdownOption", "Set-PackageSource", "Set-PSBreakpoint", "Set-PSDebug",
  "Set-PSReadLineKeyHandler", "Set-PSReadLineOption", "Set-PSRepository", "Set-PSResourceRepository",
  "Set-StrictMode", "Set-TraceSource", "Set-Variable", "Show-Markdown", "Sort-Object", "Split-Path", "Start-Job",
  "Start-Process", "Start-Sleep", "Start-ThreadJob", "Start-Transcript", "Stop-Computer", "Stop-Job", "Stop-Process",
  "Stop-Transcript", "Switch-Process", "Tee-Object", "Test-Connection", "Test-Json", "Test-ModuleManifest",
  "Test-Path", "Test-PSScriptFileInfo", "Test-ScriptFileInfo", "Trace-Command", "Unblock-File", "Uninstall-Module",
  "Uninstall-Package", "Uninstall-PSResource", "Uninstall-Script", "Unprotect-CmsMessage", "Unregister-Event",
  "Unregister-PackageSource", "Unregister-PSRepository", "Unregister-PSResourceRepository", "Update-FormatData",
  "Update-Help", "Update-List", "Update-Module", "Update-ModuleManifest", "Update-PSModuleManifest",
  "Update-PSResource", "Update-PSScriptFileInfo", "Update-Script", "Update-ScriptFileInfo", "Update-TypeData",
  "Wait-Debugger", "Wait-Event", "Wait-Job", "Wait-Process", "Where-Object", "Write-Debug", "Write-Error",
  "Write-Host", "Write-Information", "Write-Output", "Write-Progress", "Write-Verbose", "Write-Warning"
];

/**
 * The modules PowerShell installs with itself, in either edition, case-folded: the modules the lists of commands above
 * were read from. A command qualified by one, `Microsoft.PowerShell.Utility\New-Object`, is PowerShell's own, which no
 * function of the workspace answers and no script of that path runs (pwsh 7.7.0, measured 2026-11-21).
 */
export const SHIPPED_MODULES: ReadonlySet<string> = new Set([
  "CimCmdlets", "ISE", "Microsoft.PowerShell.Archive", "Microsoft.PowerShell.Core", "Microsoft.PowerShell.Diagnostics",
  "Microsoft.PowerShell.Host", "Microsoft.PowerShell.LocalAccounts", "Microsoft.PowerShell.Management",
  "Microsoft.PowerShell.ODataUtils", "Microsoft.PowerShell.Operation.Validation", "Microsoft.PowerShell.PSResourceGet",
  "Microsoft.PowerShell.Security", "Microsoft.PowerShell.ThreadJob", "Microsoft.PowerShell.Utility", "Microsoft.WSMan.Management",
  "PackageManagement", "PowerShellGet", "PSDiagnostics", "PSReadLine", "PSScheduledJob", "PSWorkflow", "PSWorkflowUtility"
].map((name) => name.toLowerCase()));

/** Every shipped command's name, case-folded, as PowerShell compares command names. */
export const SHIPPED_COMMANDS: ReadonlySet<string> = new Set([...WINDOWS_POWERSHELL_51_COMMANDS, ...POWERSHELL_7_COMMANDS].map((name) => name.toLowerCase()));
