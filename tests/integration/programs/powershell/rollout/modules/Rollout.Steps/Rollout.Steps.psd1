@{
    RootModule        = 'Rollout.Steps.psm1'
    ModuleVersion     = '1.0.0'
    GUID              = '6f0c2a52-3b7e-4c1d-9a51-2d7f6b8e4c10'
    Author            = 'Live Documentation'
    Description       = 'Plans the steps of a rollout and runs them.'
    PowerShellVersion = '7.0'
    RequiredModules   = @(@{ ModuleName = 'Microsoft.PowerShell.Utility'; ModuleVersion = '7.0.0.0' })
    FunctionsToExport = @('New-RolloutStep', 'Get-RolloutPlan', 'Select-PendingStep', 'Invoke-RolloutStep', 'Format-RolloutReport')
    CmdletsToExport   = @()
    VariablesToExport = @()
    AliasesToExport   = @()
}
