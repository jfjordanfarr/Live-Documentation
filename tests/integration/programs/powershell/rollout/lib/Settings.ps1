function Read-RolloutSettings {
    # Reads the targets file. This comment is not help: it has no help keyword.
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Path)
    Import-PowerShellDataFile -Path $Path
}

$script:SettingsNote = 'function Not-A-Function { } # is a string, not code'
$script:SettingsBanner = "settings # read by $($PSVersionTable.PSEdition) PowerShell, function text included"
