Using module Microsoft.PowerShell.Utility
#requires -Modules Microsoft.PowerShell.Management

. "./Common/Logging.ps1"
Import-Module "./modules/Inventory.psm1"

<#
.SYNOPSIS
Deploys compiled artifacts to the requested region.

.DESCRIPTION
Wraps shared logging and inventory refresh helpers so deployments stay observable.

.PARAMETER Region
The geographic region to target during deployment operations.
#>
function Invoke-Deployment {
    param(
        [string]$Region = "us-east"
    )

    Write-DeploymentLog "Deploying to $Region"
    Get-InventorySnapshot -Region $Region
}

Invoke-Deployment
