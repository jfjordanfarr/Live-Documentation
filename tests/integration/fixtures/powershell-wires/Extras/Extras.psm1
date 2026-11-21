# Loads its helpers by names written out, once in a foreach and once through a pipeline.
foreach ($helper in @('One.ps1')) {
    . (Join-Path $PSScriptRoot $helper)
}
'Two.ps1' | ForEach-Object { . "$PSScriptRoot\$_" }
