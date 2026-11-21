$script:ModuleRoot = $PSScriptRoot

# Every public function, one file each.
$public = @(Get-ChildItem -Path "$script:ModuleRoot/Public" -Filter *.ps1)
foreach ($file in $public) {
    . $file.FullName
}

# The private helpers.
Get-ChildItem "$PSScriptRoot\Private\*.ps1" | ForEach-Object { . $_.FullName }

Export-ModuleMember -Function Get-Tool, Set-Tool
