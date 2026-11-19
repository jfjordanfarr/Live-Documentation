BeforeAll {
    Import-Module "$PSScriptRoot/../Tools/Tools.psd1" -Force
}

Describe 'Get-Tool' {
    BeforeAll {
        # A stub for this test only: it stands inside a block, and no other file sees it.
        function Write-Log { param([string]$Message) }
    }

    It 'formats the name' {
        Get-Tool -Name 'saw' | Should -Be 'tool:saw'
    }
}
