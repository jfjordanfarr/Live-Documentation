<#
.SYNOPSIS
Writes a line of the deployment's log.
#>
function Write-Log {
    param([string]$Message)
    Write-Host "[deploy] $Message"
}

<#
.SYNOPSIS
Reads one setting of the deployment.
#>
function Get-Setting {
    param([string]$Name)
    $Settings[$Name]
}
