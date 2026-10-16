#requires -Version 7.0

<#
.SYNOPSIS
Prints the plan a rollout would run, without running it.

.PARAMETER Environment
The environment whose plan is printed.
#>
param([string]$Environment = 'staging')

. $PSScriptRoot\..\lib\Logging.ps1
Import-Module $PSScriptRoot\..\modules\Rollout.Steps\Rollout.Steps.psm1 -Force

$settings = Import-PowerShellDataFile -Path (Join-Path $PSScriptRoot '../config/targets.psd1')
$plan = Get-RolloutPlan -Targets ($settings[$Environment] | ForEach-Object { $_.Name })
Write-RolloutBanner -Title "Plan for $Environment"
Format-RolloutReport -Steps $plan
