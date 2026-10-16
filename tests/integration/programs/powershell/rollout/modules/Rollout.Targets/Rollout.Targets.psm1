# The hosts of each environment, as typed objects. A script reaches the class
# through `using module`, which `Import-Module` does not give it.

enum TargetTier {
    Web
    Worker
}

class RolloutTarget {
    [string]$Name
    [TargetTier]$Tier

    RolloutTarget([string]$name, [TargetTier]$tier) {
        $this.Name = $name
        $this.Tier = $tier
    }

    [string] ToString() {
        return "$($this.Name) ($($this.Tier))"
    }
}

<#
.SYNOPSIS
Reads the targets of one environment from the settings.

.PARAMETER Settings
The settings, as config/targets.psd1 holds them.

.PARAMETER Environment
The environment whose targets are wanted.
#>
function Get-RolloutTarget {
    param([hashtable]$Settings, [string]$Environment)
    foreach ($entry in $Settings[$Environment]) {
        [RolloutTarget]::new($entry.Name, (ConvertTo-TargetTier $entry.Tier))
    }
}

function script:ConvertTo-TargetTier {
    param([string]$Name)
    [TargetTier]$Name
}

Export-ModuleMember -Function *
