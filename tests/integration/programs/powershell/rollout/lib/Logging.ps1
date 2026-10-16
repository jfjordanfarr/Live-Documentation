<#
.SYNOPSIS
Writes one line of the rollout log, stamped with the time.

.PARAMETER Message
The line to write.
#>
function Write-RolloutLog {
    param([Parameter(Mandatory)][string]$Message)
    $stamp = Get-Date -Format 'HH:mm:ss'
    Write-Host "$(Get-LogPrefix) [$stamp] $Message"
}

# The banner is a here-string: neither its '#' lines nor the word 'function'
# inside it are code, which a reader of the text alone would take them for.
function Write-RolloutBanner {
    param([string]$Title)
    $banner = @"
##################################################
# $Title
# function Fake-Function { } is text, not a definition
##################################################
"@
    Write-Host $banner
}

function script:Get-LogPrefix {
    '#rollout'
}
