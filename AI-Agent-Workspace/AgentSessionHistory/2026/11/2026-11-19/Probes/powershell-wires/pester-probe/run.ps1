# Runs Probe.Tests.ps1 under each saved Pester and prints what reached the It.
param([Parameter(Mandatory)][string]$PesterRoot, [Parameter(Mandatory)][string]$ProbeDir)
foreach ($name in 'AtFile', 'InDescribe', 'InBeforeAll', 'InBeforeEach') {
    Set-Content -Path (Join-Path $ProbeDir "$name.ps1") -Value "function Get-$name { }"
}
foreach ($version in (Get-ChildItem $PesterRoot -Directory | Sort-Object { [version]$_.Name })) {
    $out = Join-Path $ProbeDir "seen-$($version.Name).json"
    Remove-Item $out -ErrorAction SilentlyContinue
    $manifest = Get-ChildItem -Recurse -Path $version.FullName -Filter Pester.psd1 | Select-Object -First 1
    $script = "`$env:TEMP = '/home/node/.t-psw/ptemp'; `$env:PROBE_OUT = '$out'; Import-Module '$($manifest.FullName)'; " +
        $(if ([version]$version.Name -ge [version]'5.0.0') { "Invoke-Pester -Path '$ProbeDir/Probe.Tests.ps1' -Output None" } else { "Invoke-Pester -Script '$ProbeDir/Probe.Tests.ps1' -Quiet" })
    pwsh -NoProfile -NonInteractive -Command $script *> (Join-Path $ProbeDir "log-$($version.Name).txt")
    "== Pester $($version.Name)"
    if (Test-Path $out) { (Get-Content $out -Raw | ConvertFrom-Json).PSObject.Properties | ForEach-Object { "   $($_.Name): $($_.Value)" } } else { "   no report; log:"; Get-Content (Join-Path $ProbeDir "log-$($version.Name).txt") | Select-Object -First 15 }
}
