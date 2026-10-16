using module ./modules/Rollout.Targets/Rollout.Targets.psm1
#requires -Version 7.0
#requires -Modules Microsoft.PowerShell.Utility
#requires -Modules @{ ModuleName = 'Microsoft.PowerShell.Management'; ModuleVersion = '1.0' }

<#
.SYNOPSIS
Rolls a release out to the targets of one environment.

.DESCRIPTION
Reads the environment's targets from config/targets.psd1, plans a copy, a
restart and a verification for each, and runs the steps that change something.
Run it from this directory; -WhatIf plans without running.

.PARAMETER Environment
The environment to roll out to, as named in config/targets.psd1.

.PARAMETER Release
The release being rolled out.
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [ValidateSet('staging', 'production')]
    [string]$Environment,

    [string]$Release = '1.0.0'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot/lib/Logging.ps1"
. ./lib/Settings.ps1
Import-Module "$PSScriptRoot/modules/Rollout.Steps/Rollout.Steps.psd1" -Force -ErrorAction Stop
Import-Module Microsoft.PowerShell.Utility
Import-Module $PSScriptRoot\modules\Rollout.Notify\Rollout.Notify.psm1 -Force

<#
.SYNOPSIS
Stops the rollout when an environment has no targets.

.PARAMETER Targets
The targets read for the environment.
#>

function Assert-RolloutTarget {
    param([object[]]$Targets)
    if (-not $Targets) {
        throw "No targets are configured for $Environment."
    }
}

Write-RolloutBanner -Title "Rollout $Release to $Environment"
$settings = Read-RolloutSettings -Path "$PSScriptRoot/config/targets.psd1"
$targets = @(Get-RolloutTarget -Settings $settings -Environment $Environment)
Assert-RolloutTarget -Targets $targets
$plan = Get-RolloutPlan -Targets ($targets | ForEach-Object { $_.Name })

if ($PSCmdlet.ShouldProcess($Environment, "roll out $Release")) {
    $done = $plan | Select-PendingStep | Invoke-RolloutStep
    foreach ($step in $done) {
        Write-RolloutLog "done: $($step.Action) on $($step.Target)"
    }
}

Format-RolloutReport -Steps $plan
Send-RolloutNotice -Message "planned $($plan.Count) steps of $Release for $Environment"
