# Plans the steps of a rollout and runs them.

$script:StepCount = 0

function New-RolloutStep {
    <#
    .SYNOPSIS
    Describes one step of a rollout: a target and the action taken on it.

    .PARAMETER Target
    The host the step acts on.

    .PARAMETER Action
    What the step does: copy, restart or verify.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Target,
        [ValidateSet('copy', 'restart', 'verify')][string]$Action = 'copy'
    )
    $script:StepCount++
    [pscustomobject]@{ Number = $script:StepCount; Target = $Target; Action = $Action }
}

<#
.SYNOPSIS
Plans a rollout: a copy, a restart and a verification for each target.
#>
function Get-RolloutPlan {
    param([string[]]$Targets)

    function Get-StepAction {
        'copy', 'restart', 'verify'
    }

    foreach ($target in $Targets) {
        foreach ($action in Get-StepAction) {
            New-RolloutStep -Target $target -Action $action
        }
    }
}

filter Select-PendingStep {
    if ($_.Action -ne 'verify') { $_ }
}

function Invoke-RolloutStep {
    param([Parameter(ValueFromPipeline)]$Step)
    process {
        Write-Verbose "Step $($Step.Number): $($Step.Action) on $($Step.Target)"
        $Step
    }
    <#
    .SYNOPSIS
    Runs one step and passes it on.

    .PARAMETER Step
    The step, as New-RolloutStep made it.
    #>
}

function Format-RolloutReport {
    param([object[]]$Steps)
    $Steps | Format-Table Number, Target, Action -AutoSize | Out-String
}

function Get-StepCount {
    $script:StepCount
}

Export-ModuleMember -Function New-RolloutStep, Get-RolloutPlan, Select-PendingStep, Invoke-RolloutStep, Format-RolloutReport
