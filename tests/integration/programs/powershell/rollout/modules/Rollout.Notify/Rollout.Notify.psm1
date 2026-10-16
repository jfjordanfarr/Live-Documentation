# Tells the operators what a rollout did. The public functions are listed once, in $public, and exported
# from that list, as an estate's modules often do; which names it holds is known only when the module runs.

$public = @('Send-RolloutNotice', 'Format-RolloutNotice')

<#
.SYNOPSIS
Writes a notice of the rollout for the operators.

.PARAMETER Message
What the notice says.
#>
function Send-RolloutNotice {
    param([Parameter(Mandatory)][string]$Message)
    Write-Host (Format-RolloutNotice -Message $Message)
}

<#
.SYNOPSIS
Formats a notice: the prefix and the message.

.PARAMETER Message
What the notice says.
#>
function Format-RolloutNotice {
    param([string]$Message)
    "$(Get-NoticePrefix) $Message"
}

function Get-NoticePrefix {
    '[rollout notice]'
}

Export-ModuleMember -Function $public
