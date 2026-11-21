<#
.SYNOPSIS
Prints, as JSON, the names a clean PowerShell session answers by itself: the cmdlets and functions of the modules
PowerShell installs with itself, the functions it defines without a module, and the aliases it defines at start.

.DESCRIPTION
Run it as `pwsh -NoProfile -NonInteractive -File scripts/oracle/powershell-shipped.ps1`, so that no profile adds a
name. It is the source of PowerShell 7's half of the PowerShell reader's list of shipped names
(packages/engine/src/live-docs/adapters/powershell.builtins.ts), and the PowerShell grader runs it on the machine's own
pwsh to grade that list (scripts/oracle/powershell-wires.ts). Windows PowerShell 5.1's half cannot be produced here,
since no Windows runs it; the list takes it from Microsoft's documentation, and says so where it is written.

A module counts as PowerShell's own when it lies under $PSHOME, and Microsoft.PowerShell.Core, which is built in. The
functions PowerShell defines without a module are those Get-Command lists with no module, and the aliases those Get-Alias
lists, each with the command it names; both are read first, in this session, which has defined nothing of its own and
imported nothing, since listing a module's commands may import it and bring its aliases in.
#>
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$functions = @(Get-Command -CommandType Function | Where-Object { -not $_.ModuleName } | ForEach-Object Name)
$aliases = @(Get-Alias | Sort-Object Name | ForEach-Object { [ordered]@{ name = $_.Name; definition = $_.Definition } })

$home_ = [System.IO.Path]::GetFullPath($PSHOME)
$installed = Get-Module -ListAvailable | Where-Object { [System.IO.Path]::GetFullPath($_.ModuleBase).StartsWith($home_) } | ForEach-Object Name
$modules = @(@('Microsoft.PowerShell.Core') + @($installed) | Sort-Object -Unique)
$commands = foreach ($module in $modules) {
    Get-Command -Module $module -CommandType Cmdlet, Function -ErrorAction SilentlyContinue | ForEach-Object Name
}

[ordered]@{
    version   = $PSVersionTable.PSVersion.ToString()
    edition   = $PSVersionTable.PSEdition
    platform  = [System.Environment]::OSVersion.Platform.ToString()
    os        = $PSVersionTable.OS
    modules   = $modules
    commands  = @($commands | Sort-Object -Unique)
    functions = @($functions | Sort-Object -Unique)
    aliases   = $aliases
} | ConvertTo-Json -Depth 4
