if (-not (Get-Module -Name Microsoft.PowerShell.Archive)) {
    Import-Module Microsoft.PowerShell.Archive
}

<#
.SYNOPSIS
Packs a release folder into an archive.
#>
function Compress-Release {
    param([string]$Folder)
    Compress-Archive -Path $Folder -DestinationPath "$Folder.zip"
}
