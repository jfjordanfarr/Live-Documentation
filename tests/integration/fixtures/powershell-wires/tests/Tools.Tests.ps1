# A stub at the test's own level of a command another module supplies: working code never reaches it.
function Get-Vendor { param([string]$Name) 'stub' }

BeforeAll {
    Import-Module "$PSScriptRoot/../Tools/Tools.psd1" -Force
    $toolsRoot = Join-Path $PSScriptRoot '../Tools'
    . (Join-Path $toolsRoot 'Private/Format-Tool.ps1')
}

Describe 'Get-Tool' {
    BeforeAll {
        # A stub for this test only: it stands inside a block, and no other file sees it.
        function Write-Log { param([string]$Message) }
    }

    It 'formats the name' {
        Get-Tool -Name 'saw' | Should -Be 'tool:saw'
        Get-Vendor -Name 'saw' | Should -Be 'stub'
    }
}
