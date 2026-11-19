Set-StrictMode -Version Latest
$script:DataRoot = 'data'

<#
.SYNOPSIS
The folder the deployment writes its data to.
#>
function Get-DataPath {
    Join-Path $script:DataRoot 'releases'
}
