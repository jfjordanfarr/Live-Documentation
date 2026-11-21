# Finds its neighbours the Windows PowerShell 5.1 way, by its own path.
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$here\lib\Common.ps1"

Write-Log 'found by Split-Path'
