<#
.SYNOPSIS
Sets a tool's value.
#>
function Set-Tool {
    param([string]$Name, [string]$Value)
    Write-Verbose "$(Format-Tool -Name $Name) = $Value"
}
