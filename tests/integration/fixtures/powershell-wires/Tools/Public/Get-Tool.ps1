<#
.SYNOPSIS
Finds a tool by name.
#>
function Get-Tool {
    param([string]$Name)
    Format-Tool -Name $Name
}
