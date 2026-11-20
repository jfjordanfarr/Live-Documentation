# Which assignments and dot-sources reach an It, under the Pester that runs this file.
$fileLevel = 'set'
. "$PSScriptRoot/AtFile.ps1"
Describe 'outer' {
    $describeBody = 'set'
    $script:describeScript = 'set'
    . "$PSScriptRoot/InDescribe.ps1"
    BeforeAll { $beforeAll = 'set'; . "$PSScriptRoot/InBeforeAll.ps1"; @{ fileLevel = [bool](Get-Variable fileLevel -ErrorAction SilentlyContinue); describeBody = [bool](Get-Variable describeBody -ErrorAction SilentlyContinue) } | ConvertTo-Json -Compress | Set-Content -Path ($env:PROBE_OUT + '.beforeall') }
    BeforeEach { $beforeEach = 'set'; . "$PSScriptRoot/InBeforeEach.ps1" }
    Context 'inner' {
        $contextBody = 'set'
        BeforeAll { $contextBeforeAll = 'set' }
        It 'reports' {
            $seen = [ordered]@{}
            foreach ($name in 'fileLevel', 'describeBody', 'describeScript', 'beforeAll', 'beforeEach', 'contextBody', 'contextBeforeAll') {
                $seen[$name] = [bool](Get-Variable -Name $name -ErrorAction SilentlyContinue)
            }
            foreach ($name in 'Get-AtFile', 'Get-InDescribe', 'Get-InBeforeAll', 'Get-InBeforeEach') {
                $seen[$name] = [bool](Get-Command -Name $name -ErrorAction SilentlyContinue)
            }
            $seen | ConvertTo-Json | Set-Content -Path $env:PROBE_OUT
        }
    }
}
