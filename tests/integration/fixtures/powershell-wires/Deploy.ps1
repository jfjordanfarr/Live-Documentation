<#
.SYNOPSIS
Deploys a release: loads its helpers and the Tools module by Join-Path, then runs the step scripts.
#>
[CmdletBinding()]
param(
    [string]$Release = 'current'
)

. (Join-Path $PSScriptRoot 'lib\Common.ps1')
. (Join-Path -Path $PSScriptRoot -ChildPath 'lib/Paths.ps1' -Resolve)
$helper = Join-Path $PSScriptRoot 'lib/Helper.ps1'
. $helper
. "$PSScriptRoot/lib/Settings.inc.ps1"
Import-Module (Join-Path $PSScriptRoot 'Tools') -Force

Write-Log "Deploying $Release to $(Get-DataPath)"
$tool = Get-Tool -Name $Release
Set-Tool -Name $tool -Value (Get-Setting -Name Region)
& "$PSScriptRoot\scripts\Run-Step.ps1" -Step publish
./scripts/Clean.ps1
