param(
    [Parameter(Mandatory)][string]$Step
)

# Run by Deploy.ps1, whose helpers it sees: a script run by its path runs in a child scope of its caller's.
Write-Log "Running step $Step"
